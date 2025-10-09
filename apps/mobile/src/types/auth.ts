export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    displayName: string;
    dateOfBirth?: string;
    heightCm?: number;
    weightKg?: number;
    profilePictureUrl?: string;
    timezone?: string;
    country?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}
