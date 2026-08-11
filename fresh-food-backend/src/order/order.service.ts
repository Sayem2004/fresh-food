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
import { Role } from '../common/enums/role.enum';
import { PaymentMethod } from './enums/payment-method.enum';



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
    async assignDeliveryMan(
        orderId: number,
        deliveryManId: number,
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

        const deliveryMan =
            await this.userRepository.findOne({
                where: {
                    id: deliveryManId,
                },
            });

        if (!deliveryMan) {
            throw new BadRequestException(
                'Delivery man not found',
            );
        }

        if (deliveryMan.role !== Role.DELIVERYMAN) {
            throw new BadRequestException(
                'Selected user is not a delivery man',
            );
        }

        if (deliveryMan.status !== 'ACTIVE') {
            throw new BadRequestException(
                'Delivery man is inactive',
            );
        }

        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException(
                'Cancelled order cannot be assigned',
            );
        }

        order.deliveryManId = deliveryMan.id;
        order.deliveryStatus = DeliveryStatus.ASSIGNED;

        const updatedOrder =
            await this.orderRepository.save(order);

        return {
            message: 'Delivery man assigned successfully',

            order: {
                id: updatedOrder.id,
                orderNumber: updatedOrder.orderNumber,
                deliveryManId:
                    updatedOrder.deliveryManId,
                deliveryStatus:
                    updatedOrder.deliveryStatus,
            },
        };
    }

    async getDeliveryOrders(deliveryManId: number) {
        const orders = await this.orderRepository.find({
            where: {
                deliveryManId,
            },
            relations: {
                items: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });

        return {
            message: 'Assigned orders retrieved successfully',
            orders: orders.map((order) => ({
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                deliveryStatus: order.deliveryStatus,
                totalAmount: order.totalAmount,
                shippingAddress: order.shippingAddress,
                createdAt: order.createdAt,
                items: order.items.map((item) => ({
                    productName: item.productName,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.subtotal,
                })),
            })),
        };
    }

    async updateDeliveryStatus(
        deliveryManId: number,
        orderId: number,
        deliveryStatus: DeliveryStatus,
    ) {
        const order = await this.orderRepository.findOne({
            where: {
                id: orderId,
            },
        });

        if (!order) {
            throw new BadRequestException('Order not found');
        }

        // Check whether this order belongs to this delivery man
        if (order.deliveryManId !== deliveryManId) {
            throw new BadRequestException(
                'This order is not assigned to you',
            );
        }

        // Status flow validation
        const currentStatus = order.deliveryStatus;

        if (
            currentStatus === DeliveryStatus.ASSIGNED &&
            deliveryStatus !== DeliveryStatus.PICKED_UP
        ) {
            throw new BadRequestException(
                'Order must be picked up first',
            );
        }

        if (
            currentStatus === DeliveryStatus.PICKED_UP &&
            deliveryStatus !== DeliveryStatus.OUT_FOR_DELIVERY
        ) {
            throw new BadRequestException(
                'Order must be out for delivery next',
            );
        }

        if (
            currentStatus === DeliveryStatus.OUT_FOR_DELIVERY &&
            deliveryStatus !== DeliveryStatus.DELIVERED
        ) {
            throw new BadRequestException(
                'Order must be delivered next',
            );
        }

        order.deliveryStatus = deliveryStatus;

        const updatedOrder = await this.orderRepository.save(order);

        return {
            message: 'Delivery status updated successfully',
            order: {
                id: updatedOrder.id,
                orderNumber: updatedOrder.orderNumber,
                deliveryStatus: updatedOrder.deliveryStatus,
            },
        };
    }
    async receiveCashPayment(
        deliveryManId: number,
        orderId: number,
        cashCollected: number,
    ) {
        const order = await this.orderRepository.findOne({
            where: {
                id: orderId,
                deliveryManId: deliveryManId,
            },
        });

        if (!order) {
            throw new BadRequestException(
                'Order not found or not assigned to you',
            );
        }

        // Payment method check
        if (order.paymentMethod !== PaymentMethod.CASH_ON_DELIVERY) {
            throw new BadRequestException(
                'This order is not Cash on Delivery',
            );
        }

        // Delivery check
        if (order.deliveryStatus !== DeliveryStatus.DELIVERED) {
            throw new BadRequestException(
                'Payment can only be collected after delivery',
            );
        }

        // Already paid check
        if (order.paymentStatus === PaymentStatus.PAID) {
            throw new BadRequestException(
                'Payment has already been received',
            );
        }

        // Amount check
        if (cashCollected !== Number(order.totalAmount)) {
            throw new BadRequestException(
                `Cash amount must be ${order.totalAmount}`,
            );
        }

        order.cashCollected = cashCollected;
        order.paymentStatus = PaymentStatus.PAID;
        order.paymentCollectedAt = new Date();

        const updatedOrder =
            await this.orderRepository.save(order);

        return {
            message: 'Cash payment received successfully',
            payment: {
                orderId: updatedOrder.id,
                orderNumber: updatedOrder.orderNumber,
                paymentMethod: updatedOrder.paymentMethod,
                paymentStatus: updatedOrder.paymentStatus,
                cashCollected: updatedOrder.cashCollected,
                paymentCollectedAt:
                    updatedOrder.paymentCollectedAt,
            },
        };
    }
    async getDeliveryManCashBalance(deliveryManId: number) {
        const result = await this.orderRepository
            .createQueryBuilder('order')
            .select('COALESCE(SUM(order.cashCollected), 0)', 'cashBalance')
            .where('order.deliveryManId = :deliveryManId', {
                deliveryManId,
            })
            .andWhere('order.paymentMethod = :paymentMethod', {
                paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
            })
            .andWhere('order.paymentStatus = :paymentStatus', {
                paymentStatus: PaymentStatus.PAID,
            })
            .getRawOne();

        return {
            message: 'Cash balance retrieved successfully',
            cashBalance: Number(result.cashBalance),
        };
    }
    async getDeliveryManCashHistory(deliveryManId: number) {
        const orders = await this.orderRepository.find({
            where: {
                deliveryManId,
                paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
                paymentStatus: PaymentStatus.PAID,
            },
            select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                cashCollected: true,
                paymentCollectedAt: true,
            },
            order: {
                paymentCollectedAt: 'DESC',
            },
        });

        return {
            message: 'Cash collection history retrieved successfully',
            totalCollected: orders.reduce(
                (sum, order) => sum + Number(order.cashCollected),
                0,
            ),
            orders,
        };
    }
}