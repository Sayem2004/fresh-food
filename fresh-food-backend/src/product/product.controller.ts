import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('product')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
    ) { }

    // Create Product (Admin Only)
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async create(
        @Body() createProductDto: CreateProductDto,
    ) {
        return await this.productService.create(createProductDto);
    }

    // Get All Products
    @Get()
    async findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        @Query('categoryId') categoryId?: string,
        @Query('sort') sort = 'id',
        @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    ) {
        return await this.productService.findAll(
            Number(page),
            Number(limit),
            categoryId ? Number(categoryId) : undefined,
            sort,
            order,
        );
    }

    // Search Product by Name
    @Get('search')
    async search(
        @Query('name') name: string,
    ) {
        return await this.productService.search(name);
    }

    // Get Single Product
    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.productService.findOne(id);
    }

    // Update Product (Admin Only)
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return await this.productService.update(
            id,
            updateProductDto,
        );
    }

    // Delete Product (Admin Only)
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.productService.remove(id);
    }
}