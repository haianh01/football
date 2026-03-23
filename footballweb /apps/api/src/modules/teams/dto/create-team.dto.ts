import { SkillLevel } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  city!: string;

  @IsString()
  district!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(SkillLevel)
  skillLevel?: SkillLevel;

  @IsString()
  createdBy!: string;
}

