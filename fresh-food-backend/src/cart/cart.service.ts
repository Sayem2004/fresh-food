import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity';
import { Product } from '../product/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private readonly cartRepository: Repository<Cart>,

        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async addToCart(
        userId: number,
        createCartDto: CreateCartDto,
    ) {
        const { productId, quantity } = createCartDto;

        // Check Product
        const product = await this.productRepository.findOne({
            where: { id: productId },
        });

        if (!product) {
            throw new BadRequestException('Product not found');
        }

        // Product Status
        if (product.status !== 'ACTIVE') {
            throw new BadRequestException(
                'Product is not available',
            );
        }

        // Stock Check
        if (quantity > product.stock) {
            throw new BadRequestException(
                'Insufficient stock',
            );
        }

        // Existing Cart Check
        const existingCart =
            await this.cartRepository.findOne({
                where: {
                    user: {
                        id: userId,
                    },
                    product: {
                        id: productId,
                    },
                },
                relations: {
                    user: true,
                    product: true,
                },
            });

        if (existingCart) {
            existingCart.quantity += quantity;

            if (
                existingCart.quantity >
                product.stock
            ) {
                throw new BadRequestException(
                    'Insufficient stock',
                );
            }

            const updatedCart =
                await this.cartRepository.save(
                    existingCart,
                );

            return this.cartResponse(
                updatedCart,
                product,
                'Cart updated successfully',
            );
        }

        // User Check
        const user =
            await this.userRepository.findOne({
                where: {
                    id: userId,
                },
            });

        if (!user) {
            throw new BadRequestException(
                'User not found',
            );
        }

        // Create Cart
        const cart =
            this.cartRepository.create({
                user,
                product,
                quantity,
                priceAtAdd: Number(product.price),
            });

        const savedCart =
            await this.cartRepository.save(
                cart,
            );

        return this.cartResponse(
            savedCart,
            product,
            'Product added to cart successfully',
        );
    }

    private cartResponse(
        cart: Cart,
        product: Product,
        message: string,
    ) {
        return {
            message,
            cart: {
                id: cart.id,
                quantity: cart.quantity,
                priceAtAdd: +cart.priceAtAdd,
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    discountPrice:
                        product.discountPrice,
                    image: product.image,
                },
            },
        };
    }

    async getMyCart(userId: number) {
        const carts = await this.cartRepository.find({
            where: {
                user: {
                    id: userId,
                },
            },
            relations: {
                product: true,
            },
            order: {
                id: 'ASC',
            },
        });

        let totalItems = 0;
        let totalAmount = 0;

        const cartItems = carts.map((cart) => {
            const subtotal =
                Number(cart.priceAtAdd) * cart.quantity;

            totalItems += cart.quantity;
            totalAmount += subtotal;

            return {
                id: cart.id,
                quantity: cart.quantity,
                priceAtAdd: +cart.priceAtAdd,
                subtotal,

                product: {
                    id: cart.product.id,
                    name: cart.product.name,
                    price: cart.product.price,
                    discountPrice:
                        cart.product.discountPrice,
                    image: cart.product.image,
                },
            };
        });

        return {
            message: 'Cart retrieved successfully',
            totalItems,
            totalAmount,
            cart: cartItems,
        };
    }

    async updateCart(
        userId: number,
        cartId: number,
        updateCartDto: UpdateCartDto,
    ) {
        const { quantity } = updateCartDto;

        const cart = await this.cartRepository.findOne({
            where: {
                id: cartId,
                user: {
                    id: userId,
                },
            },
            relations: {
                product: true,
            },
        });

        if (!cart) {
            throw new BadRequestException(
                'Cart item not found',
            );
        }

        if (quantity > cart.product.stock) {
            throw new BadRequestException(
                'Insufficient stock',
            );
        }

        cart.quantity = quantity;

        const updatedCart =
            await this.cartRepository.save(cart);

        return {
            message: 'Cart updated successfully',
            cart: {
                id: updatedCart.id,
                quantity: updatedCart.quantity,
                priceAtAdd: Number(updatedCart.priceAtAdd),
                subtotal:
                    Number(updatedCart.priceAtAdd) *
                    updatedCart.quantity,
                product: {
                    id: cart.product.id,
                    name: cart.product.name,
                    price: cart.product.price,
                    discountPrice:
                        cart.product.discountPrice,
                    image: cart.product.image,
                },
            },
        };
    }

    async removeCart(
        userId: number,
        cartId: number,
    ) {
        const cart = await this.cartRepository.findOne({
            where: {
                id: cartId,
                user: {
                    id: userId,
                },
            },
        });

        if (!cart) {
            throw new BadRequestException(
                'Cart item not found',
            );
        }

        await this.cartRepository.remove(cart);

        return {
            message: 'Product removed from cart successfully',
        };
    }


    async clearCart(userId: number) {
        const carts = await this.cartRepository.find({
            where: {
                user: {
                    id: userId,
                },
            },
        });

        if (carts.length === 0) {
            throw new BadRequestException(
                'Cart is already empty',
            );
        }

        await this.cartRepository.remove(carts);

        return {
            message: 'Cart cleared successfully',
        };
    }
    async remove(
        userId: number,
        cartId: number,
    ) {
        const cart = await this.cartRepository.findOne({
            where: {
                id: cartId,
                user: {
                    id: userId,
                },
            },
        });

        if (!cart) {
            throw new BadRequestException(
                'Cart item not found',
            );
        }

        await this.cartRepository.remove(cart);

        return {
            message: 'Cart item removed successfully',
        };
    }

    async getCartSummary(userId: number) {
        const carts = await this.cartRepository.find({
            where: {
                user: {
                    id: userId,
                },
            },
            relations: {
                product: true,
            },
        });

        if (carts.length === 0) {
            throw new BadRequestException(
                'Cart is empty',
            );
        }

        let totalItems = carts.length;
        let totalQuantity = 0;
        let subtotal = 0;
        let discount = 0;

        for (const cart of carts) {
            totalQuantity += cart.quantity;

            subtotal +=
                Number(cart.priceAtAdd) * cart.quantity;

            discount +=
                (Number(cart.priceAtAdd) -
                    Number(cart.product.discountPrice)) *
                cart.quantity;
        }

        const grandTotal = subtotal - discount;

        return {
            message: 'Cart summary retrieved successfully',
            summary: {
                totalItems,
                totalQuantity,
                subtotal,
                discount,
                grandTotal,
            },
        };
    }




    
    async checkoutValidation(userId: number) {
        const carts = await this.cartRepository.find({
            where: {
                user: {
                    id: userId,
                },
            },
            relations: {
                product: true,
            },
        });

        if (carts.length === 0) {
            throw new BadRequestException(
                'Cart is empty',
            );
        }

        const issues: string[] = [];

        for (const cart of carts) {
            const product = await this.productRepository.findOne({
                where: {
                    id: cart.product.id,
                },
            });

            if (!product) {
                issues.push(
                    `${cart.product.name} no longer exists`,
                );
                continue;
            }

            if (product.status !== 'ACTIVE') {
                issues.push(
                    `${product.name} is inactive`,
                );
            }

            if (product.stock < cart.quantity) {
                issues.push(
                    `${product.name} has only ${product.stock} items left`,
                );
            }

            if (
                Number(product.price) !==
                Number(cart.priceAtAdd)
            ) {
                issues.push(
                    `${product.name} price has changed`,
                );
            }
        }

        if (issues.length > 0) {
            throw new BadRequestException({
                message: 'Checkout validation failed',
                issues,
            });
        }

        return {
            message: 'Checkout validation successful',
        };
    }
}