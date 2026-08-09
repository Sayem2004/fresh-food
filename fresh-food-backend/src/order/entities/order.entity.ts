import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { DeliveryStatus } from '../enums/delivery-status.enum';


@Entity('orders')
export class Order {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        unique: true,
    })
    orderNumber!: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status!: OrderStatus;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
    })
    paymentMethod!: PaymentMethod;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    paymentStatus!: PaymentStatus;

    @Column({
        type: 'enum',
        enum: DeliveryStatus,
        default: DeliveryStatus.PENDING,
    })
    deliveryStatus!: DeliveryStatus;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
    })
    subtotal!: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
    })
    discount!: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
    })
    shippingCost!: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
    })
    totalAmount!: number;

    @Column({
        type: 'text',
    })
    shippingAddress!: string;

    @Column({
        nullable: true,
    })
    transactionId?: string;

    @Column({
        nullable: true,
    })
    deliveryManId?: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
    })
    cashCollected!: number;

    @Column({
        nullable: true,
    })
    paymentCollectedAt?: Date;

    @ManyToOne(
        () => User,
        (user) => user.orders,
        {
            onDelete: 'CASCADE',
        },
    )
    user!: User;

    @OneToMany(
        () => OrderItem,
        (orderItem) => orderItem.order,
        {
            cascade: true,
        },
    )
    items!: OrderItem[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}