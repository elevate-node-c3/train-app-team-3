import { Observable } from "rxjs";
import { RegisterDto } from "../../modules/auth/dtos/register.dto";
import { LoginDto } from "../../modules/auth/dtos/login.dto";
import { Metadata } from "@grpc/grpc-js";

export interface IdentityAuthResponse {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export interface IdentityOperationResponse {
  success: boolean;
}

export interface IdentitySessionStatusResponse {
  active: boolean;
}

export interface IdentityCompleteProfileResponse {
  userId: string;
  fullName: string;
  egyptianMobileNumber: string;
  nationalId: string;
  complete: boolean;
}

export interface IdentityGrpcService {
  register(
    data: RegisterDto,
    metadata?: Metadata,
  ): Observable<IdentityAuthResponse>;
  login(
    data: LoginDto,
    metadata?: Metadata,
  ): Observable<IdentityAuthResponse>;
  logout(
    data: {
      userId: string;
      sessionId: string;
    },
    metadata?: Metadata,
  ): Observable<IdentityOperationResponse>;
  validateSession(data: {
    userId: string;
    sessionId: string;
  }): Observable<IdentitySessionStatusResponse>;
  forgotPassword(
    email: string,
    metadata?: Metadata,
  ): Observable<IdentityOperationResponse>;
  verifyOtp(
    data: {
      email: string;
      otp: string;
      userId: string;
    },
    metadata?: Metadata,
  ): Observable<IdentityOperationResponse>;
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
  ): Observable<IdentityCompleteProfileResponse>;
}
