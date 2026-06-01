import { Body, Controller, Patch, Post } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { FindCustomerDto } from './dto/find-customer.dto';

@Controller('customer')
export class CustomerController {
    constructor(private readonly customerService: CustomerService){}
    
    @Post('create')
    create(@Body() createCustomerDto: FindCustomerDto) { 
        return this.customerService.findExistUser(createCustomerDto);
    };
 
}


