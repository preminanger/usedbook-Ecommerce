import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'
import { Cart } from 'src/cart/entities/cart.entity';
import { JwtService } from '@nestjs/jwt';
import { Address } from 'src/address/entities/address.entity';
import { Order } from 'src/order/entities/order.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(Address)
    private addressRepository: Repository<Address>,

    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    private jwtService: JwtService

  ) {
  }
  async blacklistUser(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
  
    if (!user) throw new NotFoundException('User not found');
    console.log('Before update:', user.isBlacklisted);
    user.isBlacklisted = true;
    console.log('After update:', user.isBlacklisted);
    return this.usersRepository.save(user);
  }
  
  
  async findAll() {
    return await this.usersRepository.find({ relations: ['cart'] })
  }

  async update(id: number, userData: Partial<User>) {
    await this.usersRepository.update(id, userData);
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { cart: true, addresses: true }
    });
  
    if (user?.addresses) {
      user.addresses = user.addresses.filter(addr => addr.isActive);
    }
  
    return user;
  }
  
  async updateBankInfo(id: number, data: any, file?: Express.Multer.File) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new Error('User not found');
  
    user.bank_name = data.bank_name;
    user.account_name = data.account_name;
    user.account_number = data.account_number;
  
    if (file) {
      user.qr_image_url = '/uploads/bank/' + file.filename;
    }
  
    return await this.usersRepository.save(user);
  }
  
  async createUser(user: User) {
    try {
      console.log(user);
      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltOrRounds);
      const dataUser = {
        username: user.username,
        password: hashedPassword,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone_number: user.phone_number,
        birth_date: user.birth_date
      };
      const savedUser = await this.usersRepository.save(dataUser);
      await this.initializeCart(savedUser.id); 
      return { userId: savedUser.id }; 
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('User registration failed'); 
    }
  }

  async initializeCart(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User not found');
    }

    const existingCart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (existingCart) {
      return existingCart;
    }

    const newCart = this.cartRepository.create({ user });
    return this.cartRepository.save(newCart);
  }

  async remove(id: number) {
    await this.usersRepository.delete(id);
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { username }, relations: ['cart'] });
    console.log(user)
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null
  }
  
  async updateProfile(form: any, file: Express.Multer.File) {
    try {
      if (file) {
        form.profileUrl = file.path;
      }
  
      const userId = form.id;
      console.log('🟡 form.addresses:', form.addresses);

      // 1. อัปเดต user
      const userData = {
        username: form.username,
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        birth_date: form.birth_date,
        profileUrl: form.profileUrl,
        phone_number: form.phone_number
      };
      await this.usersRepository.update(userId, userData);
  
     
      const user = await this.usersRepository.findOne({ where: { id: userId } });

      if (!user) throw new NotFoundException('❌ User not found');
      const notDeletedAddresses = [];
      // 3. ลบ address ที่ถูกลบจากฟอร์ม (ถ้าไม่ถูกใช้ใน order)
      for (const addrId of form.deletedAddressIds || []) {
        console.log('🧹 Address ที่ขอลบ:', addrId);
        const usedInOrder = await this.orderRepository.findOne({
          where: { shippingAddress: { id: addrId } }
        });
        if (!usedInOrder) {
          await this.addressRepository.update(addrId, { isActive: false });
          console.log('✅ Address soft-deleted:', addrId);
        } else {
          console.log('⚠️ Cannot delete, used in order:', addrId);
          notDeletedAddresses.push(addrId)
          
        }
      }
  
      // 4. เพิ่มหรืออัปเดต address ที่เหลือ
      if (Array.isArray(form.addresses)) {
        for (const addr of form.addresses) {
          if (addr.id) {
            await this.addressRepository.update(addr.id, { ...addr });
          } else {
            const newAddress = this.addressRepository.create({ ...addr, user });
            await this.addressRepository.save(newAddress);
          }
        }
      }
  
      // 5. ส่งกลับ user + token ใหม่
      const fullUser = await this.usersRepository.findOne({
        where: { id: userId },
        relations: { cart: true, addresses: true }
      });

      
      if (fullUser?.addresses) {
        fullUser.addresses = fullUser.addresses.filter(addr => addr.isActive !== false);
      }
      const token = await this.jwtService.signAsync(JSON.parse(JSON.stringify(fullUser)));
      return { status: 'success', data: fullUser, token, notDeletedAddresses };
  
    } catch (e) {
      console.error('🔥 updateProfile error:', e);
      return { status: 'error', message: e.message || 'Update failed' };
    }
    
  }
  
}
