import { ActorUserDto } from '../../../common/dto/actor-user.dto';
import { MatchStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateMatchDto extends ActorUserDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  fieldId?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
