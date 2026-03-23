import { Module } from '@nestjs/common';
import { UrgentPostsController } from './urgent-posts.controller';
import { UrgentPostsService } from './urgent-posts.service';

@Module({
  controllers: [UrgentPostsController],
  providers: [UrgentPostsService],
})
export class UrgentPostsModule {}
