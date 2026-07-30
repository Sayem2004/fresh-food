import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

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
}