import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { BookSlotDto } from './dto/book-slot.dto';
import { CreateSlotDto } from './dto/create-slot.dto';


@Controller('availability')
@UsePipes(new ValidationPipe({ transform: true}))
export class AvailabilityController {
    constructor(private readonly avaibilityService : AvailabilityService){}

    @Post('book')
    update(@Body() bookSlotDto : BookSlotDto) {
        return this.avaibilityService.bookSlot(bookSlotDto);
    }

    @Post('setup')
    create(@Body() createSlotDto: CreateSlotDto) { 
        return this.avaibilityService.createSlot(createSlotDto);
    }

}
