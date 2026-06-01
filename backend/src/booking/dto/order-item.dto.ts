import { IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

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
 }
