import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';

import { CakesService } from './cake.service';
import { CreateCakeDto } from './dto/create-cake.dto';
import { ValidationPipe } from '@nestjs/common';
import { UpdateCakeDto } from './dto/update-cake.dto';
import { RedisService } from 'src/redis/redis.service';

@Controller('cakes')
export class CakeController {
  constructor(
    private readonly cakeService: CakesService,
    private readonly redisService: RedisService,
  ) {}
  @Get()
  findAll() {
    return this.cakeService.getAllCakes();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cakeService.findOne(id);
  }
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createCakeDto: CreateCakeDto) {
    return this.cakeService.createCake(createCakeDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCakeDto: UpdateCakeDto,
  ) {
    return this.cakeService.updateCake(id, updateCakeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cakeService.deleteCake(id);
  }
}
