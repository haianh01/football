import { ActorUserDto } from '../../../common/dto/actor-user.dto';
import { TeamRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AddTeamMemberDto extends ActorUserDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsEnum(TeamRole)
  role?: TeamRole;
}
