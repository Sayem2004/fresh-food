import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString()
  name!: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  description!: string;

  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber()
  @IsPositive()
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;

  @IsNotEmpty({ message: 'Stock is required' })
  @IsNumber()
  @Min(0)
  stock!: number;

  @IsNotEmpty({ message: 'Unit is required' })
  @IsString()
  unit!: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNotEmpty({ message: 'Category ID is required' })
  @IsNumber()
  categoryId!: number;
}