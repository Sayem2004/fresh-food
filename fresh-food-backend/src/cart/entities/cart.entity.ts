import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('carts')
export class Cart {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        default: 1,
    })
    quantity!: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
    })
    priceAtAdd!: number;

    @ManyToOne(
        () => User,
        (user) => user.carts,
        {
            onDelete: 'CASCADE',
        },
    )
    user!: User;

    @ManyToOne(
        () => Product,
        (product) => product.carts,
        {
            onDelete: 'CASCADE',
        },
    )
    product!: Product;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}