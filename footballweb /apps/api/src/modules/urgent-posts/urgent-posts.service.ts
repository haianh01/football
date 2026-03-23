import { BadRequestException, Injectable } from '@nestjs/common';
import { ApplicationStatus, UrgentPostStatus } from '@prisma/client';
import { TeamAccessService } from '../../common/services/team-access.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ApplyToUrgentPostDto } from './dto/apply-to-urgent-post.dto';
import { CreateUrgentPostDto } from './dto/create-urgent-post.dto';
import { ListUrgentPostsDto } from './dto/list-urgent-posts.dto';
import { ReviewUrgentPostApplicationDto } from './dto/review-urgent-post-application.dto';
import { UpdateUrgentPostDto } from './dto/update-urgent-post.dto';

@Injectable()
export class UrgentPostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamAccessService: TeamAccessService,
  ) {}

  findAll(query: ListUrgentPostsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    return this.prisma.urgentPlayerPost.findMany({
      where: {
        status: query.status,
        skillLevel: query.skillLevel,
        match: query.district
          ? {
              district: {
                equals: query.district,
                mode: 'insensitive',
              },
            }
          : undefined,
      },
      include: {
        team: true,
        match: {
          include: {
            field: true,
          },
        },
        applications: true,
      },
      orderBy: [{ status: 'asc' }, { expiresAt: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  findOne(id: string) {
    return this.prisma.urgentPlayerPost.findUnique({
      where: { id },
      include: {
        team: true,
        match: {
          include: {
            field: true,
          },
        },
        applications: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async create(dto: CreateUrgentPostDto) {
    const match = await this.teamAccessService.assertCaptainByMatch(dto.matchId, dto.actorUserId);

    if (match.teamId !== dto.teamId) {
      throw new BadRequestException('Bài kèo gấp phải thuộc đúng đội của trận đấu.');
    }

    return this.prisma.urgentPlayerPost.create({
      data: {
        matchId: dto.matchId,
        teamId: dto.teamId,
        neededPlayers: dto.neededPlayers,
        skillLevel: dto.skillLevel,
        feeShare: dto.feeShare,
        description: dto.description,
        expiresAt: new Date(dto.expiresAt),
        status: dto.status,
      },
      include: {
        team: true,
        match: true,
      },
    });
  }

  async update(id: string, dto: UpdateUrgentPostDto) {
    await this.teamAccessService.assertCaptainByUrgentPost(id, dto.actorUserId);

    return this.prisma.urgentPlayerPost.update({
      where: { id },
      data: {
        neededPlayers: dto.neededPlayers,
        skillLevel: dto.skillLevel,
        feeShare: dto.feeShare,
        description: dto.description,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        status: dto.status,
      },
    });
  }

  apply(postId: string, dto: ApplyToUrgentPostDto) {
    return this.prisma.urgentPostApplication.create({
      data: {
        postId,
        userId: dto.userId,
        message: dto.message,
      },
    });
  }

  async acceptApplication(
    postId: string,
    applicationId: string,
    dto: ReviewUrgentPostApplicationDto,
  ) {
    await this.teamAccessService.assertCaptainByUrgentPost(postId, dto.actorUserId);

    return this.prisma.$transaction(async (tx) => {
      const application = await tx.urgentPostApplication.findFirstOrThrow({
        where: {
          id: applicationId,
          postId,
        },
        include: {
          post: true,
        },
      });

      const updated = await tx.urgentPostApplication.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.accepted,
        },
      });

      const acceptedCount = await tx.urgentPostApplication.count({
        where: {
          postId,
          status: ApplicationStatus.accepted,
        },
      });

      if (acceptedCount >= application.post.neededPlayers) {
        await tx.urgentPlayerPost.update({
          where: { id: postId },
          data: {
            status: UrgentPostStatus.closed,
          },
        });
      }

      return updated;
    });
  }

  async rejectApplication(
    postId: string,
    applicationId: string,
    dto: ReviewUrgentPostApplicationDto,
  ) {
    await this.teamAccessService.assertCaptainByUrgentPost(postId, dto.actorUserId);

    return this.prisma.urgentPostApplication.updateMany({
      where: {
        id: applicationId,
        postId,
      },
      data: {
        status: ApplicationStatus.rejected,
      },
    });
  }
}
