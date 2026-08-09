import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaymentMethod } from '../enums/payment-method.enum';

export class CreateOrderDto {
    @IsEnum(PaymentMethod)
    paymentMethod!: PaymentMethod;

    @IsOptional()
    @IsString()
    shippingAddress?: string;
}