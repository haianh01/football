import { Injectable } from '@nestjs/common';
import { TeamAccessService } from '../../common/services/team-access.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamAccessService: TeamAccessService,
  ) {}

  async create(dto: CreateMatchDto) {
    await this.teamAccessService.assertCaptain(dto.teamId, dto.createdBy);

    return this.prisma.match.create({
      data: {
        teamId: dto.teamId,
        fieldId: dto.fieldId,
        title: dto.title,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        district: dto.district,
        status: dto.status,
        notes: dto.notes,
        createdBy: dto.createdBy,
      },
      include: {
        team: true,
        field: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.match.findUnique({
      where: { id },
      include: {
        team: true,
        field: true,
        urgentPosts: {
          include: {
            applications: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateMatchDto) {
    await this.teamAccessService.assertCaptainByMatch(id, dto.actorUserId);

    return this.prisma.match.update({
      where: { id },
      data: {
        title: dto.title,
        fieldId: dto.fieldId,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        district: dto.district,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }
}
