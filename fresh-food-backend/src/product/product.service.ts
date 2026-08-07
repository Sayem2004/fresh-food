import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';

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
    // Get All Products
    // ===========================
    async findAll(
        page = 1,
        limit = 10,
        categoryId?: number,
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

        const where = categoryId
            ? {
                category: {
                    id: categoryId,
                },
            }
            : {};

        const [products, total] =
            await this.productRepository.findAndCount({
                where,
                skip: (page - 1) * limit,
                take: limit,
                order: {
                    [sort]: order,
                },
            });

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
    async update(id: number, updateProductDto: UpdateProductDto) {
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

        if (updateProductDto.categoryId) {
            const newCategory = await this.categoryRepository.findOne({
                where: {
                    id: updateProductDto.categoryId,
                },
            });

            if (!newCategory) {
                throw new BadRequestException('Category not found');
            }

            category = newCategory;
        }

        if (updateProductDto.name) {
            const productName = updateProductDto.name.trim();

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

        product.category = category;

        const {
            categoryId,
            name,
            ...productData
        } = updateProductDto;

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
}