import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';

import { User } from '../users/entities/user.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../product/entities/product.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Order,
            OrderItem,
            User,
            Cart,
            Product,
        ]),
    ],

    controllers: [
        OrderController,
    ],

    providers: [
        OrderService,
    ],
})
export class OrderModule {}