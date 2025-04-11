import { Injectable } from '@nestjs/common';
import { Admin } from './admin.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private adminsRepository: Repository<Admin>
    ) { }

    async findAll(){
        return await this.adminsRepository.find();
    }
    async findOne(id:number){
        return await this.adminsRepository.findOne({where : {id}});
    }

    async addAdmin(admin: Admin){
        return await this.adminsRepository.save(admin);
    }

    async update(id:number, admin: Admin){
        await this.adminsRepository.update(id,admin);
        return this.adminsRepository.findOne({where: {id}});
    }
    async remove(id:number){
        await this.adminsRepository.delete(id);
    }
}
