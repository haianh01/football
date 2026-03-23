import { ActorUserDto } from '../../../common/dto/actor-user.dto';
import { TeamRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateTeamMemberRoleDto extends ActorUserDto {
  @IsEnum(TeamRole)
  role!: TeamRole;
}
