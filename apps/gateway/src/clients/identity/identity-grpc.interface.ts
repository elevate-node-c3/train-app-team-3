import { Observable } from "rxjs";

export interface IdentityGrpcService {
  register(data: { email: string; password: string }): Observable<{
    id: string;
    email: string;
    accessToken: string;
  }>;
  login(data: {
    email: string;
    password: string;
    deviceInfo?: string;
  }): Observable<{
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
  forgotPassword(data: { email: string; userId: string }): Observable<never>;
  verifyOtp(data: {
    email: string;
    otp: string;
    userId: string;
  }): Observable<never>;
}
