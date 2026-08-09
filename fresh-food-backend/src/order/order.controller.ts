import {
    Body,
    Controller,
    Get,
    Patch,
    Param,
    ParseIntPipe,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';

import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('order')
export class OrderController {

    constructor(
        private readonly orderService: OrderService,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER')
    async createOrder(
        @Request() req,
        @Body() createOrderDto: CreateOrderDto,
    ) {
        return await this.orderService.createOrder(
            req.user.id,
            createOrderDto,
        );
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER')
    async getMyOrders(
        @Request() req,
    ) {
        return await this.orderService.getMyOrders(
            req.user.id,
        );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER')
    async getOrderById(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.orderService.getOrderById(
            req.user.id,
            id,
        );
    }
    @Get('admin/all')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
async getAllOrders() {
    return await this.orderService.getAllOrders();
}

@Patch('admin/:id/status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
) {
    return await this.orderService.updateOrderStatus(
        id,
        updateOrderStatusDto.status,
    );
}
}