import { AdminService } from './admin.service';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { Repository } from 'typeorm';

@Controller('admins')
export class AdminController {
    constructor(
        private readonly _admin: AdminService,
        @InjectRepository(Admin)
        private adminsRepository: Repository<Admin>
    ){}

    @Get()
    findAll (){
        return this._admin.findAll();
    }
    @Get(':id')
    finOne (@Param ('id') id:string){
        return this._admin.findOne(+id);
    }

    @Post()
    addAdmin(@Body() admin: Admin) {
        return this._admin.addAdmin(admin)
    }

}
