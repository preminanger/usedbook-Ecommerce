import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';

@Controller('address')
export class AddressController {
  constructor(private readonly _address: AddressService) {}

  @Post()
  create(@Body() address: Address) {
    return this._address.create(address);
  }

  @Get()
  findAll() {
    return this._address.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this._address.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this._address.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._address.remove(+id);
  }
}
