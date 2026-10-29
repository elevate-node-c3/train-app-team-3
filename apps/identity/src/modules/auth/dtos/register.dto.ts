export interface RegisterDto {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    nationalId: string;
}

export interface RegisterResponseDto {
    id: string;
    email: string;
    accessToken: string;
}