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
import { AssignDeliveryDto } from './dto/assign-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { PaymentReceivedDto } from './dto/payment-received.dto';
import { ConfirmOnlinePaymentDto } from './dto/confirm-online-payment.dto';

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

    @Get('delivery/my-orders')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('DELIVERYMAN')
    async getDeliveryOrders(
        @Request() req,
    ) {
        return await this.orderService.getDeliveryOrders(
            req.user.id,
        );
    }
    @Patch('admin/:id/assign-delivery')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async assignDeliveryMan(
        @Param('id', ParseIntPipe) id: number,
        @Body() assignDeliveryDto: AssignDeliveryDto,
    ) {
        return await this.orderService.assignDeliveryMan(
            id,
            assignDeliveryDto.deliveryManId,
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

    @Patch('delivery/:id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('DELIVERYMAN')
    async updateDeliveryStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDeliveryStatusDto: UpdateDeliveryStatusDto,
    ) {
        return await this.orderService.updateDeliveryStatus(
            req.user.id,
            id,
            updateDeliveryStatusDto.deliveryStatus,
        );
    }

    @Patch('delivery/:id/payment')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('DELIVERYMAN')
    async receiveCashPayment(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() paymentReceivedDto: PaymentReceivedDto,
    ) {
        return await this.orderService.receiveCashPayment(
            req.user.id,
            id,
            paymentReceivedDto.cashCollected,
        );
    }
    @Get('delivery/my-cash')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('DELIVERYMAN')
    async getMyCashBalance(@Request() req) {
        return await this.orderService.getDeliveryManCashBalance(
            req.user.id,
        );
    }
    @Get('delivery/cash-history')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('DELIVERYMAN')
    async getCashHistory(@Request() req) {
        return await this.orderService.getDeliveryManCashHistory(
            req.user.id,
        );
    }
    @Patch(':id/confirm-payment')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER')
    async confirmOnlinePayment(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() confirmOnlinePaymentDto: ConfirmOnlinePaymentDto,
    ) {
        return await this.orderService.confirmOnlinePayment(
            req.user.id,
            id,
            confirmOnlinePaymentDto.paymentMethod,
            confirmOnlinePaymentDto.transactionId,
        );
    }


}