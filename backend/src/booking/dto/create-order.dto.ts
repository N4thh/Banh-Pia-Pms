import { Type } from "class-transformer";
import { ArrayMinSize, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateIf, ValidateNested } from "class-validator";
import { CreateAddressDto } from "src/customer/dto/create-address.dto";
import { OrderItemDto } from "./order-item.dto";

export class CreateOrderDto { 
    @IsString()
    @IsNotEmpty({message: "Vui Lòng nhập số điện thoại"})
    phone!: string; 

    @IsOptional()
    @IsString()
    fullName!: string; 

    @ValidateIf((o) => !o.newAddress)
    @IsInt()
    @IsPositive()
    addressId?: number;

    @ValidateIf((o) => o.addressId) 
    @IsNotEmpty({message: 'Vui lòng nhập địa chỉ mới'})
    @ValidateNested()
    @Type(() => CreateAddressDto)
    newAddress?: CreateAddressDto

    @ValidateNested({each: true})
    @ArrayMinSize(1, {message: 'Đơn hàng phải có ít nhất 1 loại bánh'})
    @Type(() => OrderItemDto)
    items!: OrderItemDto[]; 

    @IsOptional()
    @IsString()
    note?: string
}