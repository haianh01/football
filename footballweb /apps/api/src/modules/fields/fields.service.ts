import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFieldDto } from './dto/create-field.dto';

@Injectable()
export class FieldsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(district?: string) {
    return this.prisma.field.findMany({
      where: district
        ? {
            district: {
              equals: district,
              mode: 'insensitive',
            },
          }
        : undefined,
      orderBy: [{ verified: 'desc' }, { name: 'asc' }],
    });
  }

  findOne(id: string) {
    return this.prisma.field.findUnique({
      where: { id },
      include: {
        matches: {
          orderBy: { startsAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  create(dto: CreateFieldDto) {
    return this.prisma.field.create({
      data: dto,
    });
  }
}

