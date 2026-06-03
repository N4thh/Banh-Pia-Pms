import { Type } from "class-transformer";
import { ArrayMinSize, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateIf, ValidateNested } from "class-validator";
import { CreateAddressDto } from "src/customer/dto/create-address.dto";
import { OrderItemDto } from "./order-item.dto";

export enum ShippingMethod {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER'
}
export class CreateOrderDto { 
    @IsString()
    @IsNotEmpty({message: "Vui Lòng nhập số điện thoại"})
    phone!: string; 

    @IsOptional()
    @IsString()
    fullName!: string;
    @IsEnum(ShippingMethod)
    @IsNotEmpty({ message: "Vui lòng chọn hình thức nhận hàng" })
    shippingMethod!: ShippingMethod;

    @IsEnum(PaymentMethod)
    @IsNotEmpty({ message: "Vui lòng chọn phương thức thanh toán" })
    paymentMethod!: PaymentMethod;

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