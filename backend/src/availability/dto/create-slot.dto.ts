import { ArrayMinSize, IsArray, IsDateString, IsInt, IsPositive } from "class-validator";

export class CreateSlotDto { 
    @IsInt()
    cakeId !: number;

    @IsArray()
    @IsDateString({}, { each: true })
    @ArrayMinSize(1)
    dates!: string[];

    @IsInt()
    @IsPositive()
    maxCapacity !: number
}