import { Observable } from "rxjs";
import { SignUpDto } from "../dtos/signup.dto";
import { LoginDto } from "../dtos/login.dto";

export interface IdentityGrpcService {
  register(data: SignUpDto): Observable<{
    id: string;
    email: string;
    accessToken: string;
  }>;
  login(data: LoginDto): Observable<{
    id: string;
    email: string;
    accessToken: string;
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
    id: string;
    email: string;
    isProfileCompleted: boolean;
    accessToken: string;
  }>;
}
