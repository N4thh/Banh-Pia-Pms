import { IsDateString, IsInt, IsString, Min, } from "class-validator";

export class HoldSlotDto{ 
    @IsInt()
    cakeId!: number

    @IsString()
    phone!: number

    @IsInt()
    @Min(1)
    quantity!: number

    @IsDateString()
    date!: string
}