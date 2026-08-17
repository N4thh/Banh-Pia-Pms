import { IsDateString, IsInt, Min } from 'class-validator';

export class EditSlotDto {
  @IsDateString()
  date!: string;

  @IsInt()
  cakeId!: number;

  @IsInt()
  @Min(1)
  newMaxCapacity!: number;
}
