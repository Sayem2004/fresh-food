import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

import { Category } from './entities/category.entity';
import { Product } from '../product/entities/product.entity';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    // ==============================
    // Create Category
    // ==============================
    async create(createCategoryDto: CreateCategoryDto) {
        const categoryName = createCategoryDto.name.trim();

        // Duplicate Check (Case Insensitive)
        const existingCategory = await this.categoryRepository.findOne({
            where: {
                name: ILike(categoryName),
            },
        });

        if (existingCategory) {
            throw new BadRequestException(
                'Category already exists',
            );
        }

        const category = this.categoryRepository.create({
            ...createCategoryDto,
            name: categoryName,
        });

        return await this.categoryRepository.save(category);
    }

    // ==============================
    // Get All Categories
    // ==============================
    async findAll() {
        return await this.categoryRepository.find({
            order: {
                id: 'ASC',
            },
        });
    }

    // ==============================
    // Get Single Category
    // ==============================
    async findOne(id: number) {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });

        if (!category) {
            throw new BadRequestException(
                'Category not found',
            );
        }

        return category;
    }

    // ==============================
    // Search Category
    // ==============================
    async search(name: string) {
        const categories = await this.categoryRepository.find({
            where: {
                name: ILike(`%${name}%`),
            },
            order: {
                name: 'ASC',
            },
        });

        if (categories.length === 0) {
            throw new BadRequestException(
                'No category found',
            );
        }

        return categories;
    }
        // ==============================
    // Update Category
    // ==============================
    async update(
        id: number,
        updateCategoryDto: UpdateCategoryDto,
    ) {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });

        if (!category) {
            throw new BadRequestException(
                'Category not found',
            );
        }

        // Duplicate Check
        if (updateCategoryDto.name) {
            const categoryName =
                updateCategoryDto.name.trim();

            const existingCategory =
                await this.categoryRepository.findOne({
                    where: {
                        name: ILike(categoryName),
                    },
                });

            // Ignore current category
            if (
                existingCategory &&
                existingCategory.id !== id
            ) {
                throw new BadRequestException(
                    'Category already exists',
                );
            }

            category.name = categoryName;
        }

        // Update Other Fields
        const { name, ...otherData } =
            updateCategoryDto;

        Object.assign(category, otherData);

        return await this.categoryRepository.save(
            category,
        );
    }

    // ==============================
    // Delete Category
    // ==============================
    async remove(id: number) {
        const category =
            await this.categoryRepository.findOne({
                where: { id },
                relations: {
                    products: true,
                },
            });

        if (!category) {
            throw new BadRequestException(
                'Category not found',
            );
        }

        // Prevent Delete if Products Exist
        if (
            category.products &&
            category.products.length > 0
        ) {
            throw new BadRequestException(
                'Cannot delete category because products exist in this category',
            );
        }

        await this.categoryRepository.remove(category);

        return {
            message:
                'Category deleted successfully',
        };
    }
}