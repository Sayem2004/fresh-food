import { IsNumber, IsPositive } from 'class-validator';

export class PaymentReceivedDto {
    @IsNumber()
    @IsPositive()
    cashCollected!: number;
}