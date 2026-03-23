import { IsString } from 'class-validator';

export class ActorUserDto {
  @IsString()
  actorUserId!: string;
}

