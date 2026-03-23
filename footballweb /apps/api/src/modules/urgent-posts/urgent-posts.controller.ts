import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UrgentPostsService } from './urgent-posts.service';
import { ListUrgentPostsDto } from './dto/list-urgent-posts.dto';
import { CreateUrgentPostDto } from './dto/create-urgent-post.dto';
import { UpdateUrgentPostDto } from './dto/update-urgent-post.dto';
import { ApplyToUrgentPostDto } from './dto/apply-to-urgent-post.dto';
import { ReviewUrgentPostApplicationDto } from './dto/review-urgent-post-application.dto';

@Controller('urgent-posts')
export class UrgentPostsController {
  constructor(private readonly urgentPostsService: UrgentPostsService) {}

  @Get()
  findAll(@Query() query: ListUrgentPostsDto) {
    return this.urgentPostsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.urgentPostsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUrgentPostDto) {
    return this.urgentPostsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUrgentPostDto) {
    return this.urgentPostsService.update(id, dto);
  }

  @Post(':id/apply')
  apply(@Param('id') id: string, @Body() dto: ApplyToUrgentPostDto) {
    return this.urgentPostsService.apply(id, dto);
  }

  @Post(':id/applications/:applicationId/accept')
  accept(
    @Param('id') id: string,
    @Param('applicationId') applicationId: string,
    @Body() dto: ReviewUrgentPostApplicationDto,
  ) {
    return this.urgentPostsService.acceptApplication(id, applicationId, dto);
  }

  @Post(':id/applications/:applicationId/reject')
  reject(
    @Param('id') id: string,
    @Param('applicationId') applicationId: string,
    @Body() dto: ReviewUrgentPostApplicationDto,
  ) {
    return this.urgentPostsService.rejectApplication(id, applicationId, dto);
  }
}
