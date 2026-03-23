import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TeamRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeamAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertCaptain(teamId: string, userId: string) {
    const membership = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Bạn không thuộc đội này.');
    }

    if (membership.role !== TeamRole.captain) {
      throw new ForbiddenException('Chỉ đội trưởng mới được thực hiện thao tác này.');
    }
  }

  async assertCaptainByMatch(matchId: string, userId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        teamId: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Không tìm thấy trận đấu.');
    }

    await this.assertCaptain(match.teamId, userId);

    return match;
  }

  async assertCaptainByUrgentPost(postId: string, userId: string) {
    const post = await this.prisma.urgentPlayerPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        teamId: true,
        neededPlayers: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài kèo gấp.');
    }

    await this.assertCaptain(post.teamId, userId);

    return post;
  }
}

