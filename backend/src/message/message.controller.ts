import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  @Post('send')
  async sendMessage(@Body() body: { senderId: number, receiverId: number, content: string }) {
    return this.messageService.sendMessage(body.senderId, body.receiverId, body.content);
  }

  @Get('conversation/:user1/:user2')
  async getConversation(@Param('user1') user1: number, @Param('user2') user2: number) {
    return this.messageService.getConversation(user1, user2);
  }
  @Get('inbox/:userId')
  getInbox(@Param('userId') userId: string) {
    console.log('👀 typeof userId:', typeof userId); // ถ้าได้ 'string' = แสดงว่า controller ไม่แปลง!

    return this.messageService.getInbox(+userId);
  }

  @Post('send-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/chat',
      filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
      }
    })
  }))
  async sendImage(
    @Body() body: { senderId: number; receiverId: number },
    @UploadedFile() file: Express.Multer.File
  ) {
    
    return this.messageService.sendImageMessage(body.senderId, body.receiverId, file.filename);
    
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(+id);
  }
}
