import { MatchStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  teamId!: string;

  @IsOptional()
  @IsString()
  fieldId?: string;

  @IsString()
  title!: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsString()
  district!: string;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  createdBy!: string;
}

