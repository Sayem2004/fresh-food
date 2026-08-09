import { IsEnum } from 'class-validator';
import { DeliveryStatus } from '../enums/delivery-status.enum';

export class UpdateDeliveryStatusDto {
    @IsEnum(DeliveryStatus)
    deliveryStatus!: DeliveryStatus;
}