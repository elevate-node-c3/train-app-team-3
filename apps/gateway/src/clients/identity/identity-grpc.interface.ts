import { Observable } from "rxjs";
import { Metadata } from "@grpc/grpc-js";

export interface IdentityGrpcService {
  register(data: {
    email: string;
    password: string;
  }, metadata?: Metadata): Observable<{
    id: string;
    email: string;
    accessToken: string;
  }>;
  login(data: {
    email: string;
    password: string;
    deviceInfo?: string;
  }, metadata?: Metadata): Observable<{
    id: string;
    email: string;
    accessToken: string;
  }>;
  logout(data: {
    userId: string;
    sessionId: string;
  }, metadata?: Metadata): Observable<{ success: boolean }>;
  validateSession(data: {
    userId: string;
    sessionId: string;
  }): Observable<{ active: boolean }>;
  forgotPassword(
    data: { email: string; userId: string },
    metadata?: Metadata,
  ): Observable<never>;
  verifyOtp(data: {
    email: string;
    otp: string;
    userId: string;
  }, metadata?: Metadata): Observable<never>;
}
