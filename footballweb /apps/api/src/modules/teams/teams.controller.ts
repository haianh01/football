import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateTeamMemberRoleDto } from './dto/update-team-member-role.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() dto: CreateTeamDto) {
    return this.teamsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, dto);
  }

  @Get(':id/matches')
  getMatches(@Param('id') id: string) {
    return this.teamsService.getMatches(id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddTeamMemberDto) {
    return this.teamsService.addMember(id, dto);
  }

  @Patch(':id/members/:memberId')
  updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateTeamMemberRoleDto,
  ) {
    return this.teamsService.updateMemberRole(id, memberId, dto);
  }
}
