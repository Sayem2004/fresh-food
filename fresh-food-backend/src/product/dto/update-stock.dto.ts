import { IsInt, Min } from 'class-validator';

export class UpdateStockDto {
  @IsInt()
  @Min(0, { message: 'Stock must not be less than 0' })
  stock!: number;
}