import { IsEmail, IsString, MinLength, IsIn, IsOptional, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'الاسم الكامل قصير جداً' })
  @MaxLength(120)
  fullName: string;

  @IsString()
  @MinLength(6, { message: 'رقم الهاتف غير صالح' })
  @MaxLength(20)
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsappNumber?: string;

  @IsIn(['buyer', 'seller'], { message: 'الدور يجب أن يكون مشترى أو بائع' })
  role: 'buyer' | 'seller';
}
