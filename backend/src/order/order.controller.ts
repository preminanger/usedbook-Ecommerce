import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, UseInterceptors, UploadedFile, NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order, OrderStatus, ShippingMethod } from './entities/order.entity';
import { Pokemon } from 'src/pokemon/pokemon.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('order')
export class OrderController {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private readonly orderService: OrderService) { }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get('order-history/:id')
  async findOne(@Param('id') id: string) {
    return await this.orderService.findOrderByUserId(+id)
  }

  @Post('create-order')
  async createOrder(@Body() body: { user: { id: number }, cart: { id: number }, pokemon: Pokemon, address: { id: number }, shippingMethod: ShippingMethod,
  shippingFee: number }) {
    return await this.orderService.createOrder(body)
  }
  @Patch('cancel/:id')
  async cancelOrder(@Param('id') id: number) {
    return this.orderService.cancelOrder(id);
  }
  @Post(':id/upload-proof')
  @UseInterceptors(FileInterceptor('proof', {
    storage: diskStorage({
      destination: './uploads/payment',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async uploadProof(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const order = await this.orderService.savePaymentSlip(id, file.filename);
    return { status: 'success', data: order };
  }
  @Patch('update-status/:id')
  async updateOrderStatus(
    @Param('id') orderId: number,
    @Body() body: { status: OrderStatus,trackingNumber?: string, shippingProvider?: string }
  ) {
    return this.orderService.updateStatus(orderId, body);
  }
  @Get('my-sales/:id')
  getMySales(@Param('id') userId: number) {
    return this.orderService.getMySales(userId);
  }
  @Get('user/:userId')
getOrdersByUser(@Param('userId') userId: number) {
  return this.orderService.findByUser(userId);
}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
