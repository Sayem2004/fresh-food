import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString()
  @Matches(/\S/, { message: 'Product name cannot be empty' })
  name!: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @Matches(/\S/, { message: 'Description cannot be empty' })
  description!: string;

  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber()
  @IsPositive({ message: 'Price must be greater than 0' })
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Discount price must not be less than 0' })
  discountPrice?: number;

  @IsNotEmpty({ message: 'Stock is required' })
  @IsNumber()
  @Min(0, { message: 'Stock must not be less than 0' })
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