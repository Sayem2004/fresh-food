import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

export class ConfirmOnlinePaymentDto {
    @IsEnum(PaymentMethod)
    paymentMethod!: PaymentMethod;

    @IsString()
    @IsNotEmpty()
    transactionId!: string;
}