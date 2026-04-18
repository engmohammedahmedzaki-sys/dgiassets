export class RegisterDto {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  whatsappNumber?: string;
  role: 'buyer' | 'seller';
}
