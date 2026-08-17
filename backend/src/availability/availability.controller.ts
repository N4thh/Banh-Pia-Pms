import { Body, Controller, Get, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { BookSlotDto } from './dto/book-slot.dto';
import { CreateSlotDto } from './dto/create-slot.dto';
import { HoldSlotDto } from './dto/hold-slot.dto';
import { JwtBlacklistGruard } from 'src/auth/guards/jwt-blacklist.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { IsAdmin} from '../common/decorators/is-admin.decorators.js'
import { GetSlotsDto } from './dto/get-slot.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('availability')
@UsePipes(new ValidationPipe({ transform: true}))
export class AvailabilityController {
    constructor(private readonly avaibilityService : AvailabilityService){}

    @Post('book')
    update(@Body() bookSlotDto : BookSlotDto) {
        return this.avaibilityService.bookSlot(bookSlotDto);
    }

    @Post('setup')
    @UseGuards(JwtBlacklistGruard, AdminGuard)
    @IsAdmin()
    create(@Body() createSlotDto: CreateSlotDto) { 
        return this.avaibilityService.createSlot(createSlotDto);
    }

    @Post('hold')
    async hold(@Body() holdSlotDto: HoldSlotDto) {
        return this.avaibilityService.holdSlot(holdSlotDto);
    }
    
    @Get('slots')
    @Public()
    async getSlots(@Query() dto: GetSlotsDto) { 
        return this.avaibilityService.getSlot(dto);
    }

}
