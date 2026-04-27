import { IsInt, IsDateString, Min} from 'class-validator';

export class BookSlotDto {
  @IsInt()
  cakeId!: number;

  @IsDateString()
  date!: string;
  
  @IsInt()
  @Min(1)
  quantity!: number;
}
