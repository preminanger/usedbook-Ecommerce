import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,

    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}


  async create(data: any) {
    const user_id = Number(data.user_id)
    const user = await this.usersRepository.findOneBy({id: data.user_id})
    console.log('user object ที่หาได้ (func address service):', user);
    if(!user) throw new NotFoundException('User not found');
    const address = this.addressRepo.create({
      ...data,
      user,
    });
    return this.addressRepo.save(address)
  }

  findAll() {
    return this.addressRepo.find({ relations: ['user'] });
  }

  findOne(id: number) {
    return this.addressRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async update(id: number, data: any) {
    const address = await this.addressRepo.preload({
      id,
      ...data,
    });
    if (!address) throw new NotFoundException('Address not found');

    return this.addressRepo.save(address);
  }

  async remove(id: number) {
    const address = await this.addressRepo.findOneBy({ id });
    if (!address) throw new NotFoundException('Address not found');

    return this.addressRepo.remove(address);
  }
}
