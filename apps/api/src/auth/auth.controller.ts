import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './google-auth.service';

class RegisterDto {
  email!: string;
  password!: string;
  displayName?: string;
}

class LoginDto {
  email!: string;
  password!: string;
}

class GoogleAuthDto {
  idToken!: string;
}

class RefreshDto {
  refreshToken!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register with email and password' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.displayName);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('google')
  @ApiOperation({ summary: 'Login with Google ID token' })
  async googleLogin(@Body() dto: GoogleAuthDto) {
    return this.googleAuthService.exchangeIdToken(dto.idToken);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
