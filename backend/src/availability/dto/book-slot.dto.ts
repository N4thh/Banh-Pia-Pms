import { IsInt, IsDateString, Min} from 'class-validator';

export class BookSlotDto {
  @IsInt()
  cakeId!: number;

  @IsDateString()
  date!: Date;
  
  @IsInt()
  @Min(1)
  quantity!: number;
}
