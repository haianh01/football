import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { TeamAccessModule } from './common/services/team-access.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FieldsModule } from './modules/fields/fields.module';
import { TeamsModule } from './modules/teams/teams.module';
import { MatchesModule } from './modules/matches/matches.module';
import { UrgentPostsModule } from './modules/urgent-posts/urgent-posts.module';

@Module({
  imports: [
    PrismaModule,
    TeamAccessModule,
    AuthModule,
    UsersModule,
    FieldsModule,
    TeamsModule,
    MatchesModule,
    UrgentPostsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
