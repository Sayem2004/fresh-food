import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Like } from 'typeorm';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async create(createProductDto: CreateProductDto) {
        const { categoryId, ...productData } = createProductDto;

        // Check Category
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
        });

        if (!category) {
            throw new BadRequestException('Category not found');
        }

        const product = this.productRepository.create({
            ...productData,
            category,
        });

        return await this.productRepository.save(product);
    }

    async findAll(
        page = 1,
        limit = 10,
        categoryId?: number,
        sort = 'id',
        order: 'ASC' | 'DESC' = 'ASC',
    ) {
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

    async findOne(id: number) {
        const product = await this.productRepository.findOne({
            where: { id },
        });

        if (!product) {
            throw new BadRequestException('Product not found');
        }

        return product;
    }
    async update(id: number, updateProductDto: UpdateProductDto) {
        const product = await this.productRepository.findOne({
            where: { id },
        });

        if (!product) {
            throw new BadRequestException('Product not found');
        }

        if (updateProductDto.categoryId) {
            const category = await this.categoryRepository.findOne({
                where: { id: updateProductDto.categoryId },
            });

            if (!category) {
                throw new BadRequestException('Category not found');
            }

            product.category = category;
        }

        const { categoryId, ...productData } = updateProductDto;

        Object.assign(product, productData);

        return await this.productRepository.save(product);
    }
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
    async search(name: string) {
        return await this.productRepository.find({
            where: {
                name: Like(`%${name}%`),
            },
            order: {
                id: 'ASC',
            },
        });
    }

}