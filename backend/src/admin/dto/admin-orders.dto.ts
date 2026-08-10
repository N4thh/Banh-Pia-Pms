import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, Min } from "class-validator";

export class GetOrdersBySlotDto {
  @IsDateString()
  date!: string;

  @Type(() => Number)
  @IsInt()
  cakeId!: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;
}