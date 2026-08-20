import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';

import { CreateProductDto } from './create-product.dto';
import { ProductStatus } from '../enums/product-status.enum';

export class UpdateProductDto extends PartialType(CreateProductDto) {

    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;
}