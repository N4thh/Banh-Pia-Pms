import { Type } from "class-transformer";
import { IsNotEmpty,  IsOptional,  IsString, MinLength, ValidateNested } from "class-validator";
import { CreateAddressDto } from "./create-address.dto";

export class UpdateCustomerDto{
    @IsOptional()
    @IsString()
    @IsNotEmpty({message: "Vui lòng nhập họ và tên"})
    @MinLength(2, {message: "Vui lòng nhập đúng họ tên"})
    fullName?: string; 

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateAddressDto)
    address?: CreateAddressDto; 
}

