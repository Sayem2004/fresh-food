import {
    IsInt,
    Min,
} from 'class-validator';

export class AssignDeliveryDto {
    @IsInt()
    @Min(1)
    deliveryManId!: number;
}