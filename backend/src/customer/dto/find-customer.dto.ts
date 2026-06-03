import { IsNotEmpty,  IsOptional,  IsString, Matches, MinLength, ValidateNested } from "class-validator";

export class FindCustomerDto{ 
    @IsString()
    @IsNotEmpty({message: "Vui lòng nhập số điện thoại"})
    @Matches(/^0\d{9}$/, {
    message: 'Số điện thoại phải gồm 10 số',
    })
    phone!: string; 
}

