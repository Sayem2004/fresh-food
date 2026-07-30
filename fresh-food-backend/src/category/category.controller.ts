import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        return await this.categoryService.create(createCategoryDto);
    }
    @Get()
    async findAll() {
        return await this.categoryService.findAll();
    }
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return await this.categoryService.update(
            id,
            updateCategoryDto,
        );
    }
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.categoryService.remove(id);
    }
}