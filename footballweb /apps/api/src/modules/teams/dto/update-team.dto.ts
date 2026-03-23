import { ActorUserDto } from '../../../common/dto/actor-user.dto';
import { SkillLevel } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTeamDto extends ActorUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(SkillLevel)
  skillLevel?: SkillLevel;
}
