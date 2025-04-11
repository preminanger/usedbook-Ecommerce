import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Address } from 'src/address/entities/address.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>
  ) { }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(id);
    return this.userService.findOne(+id)
  }

  @Post('sign-up')
  createUser(@Body() userData: User) {
    return this.userService.createUser(userData)
  }


  @Get('check-username/:username')
  async checkUsername(@Param('username') username: string): Promise<boolean> {
    const existingUser = await this.usersRepository.findOne({ where: { username } });
    return !!existingUser;
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() userData: Partial<User>): Promise<User> {
    const numericId = parseInt(id, 10); // แปลง id จาก string เป็น number
    await this.userService.update(numericId, userData); // เรียกใช้ service เพื่ออัปเดตข้อมูล
    return this.userService.findOne(numericId); // ดึงข้อมูลที่อัปเดตกลับมา
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id)
  }
  @Get(':id/addresses')
  getUserAddresses(@Param('id') userId: number) {
    return this.addressRepository.find({
      where: { user: { id: userId } },
    });
  }
  @Post('/update-profile')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/profile',
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
  }))
  async createWithFile(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      if (!body.form) {
        console.error('⚠️ form ไม่ถูกส่งมาจาก frontend');
        throw new Error('❌ Missing form data from frontend');
      }

      const parsedForm = JSON.parse(body.form);
      return this.userService.updateProfile(parsedForm, file);
    } catch (err) {
      console.error('🔥 update-profile error:', err);
      return { status: 'error', message: 'Invalid data received' };
    }
  }
  @Patch('blacklist/:id')
  blacklist(@Param('id') id: number) {
    return this.userService.blacklistUser(+id);
  }
  @Patch(':id/bank-info')
  @UseInterceptors(FileInterceptor('qr_image', {
    storage: diskStorage({
      destination: './uploads/bank',
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      }
    })
  }))
  async updateBankInfo(
    @Param('id') id: number,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.userService.updateBankInfo(id, body, file);
  }

}
