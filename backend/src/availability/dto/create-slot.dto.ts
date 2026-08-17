import { IsDateString, IsInt, IsPositive } from "class-validator";

export class CreateSlotDto { 
    @IsInt()
    cakeId !: number;

    @IsDateString()
    date !: string; 

    @IsInt()
    @IsPositive()
    maxCapacity !: number
}