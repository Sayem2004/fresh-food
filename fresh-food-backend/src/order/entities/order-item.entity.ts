import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';

import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('order_items')
export class OrderItem {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    productName!: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
    })
    price!: number;

    @Column()
    quantity!: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
    })
    subtotal!: number;

    @ManyToOne(
        () => Order,
        (order) => order.items,
        {
            onDelete: 'CASCADE',
        },
    )
    order!: Order;

    @ManyToOne(
        () => Product,
        {
            nullable: true,
            onDelete: 'SET NULL',
        },
    )
    product?: Product;
}