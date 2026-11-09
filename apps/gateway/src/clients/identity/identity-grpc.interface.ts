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
    refreshToken: string;
  }>;
  login(data: {
    email: string;
    password: string;
    deviceInfo?: string;
  }, metadata?: Metadata): Observable<{
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string;
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
  ): Observable<{ success: boolean }>;
  verifyOtp(data: {
    email: string;
    otp: string;
    userId: string;
  }, metadata?: Metadata): Observable<{ success: boolean }>;
  completeProfile(
    data: {
      email: string;
      fullName: string;
      phone: string;
      nationalId: string;
      profileType: string;
      nationality: string;
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
