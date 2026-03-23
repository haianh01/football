import { PitchType } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateFieldDto {
  @IsString()
  name!: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsString()
  district!: string;

  @IsOptional()
  @IsString()
  googleMapsUrl?: string;

  @IsEnum(PitchType)
  pitchType!: PitchType;

  @IsOptional()
  @IsString()
  priceRange?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}

