import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from "class-validator";

 export class OrderItemDto { 
    @IsInt()
    @IsPositive()
    cakeId!: number; 

    @IsString()
    @IsNotEmpty()
    date!: string; 

    @IsInt()
    @IsPositive()
    quantity!: number; 

    @IsInt()
    @Min(0)
    eggCount!: number; 
 }
