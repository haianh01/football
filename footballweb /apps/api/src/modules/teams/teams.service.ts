import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TeamRole } from '@prisma/client';
import { TeamAccessService } from '../../common/services/team-access.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamMemberRoleDto } from './dto/update-team-member-role.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamAccessService: TeamAccessService,
  ) {}

  create(dto: CreateTeamDto) {
    return this.prisma.team.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        city: dto.city,
        district: dto.district,
        description: dto.description,
        skillLevel: dto.skillLevel,
        createdBy: dto.createdBy,
        members: {
          create: {
            userId: dto.createdBy,
            role: TeamRole.captain,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.team.findUnique({
      where: { id },
      include: {
        creator: true,
        members: {
          include: {
            user: true,
          },
        },
        matches: {
          orderBy: { startsAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async update(id: string, dto: UpdateTeamDto) {
    await this.teamAccessService.assertCaptain(id, dto.actorUserId);

    return this.prisma.team.update({
      where: { id },
      data: {
        name: dto.name,
        city: dto.city,
        district: dto.district,
        description: dto.description,
        skillLevel: dto.skillLevel,
      },
    });
  }

  getMatches(teamId: string) {
    return this.prisma.match.findMany({
      where: { teamId },
      include: {
        field: true,
        urgentPosts: true,
      },
      orderBy: { startsAt: 'desc' },
    });
  }

  async addMember(teamId: string, dto: AddTeamMemberDto) {
    await this.teamAccessService.assertCaptain(teamId, dto.actorUserId);

    return this.prisma.teamMember.create({
      data: {
        teamId,
        userId: dto.userId,
        role: dto.role ?? TeamRole.member,
      },
    });
  }

  async updateMemberRole(teamId: string, memberId: string, dto: UpdateTeamMemberRoleDto) {
    await this.teamAccessService.assertCaptain(teamId, dto.actorUserId);

    const member = await this.prisma.teamMember.findFirst({
      where: {
        id: memberId,
        teamId,
      },
      include: {
        user: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Không tìm thấy thành viên trong đội.');
    }

    if (member.role === dto.role) {
      return member;
    }

    if (member.role === TeamRole.captain && dto.role !== TeamRole.captain) {
      const captainCount = await this.prisma.teamMember.count({
        where: {
          teamId,
          role: TeamRole.captain,
        },
      });

      if (captainCount <= 1) {
        throw new BadRequestException('Đội phải luôn có ít nhất một đội trưởng.');
      }
    }

    return this.prisma.teamMember.update({
      where: { id: memberId },
      data: {
        role: dto.role,
      },
      include: {
        user: true,
      },
    });
  }
}
