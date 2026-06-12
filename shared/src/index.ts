export interface AuthRegisterRequest {
  username: string;
  email: string;
  password: string;
  phone: string;
  preferredLanguage?: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface UserDto {
  id: string;
  email: string;
  phone?: string;
  username: string;
  preferredLanguage?: string;
  profileImageUrl?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: UserDto;
  token: string;
}
