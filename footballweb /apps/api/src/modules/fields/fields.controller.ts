import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { CreateFieldDto } from './dto/create-field.dto';

@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Get()
  findAll(@Query('district') district?: string) {
    return this.fieldsService.findAll(district);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFieldDto) {
    return this.fieldsService.create(dto);
  }
}

