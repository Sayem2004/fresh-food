import { UpdateCartDto } from './dto/update-cart.dto';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';

import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';


@Controller('cart')
export class CartController {
    constructor(
        private readonly cartService: CartService,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER')
    async addToCart(
        @Request() req,
        @Body() createCartDto: CreateCartDto,
    ) {
        return await this.cartService.addToCart(
            req.user.id,
            createCartDto,
        );
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER')
    async getMyCart(
        @Request() req,
    ) {
        return await this.cartService.getMyCart(
            req.user.id,
        );
    }

    @Get('summary')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER')
    async getCartSummary(
        @Request() req,
    ) {
        return await this.cartService.getCartSummary(
            req.user.id,
        );
    }


    @Get('checkout-validation')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER')
    async checkoutValidation(
        @Request() req,
    ) {
        return await this.cartService.checkoutValidation(
            req.user.id,
        );
    }


    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER')
    async updateCart(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCartDto: UpdateCartDto,
    ) {
        return await this.cartService.updateCart(
            req.user.id,
            id,
            updateCartDto,
        );
    }

    @Delete('clear')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER')
    async clearCart(
        @Request() req,
    ) {
        return await this.cartService.clearCart(req.user.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER')
    async remove(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.cartService.remove(
            req.user.id,
            id,
        );
    }
}