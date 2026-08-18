import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    // ===========================
    // Create Product
    // ===========================
    async create(createProductDto: CreateProductDto) {
        const { categoryId, ...productData } = createProductDto;

        const productName = createProductDto.name.trim();

        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
        });

        if (!category) {
            throw new BadRequestException('Category not found');
        }

        // Discount price validation
        if (
            productData.discountPrice !== undefined &&
            productData.discountPrice > productData.price
        ) {
            throw new BadRequestException(
                'Discount price cannot be greater than price',
            );
        }

        const existingProduct = await this.productRepository.findOne({
            where: {
                name: ILike(productName),
                category: {
                    id: categoryId,
                },
            },
        });

        if (existingProduct) {
            throw new BadRequestException(
                'Product already exists in this category',
            );
        }

        const product = this.productRepository.create({
            ...productData,
            name: productName,
            category,
        });

        return await this.productRepository.save(product);
    }

    // ===========================
    // Employee → View Products & Stock
    // ===========================
    async getEmployeeProducts() {
        const products = await this.productRepository.find({
            order: {
                id: 'ASC',
            },
        });

        return {
            message: 'Products retrieved successfully',
            totalProducts: products.length,
            products: products.map((product) => ({
                id: product.id,
                name: product.name,
                price: product.price,
                discountPrice: product.discountPrice,
                stock: product.stock,
                unit: product.unit,
                status: product.status,
            })),
        };
    }

    // ===========================
    // Get All Products
    // ===========================
   async findAll(
    search?: string,
    categoryId?: number,
    status?: string,
    page = 1,
    limit = 10,
    sort = 'id',
    order: 'ASC' | 'DESC' = 'ASC',
) {
    const allowedSortFields = [
        'id',
        'name',
        'price',
        'stock',
        'createdAt',
    ];

    if (!allowedSortFields.includes(sort)) {
        throw new BadRequestException(
            `Invalid sort field. Allowed fields: ${allowedSortFields.join(', ')}`,
        );
    }

    const query = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category');

    // Search by product name
    if (search) {
        query.andWhere(
            'product.name ILIKE :search',
            { search: `%${search}%` },
        );
    }

    // Filter by category
    if (categoryId) {
        query.andWhere(
            'category.id = :categoryId',
            { categoryId },
        );
    }

    // Filter by status
    if (status) {
        query.andWhere(
            'product.status = :status',
            { status },
        );
    }

    const [products, total] = await query
        .orderBy(`product.${sort}`, order)
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

    return {
        data: products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

    // ===========================
    // Get Single Product
    // ===========================
    async findOne(id: number) {
        const product = await this.productRepository.findOne({
            where: { id },
        });

        if (!product) {
            throw new BadRequestException('Product not found');
        }

        return product;
    }

    // ===========================
    // Update Product
    // ===========================
    async update(
        id: number,
        updateProductDto: UpdateProductDto,
    ) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: {
                category: true,
            },
        });

        if (!product) {
            throw new BadRequestException('Product not found');
        }

        let category = product.category;

        // Update Category
        if (updateProductDto.categoryId) {
            const newCategory =
                await this.categoryRepository.findOne({
                    where: {
                        id: updateProductDto.categoryId,
                    },
                });

            if (!newCategory) {
                throw new BadRequestException('Category not found');
            }

            category = newCategory;
        }

        // Update Product Name
        if (updateProductDto.name) {
            const productName =
                updateProductDto.name.trim();

            const existingProduct =
                await this.productRepository.findOne({
                    where: {
                        name: ILike(productName),
                        category: {
                            id: category.id,
                        },
                    },
                });

            if (
                existingProduct &&
                existingProduct.id !== id
            ) {
                throw new BadRequestException(
                    'Product already exists in this category',
                );
            }

            product.name = productName;
        }

        // =================================
        // Price & Discount Price Validation
        // =================================

        const newPrice =
            updateProductDto.price !== undefined
                ? updateProductDto.price
                : product.price;

        const newDiscountPrice =
            updateProductDto.discountPrice !== undefined
                ? updateProductDto.discountPrice
                : product.discountPrice;

        if (
            newDiscountPrice !== undefined &&
            newDiscountPrice !== null &&
            newDiscountPrice > newPrice
        ) {
            throw new BadRequestException(
                'Discount price cannot be greater than price',
            );
        }

        // Set Category
        product.category = category;

        const {
            categoryId,
            name,
            ...productData
        } = updateProductDto;

        // Update remaining fields
        Object.assign(product, productData);

        return await this.productRepository.save(product);
    }

    // ===========================
    // Delete Product
    // ===========================
    async remove(id: number) {
        const product = await this.productRepository.findOne({
            where: { id },
        });

        if (!product) {
            throw new BadRequestException('Product not found');
        }

        await this.productRepository.remove(product);

        return {
            message: 'Product deleted successfully',
        };
    }

    // ===========================
    // Search Product
    // ===========================
    async search(name: string) {
        const products = await this.productRepository.find({
            where: {
                name: ILike(`%${name}%`),
            },
            order: {
                name: 'ASC',
            },
        });

        if (products.length === 0) {
            throw new BadRequestException('No product found');
        }

        return products;
    }

    // ===========================
    // Update Stock
    // ===========================
    async updateStock(id: number, stock: number) {
        const product = await this.productRepository.findOne({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        product.stock = stock;

        const updatedProduct =
            await this.productRepository.save(product);

        return {
            message: 'Product stock updated successfully',
            product: {
                id: updatedProduct.id,
                name: updatedProduct.name,
                stock: updatedProduct.stock,
                unit: updatedProduct.unit,
                status: updatedProduct.status,
            },
        };
    }
}