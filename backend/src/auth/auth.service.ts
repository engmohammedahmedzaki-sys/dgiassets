import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user
    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      fullName: registerDto.fullName,
      phoneNumber: registerDto.phoneNumber,
      whatsappNumber: registerDto.whatsappNumber,
      role: registerDto.role as any,
      emailVerificationCode: verificationCode,
    });

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    // Send verification email (non-blocking)
    this.emailService
      .sendVerificationCode(user.email, verificationCode, user.fullName)
      .catch(() => {});

    return {
      user: userWithoutPassword,
      token,
      message: 'تم إنشاء الحساب بنجاح. يرجى تفعيل بريدك الإلكتروني.',
    };
  }

  async login(loginDto: LoginDto) {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException(
        'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('هذا الحساب موقوف. يرجى التواصل مع الإدارة.');
    }

    // Check if user has password (might be Google user)
    if (!user.password) {
      throw new UnauthorizedException(
        'هذا الحساب مسجل عبر Google. الرجاء تسجيل الدخول بـ Google.',
      );
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      );
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      message: 'تم تسجيل الدخول بنجاح',
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findOne(userId);
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.emailVerificationCode !== code) {
      throw new UnauthorizedException('كود التفعيل غير صحيح');
    }

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      emailVerificationCode: null,
    });

    return { success: true, message: 'تم تفعيل البريد الإلكتروني بنجاح' };
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }

  generateTokenPublic(user: User): string {
    return this.generateToken(user);
  }

  async selectRole(userId: string, role: 'buyer' | 'seller') {
    if (!['buyer', 'seller'].includes(role)) {
      throw new UnauthorizedException('دور غير صالح');
    }
    await this.usersService.update(userId, {
      role: role as any,
      roleSelected: true,
    } as any);
    const user = await this.usersService.findOne(userId);
    return { user, message: 'تم اختيار الدور بنجاح' };
  }
}
