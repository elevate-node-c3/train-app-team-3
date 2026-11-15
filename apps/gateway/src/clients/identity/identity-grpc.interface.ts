import { Observable } from "rxjs";
import { RegisterDto } from "../../modules/auth/dtos/register.dto";
import { LoginDto } from "../../modules/auth/dtos/login.dto";
import { Metadata } from "@grpc/grpc-js";

export interface IdentityGrpcService {
  register(
    data: RegisterDto,
    metadata?: Metadata,
  ): Observable<{
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string;
  }>;
  login(
    data: LoginDto,
    metadata?: Metadata,
  ): Observable<{
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string;
  }>;
  logout(
    data: {
      userId: string;
      sessionId: string;
    },
    metadata?: Metadata,
  ): Observable<{ success: boolean }>;
  validateSession(data: {
    userId: string;
    sessionId: string;
  }): Observable<{ active: boolean }>;
  forgotPassword(
    email: string,
    metadata?: Metadata,
  ): Observable<{ success: boolean }>;
  verifyOtp(
    data: {
      email: string;
      otp: string;
      userId: string;
    },
    metadata?: Metadata,
  ): Observable<{ success: boolean }>;
  completeProfile(
    data: {
      fullName: string;
      nationalId: string;
      profileType: string;
      nationality: string;
      phone: string;
      email: string;
    },
    metadata?: Metadata,
  ): Observable<{
    userId: string;
    fullName: string;
    egyptianMobileNumber: string;
    nationalId: string;
    complete: boolean;
  }>;
}
