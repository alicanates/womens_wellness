import { Controller, Get, Patch, Body, UseGuards, Post, BadRequestException, Req, Query, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';

const pump = promisify(pipeline);

class UpdateProfileDto {
  displayName?: string;
  username?: string;
  birthYear?: number;
  heightCm?: number;
  weightKg?: number;
  timezone?: string;
  profilePictureUrl?: string;
  preferencesJson?: any;
}

class UpdateUserDto {
  email?: string;
  status?: string;
  password?: string;
}

@ApiTags('users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users/availability')
  @ApiOperation({ summary: 'Check username availability' })
  async checkUsernameAvailability(@Query('username') username: string) {
    if (!username) {
      throw new BadRequestException('Username is required');
    }
    const available = await this.usersService.isUsernameAvailable(username);
    return { available };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: any) {
    return this.usersService.getUserWithProfile(user.id);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user account' })
  async deleteMe(@CurrentUser() user: any) {
    return this.usersService.deleteUser(user.id);
  }

  // Admin endpoints
  @Get('users')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin)' })
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.usersService.getAllUsers(pageNum, limitNum);
  }

  @Get('users/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID (Admin)' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch('users/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user (Admin)' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user (Admin)' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Post('me/profile-picture')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiConsumes('multipart/form-data')
  async uploadProfilePicture(@CurrentUser() user: any, @Req() req: any) {
    try {
      const data = await req.file();

      if (!data) {
        throw new BadRequestException('File is required');
      }

      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(data.mimetype)) {
        throw new BadRequestException('Only image files are allowed (jpg, jpeg, png, gif, webp)');
      }

      // Generate unique filename
      const fileExtension = path.extname(data.filename);
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      const filename = `${randomName}${fileExtension}`;

      // Ensure upload directory exists
      const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Save file
      const filePath = path.join(uploadDir, filename);
      await pump(data.file, fs.createWriteStream(filePath));

      // Generate public URL (in production, this would be an S3 URL)
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000';
      const profilePictureUrl = `${baseUrl}/uploads/profiles/${filename}`;

      console.log('Updating profile with URL:', profilePictureUrl, 'for user:', user.id);

      // Update user profile with new picture URL
      try {
        const updatedUser = await this.usersService.updateProfile(user.id, { profilePictureUrl });
        console.log('Profile updated successfully, new URL:', updatedUser?.profile?.profilePictureUrl);
      } catch (updateError) {
        console.error('Failed to update profile:', updateError);
        throw new BadRequestException('Failed to update profile with picture URL');
      }

      return { profilePictureUrl };
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to upload profile picture');
    }
  }
}
