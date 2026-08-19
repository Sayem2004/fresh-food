import {
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'Category name cannot be empty or spaces only',
  })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;
}