import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto) {
        const { name } = createCategoryDto;

        // Check duplicate category
        const categoryExists = await this.categoryRepository.findOne({
            where: { name },
        });

        if (categoryExists) {
            throw new BadRequestException('Category already exists');
        }

        // Create category
        const category = this.categoryRepository.create(createCategoryDto);

        // Save category
        return await this.categoryRepository.save(category);
    }
    async findAll() {
        return await this.categoryRepository.find({
            order: {
                id: 'ASC',
            },
        });
    }
    async update(
        id: number,
        updateCategoryDto: UpdateCategoryDto,
    ) {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });

        if (!category) {
            throw new BadRequestException('Category not found');
        }

        if (
            updateCategoryDto.name &&
            updateCategoryDto.name !== category.name
        ) {
            const exists = await this.categoryRepository.findOne({
                where: {
                    name: updateCategoryDto.name,
                },
            });

            if (exists) {
                throw new BadRequestException(
                    'Category name already exists',
                );
            }
        }

        Object.assign(category, updateCategoryDto);

        return await this.categoryRepository.save(category);
    }
    async remove(id: number) {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });

        if (!category) {
            throw new BadRequestException('Category not found');
        }

        await this.categoryRepository.remove(category);

        return {
            message: 'Category deleted successfully',
        };
    }
}