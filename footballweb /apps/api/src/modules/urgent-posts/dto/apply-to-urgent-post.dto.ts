import { IsOptional, IsString } from 'class-validator';

export class ApplyToUrgentPostDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  message?: string;
}

