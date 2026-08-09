import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

import { User } from '../users/entities/user.entity';
import { Cart } from '../cart/entities/cart.entity';

import { CreateOrderDto } from './dto/create-order.dto';

import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { DeliveryStatus } from './enums/delivery-status.enum';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class OrderService {

    constructor(

        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,

        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Cart)
        private readonly cartRepository: Repository<Cart>,

        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

    ) { }


    async createOrder(
        userId: number,
        createOrderDto: CreateOrderDto,
    ) {

        // Find User
        const user = await this.userRepository.findOne({
            where: {
                id: userId,
            },
        });

        if (!user) {
            throw new BadRequestException(
                'User not found',
            );
        }


        // Get Cart
        const cartItems =
            await this.cartRepository.find({
                where: {
                    user: {
                        id: userId,
                    },
                },
                relations: {
                    product: true,
                },
            });


        // Check Empty Cart
        if (cartItems.length === 0) {
            throw new BadRequestException(
                'Cart is empty',
            );
        }


        // Validate Cart
        for (const cartItem of cartItems) {

            if (!cartItem.product) {
                throw new BadRequestException(
                    'Product not found',
                );
            }

            if (
                cartItem.product.status !== 'ACTIVE'
            ) {
                throw new BadRequestException(
                    `${cartItem.product.name} is inactive`,
                );
            }

            if (
                cartItem.quantity >
                cartItem.product.stock
            ) {
                throw new BadRequestException(
                    `${cartItem.product.name} has insufficient stock`,
                );
            }
        }


        // Calculate Subtotal
        let subtotal = 0;

        for (const cartItem of cartItems) {

            subtotal +=
                Number(cartItem.priceAtAdd) *
                cartItem.quantity;
        }


        // Discount
        const discount = 0;


        // Shipping Cost
        const shippingCost = 0;


        // Total Amount
        const totalAmount =
            subtotal -
            discount +
            shippingCost;


        // Generate Order Number
        const orderNumber =
            `FF-${Date.now()}`;


        // Create Order
        const order = this.orderRepository.create({

            orderNumber,

            user,

            status: OrderStatus.PENDING,

            paymentMethod:
                createOrderDto.paymentMethod,

            paymentStatus:
                PaymentStatus.PENDING,

            deliveryStatus:
                DeliveryStatus.PENDING,

            subtotal,

            discount,

            shippingCost,

            totalAmount,

            shippingAddress:
                createOrderDto.shippingAddress ||
                user.address,

            cashCollected: 0,

        });


        // Create Order Items
        order.items = cartItems.map(
            (cartItem) => {

                const orderItem =
                    this.orderItemRepository.create({

                        productName:
                            cartItem.product.name,

                        price:
                            Number(
                                cartItem.priceAtAdd,
                            ),

                        quantity:
                            cartItem.quantity,

                        subtotal:
                            Number(
                                cartItem.priceAtAdd,
                            ) *
                            cartItem.quantity,

                        product:
                            cartItem.product,

                    });

                return orderItem;
            },
        );


        // Save Order + Items
        const savedOrder =
            await this.orderRepository.save(order);


        // Reduce Product Stock
        for (const cartItem of cartItems) {

            cartItem.product.stock -=
                cartItem.quantity;

            await this.productRepository.save(
                cartItem.product,
            );
        }


        // Clear Cart
        await this.cartRepository.remove(
            cartItems,
        );


        return {

            message:
                'Order created successfully',

            order: {

                id:
                    savedOrder.id,

                orderNumber:
                    savedOrder.orderNumber,

                status:
                    savedOrder.status,

                paymentMethod:
                    savedOrder.paymentMethod,

                paymentStatus:
                    savedOrder.paymentStatus,

                deliveryStatus:
                    savedOrder.deliveryStatus,

                subtotal:
                    savedOrder.subtotal,

                discount:
                    savedOrder.discount,

                shippingCost:
                    savedOrder.shippingCost,

                totalAmount:
                    savedOrder.totalAmount,

                shippingAddress:
                    savedOrder.shippingAddress,

            },
        };
    }
    async getMyOrders(userId: number) {
        const orders = await this.orderRepository.find({
            where: {
                user: {
                    id: userId,
                },
            },
            relations: {
                items: {
                    product: true,
                },
            },
            order: {
                createdAt: 'DESC',
            },
        });

        return {
            message: 'Orders retrieved successfully',
            totalOrders: orders.length,
            orders: orders.map((order) => ({
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                deliveryStatus: order.deliveryStatus,
                subtotal: order.subtotal,
                discount: order.discount,
                shippingCost: order.shippingCost,
                totalAmount: order.totalAmount,
                shippingAddress: order.shippingAddress,
                createdAt: order.createdAt,

                items: order.items.map((item) => ({
                    id: item.id,
                    productName: item.productName,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.subtotal,
                })),
            })),
        };
    }
    async getOrderById(userId: number, orderId: number) {
        const order = await this.orderRepository.findOne({
            where: {
                id: orderId,
                user: {
                    id: userId,
                },
            },
            relations: {
                items: {
                    product: true,
                },
            },
        });

        if (!order) {
            throw new BadRequestException(
                'Order not found',
            );
        }

        return {
            message: 'Order retrieved successfully',
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,

                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,

                deliveryStatus: order.deliveryStatus,

                subtotal: order.subtotal,
                discount: order.discount,
                shippingCost: order.shippingCost,
                totalAmount: order.totalAmount,

                shippingAddress: order.shippingAddress,

                createdAt: order.createdAt,
                updatedAt: order.updatedAt,

                items: order.items.map((item) => ({
                    id: item.id,
                    productName: item.productName,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.subtotal,
                })),
            },
        };
    }
    async getAllOrders() {
    const orders = await this.orderRepository.find({
        relations: {
            user: true,
            items: {
                product: true,
            },
        },
        order: {
            createdAt: 'DESC',
        },
    });

    return {
        message: 'Orders retrieved successfully',
        totalOrders: orders.length,

        orders: orders.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,

            customer: {
                id: order.user.id,
                name: order.user.name,
                email: order.user.email,
                phone: order.user.phone,
            },

            status: order.status,

            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,

            deliveryStatus: order.deliveryStatus,

            subtotal: order.subtotal,
            discount: order.discount,
            shippingCost: order.shippingCost,
            totalAmount: order.totalAmount,

            shippingAddress: order.shippingAddress,

            createdAt: order.createdAt,

            items: order.items.map((item) => ({
                id: item.id,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.subtotal,
            })),
        })),
    };
}
async updateOrderStatus(
    orderId: number,
    status: OrderStatus,
) {
    const order = await this.orderRepository.findOne({
        where: {
            id: orderId,
        },
    });

    if (!order) {
        throw new BadRequestException(
            'Order not found',
        );
    }

    order.status = status;

    const updatedOrder =
        await this.orderRepository.save(order);

    return {
        message: 'Order status updated successfully',
        order: {
            id: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            status: updatedOrder.status,
            paymentStatus: updatedOrder.paymentStatus,
            deliveryStatus: updatedOrder.deliveryStatus,
            totalAmount: updatedOrder.totalAmount,
        },
    };
}
}