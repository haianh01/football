import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  register(dto: RegisterDto) {
    return this.prisma.user.upsert({
      where: { email: dto.email },
      update: { name: dto.name },
      create: {
        name: dto.name,
        email: dto.email,
        preferredPositions: [],
      },
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    return {
      user,
      message: user
        ? 'Replace this with a real session or magic-link flow next.'
        : 'User not found. Register first.',
    };
  }
}

