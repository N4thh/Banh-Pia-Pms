import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, Min, MinLength } from "class-validator";

export class CreateCakeDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3, {message: "Create new cake must have more than 3 characters"})
    kind!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @Type(() => Number)
    @IsNumber()
    @Min(10000,{message: "Price must be a positive number"})
    basePrice!: number;
}