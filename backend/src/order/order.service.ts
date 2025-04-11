import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus, ShippingMethod } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { Pokemon } from 'src/pokemon/pokemon.entity';
import { OrderItem } from 'src/order-item/entities/order-item.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Pokemon)
    public pokemonRepository: Repository<Pokemon>
  ) { }

  async findAll() {
    return await this.orderRepository.find({ relations: ['user', 'cartItems'] });
  }
  async savePaymentSlip(id: number, filename: string) {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) throw new NotFoundException('Order not found');

    order.payment_proof = '/uploads/payment/' + filename;
    order.status = OrderStatus.SLIP_UPLOADED;
    return await this.orderRepository.save(order);
  }

  async findOrderByUserId(id: number) {
    const orders = await this.orderRepository.find({
      where: { user: { id } },
      relations: {
        user: true,
        shippingAddress: true,
        orderItems: {
          pokemon: {
            user: true
          }
        } // ใช้ orderItems แล้วโหลด pokemon มาด้วย
      }
    });

    //  แปลง imageUrls ของแต่ละ orderItem ให้เป็น array
    for (const order of orders) {
      for (const item of order.orderItems || []) {
        try {
          const raw = item.pokemon?.imageUrls;
          (item.pokemon as any).imageUrlsParsed = JSON.parse(raw || '[]');
        } catch {
          (item.pokemon as any).imageUrlsParsed = [];
        }
      }
    }

    return orders;
  }

  async createOrder(body: { user: { id: number }, cart: { id: number }, address: { id: number }, shippingMethod: ShippingMethod, shippingFee: number }) {
    const cartItems = await this.cartItemRepository.find({
      where: { cart: { id: body.cart.id } },
      relations: ['cart', 'pokemon'],
    });

    console.log('CreateOrder(cartItems) ::->', cartItems);

    let totalPrice = 0;
    for (const item of cartItems) {
      totalPrice += item.pokemon.price * item.quantity;
    }

    const newOrder = this.orderRepository.create({
      user: { id: body.user.id },
      price: totalPrice,
      order_code: `OR-${Date.now()}`,
      shippingAddress: { id: body.address.id },
      shippingMethod: body.shippingMethod,
      shippingFee: body.shippingFee
    });
    const savedOrder = await this.orderRepository.save(newOrder);

    for (const item of cartItems) {
      if (item.pokemon.quantity < item.quantity) {
        throw new Error(`Not enough stock for ${item.pokemon.name}`);
      }
      item.pokemon.quantity -= item.quantity;
      await this.pokemonRepository.save(item.pokemon);
      const orderItem = this.orderItemRepository.create({
        order: savedOrder,
        pokemon: item.pokemon,
        quantity: item.quantity,
        price: item.pokemon.price,
      });
      await this.orderItemRepository.save(orderItem);
    }
    await this.cartItemRepository.remove(cartItems);
    return savedOrder;
  }

  async cancelOrder(orderId: number) {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.pokemon', 'pokemon')
      .where('order.id = :id', { id: orderId })
      .getOne();

    console.log('✅ Loaded Order:', order);
    console.log('🧪 Checking order before cancel:', order);
    if (!order || order.status !== OrderStatus.WAITING_PAYMENT) {
      console.log('❌ Order not found or not WAITING_PAYMENT', order?.status);
      throw new Error('Cannot cancel this order');
    }
    console.log('📦 OrderItems in this order:', order.orderItems);

    //  คืน stock
    for (const item of order.orderItems) {
      console.log('🔁 Restoring stock for:', item.pokemon?.name, 'qty:', item.quantity);

      if (!item.pokemon) {
        throw new Error(`Pokemon not found in OrderItem with ID: ${item.id}`);
      }

      item.pokemon.quantity += item.quantity;
      await this.pokemonRepository.save(item.pokemon);
      console.log('✅ Stock restored:', item.pokemon.name, '→', item.pokemon.quantity);
    }

    order.status = OrderStatus.CANCELLED;
    return await this.orderRepository.save(order);
  }

  async updateStatus(orderId: number, statusData: {
    status: OrderStatus;
    trackingNumber?: string;
    shippingProvider?: string;
    shippingMethod?: ShippingMethod;
    shippingFee?: number;
  }) {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) throw new Error('Order not found');

    if (!Object.values(OrderStatus).includes(statusData.status)) {
      throw new Error('Invalid status');
    }

    order.status = statusData.status;
    // เพิ่มการอัปเดต tracking info ถ้ามีมา
    if (statusData.trackingNumber) {
      order.trackingNumber = statusData.trackingNumber;
    }
    if (statusData.shippingProvider) {
      order.shippingProvider = statusData.shippingProvider;
    }
    if (statusData.shippingMethod) order.shippingMethod = statusData.shippingMethod;
    if (typeof statusData.shippingFee === 'number') order.shippingFee = statusData.shippingFee;
    return await this.orderRepository.save(order);
  }

  findByUser(userId: number) {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['pokemon', 'user'], 
      order: { created_at: 'DESC' },
    });
  }
  
  async getMySales(userId: number) {
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.pokemon', 'pokemon')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .where('pokemon.user_id = :userId', { userId })
      .getMany();

    return orders;
  }


  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
