import {
    IsInt,
    IsNotEmpty,
    Min,
} from 'class-validator';

export class CreateCartDto {
    @IsNotEmpty({
        message: 'Product ID is required',
    })
    @IsInt({
        message: 'Product ID must be an integer',
    })
    @Min(1, {
        message: 'Product ID must be greater than 0',
    })
    productId!: number;

    @IsNotEmpty({
        message: 'Quantity is required',
    })
    @IsInt({
        message: 'Quantity must be an integer',
    })
    @Min(1, {
        message: 'Quantity must be at least 1',
    })
    quantity!: number;
}