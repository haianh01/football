import { SkillLevel, UrgentPostStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListUrgentPostsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsEnum(SkillLevel)
  skillLevel?: SkillLevel;

  @IsOptional()
  @IsEnum(UrgentPostStatus)
  status?: UrgentPostStatus;
}

