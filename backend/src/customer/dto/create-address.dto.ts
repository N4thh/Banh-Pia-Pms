import { IsNotEmpty, IsString } from "class-validator";

export class CreateAddressDto {
    @IsString()
    @IsNotEmpty()
    houseNumber!: string; 

    @IsString()
    @IsNotEmpty()
    street!: string;

    @IsString()
    @IsNotEmpty()
    ward!: string;

    @IsString()
    @IsNotEmpty()
    district!: string;
}
