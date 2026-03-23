import { ActorUserDto } from '../../../common/dto/actor-user.dto';
import { SkillLevel, UrgentPostStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateUrgentPostDto extends ActorUserDto {
  @IsString()
  matchId!: string;

  @IsString()
  teamId!: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(5)
  neededPlayers!: number;

  @IsOptional()
  @IsEnum(SkillLevel)
  skillLevel?: SkillLevel;

  @IsOptional()
  @IsString()
  feeShare?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  expiresAt!: string;

  @IsOptional()
  @IsEnum(UrgentPostStatus)
  status?: UrgentPostStatus;
}
