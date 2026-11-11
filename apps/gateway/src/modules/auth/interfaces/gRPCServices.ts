import { Observable } from "rxjs";
import { LoginDto } from "../dtos/login.dto";
import { RegisterDto } from "../dtos/register.dto";

export interface IdentityGrpcService {
  register(data: RegisterDto): Observable<{
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string;
  }>;
  login(data: LoginDto): Observable<{
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string;
  }>;
  logout(data: {
    userId: string;
    sessionId: string;
  }): Observable<{ success: boolean }>;
  validateSession(data: {
    userId: string;
    sessionId: string;
  }): Observable<{ active: boolean }>;
  forgotPassword(data: {
    email: string;
    userId: string;
  }): Observable<{ success: boolean }>;
  verifyOtp(data: {
    email: string;
    otp: string;
    userId: string;
  }): Observable<{ success: boolean }>;
  completeProfile(data: {
    fullName: string;
    nationalId: string;
    profileType: string;
    nationality: string;
    phone: string;
    email: string;
  }): Observable<{
    userId: string;
    fullName: string;
    egyptianMobileNumber: string;
    nationalId: string;
    complete: boolean;
  }>;
}
