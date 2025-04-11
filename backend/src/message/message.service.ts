import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Message } from './entities/message.entity';




@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>
  ) { }

  async sendMessage(senderId: number, receiverId: number, content: string) {
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const receiver = await this.userRepository.findOne({ where: { id: receiverId } });

    const message = this.messageRepository.create({ sender, receiver, content });
    return await this.messageRepository.save(message);
  }

  async getConversation(userId1: number, userId2: number) {
    return this.messageRepository.find({
      where: [
        { sender: { id: userId1 }, receiver: { id: userId2 } },
        { sender: { id: userId2 }, receiver: { id: userId1 } }
      ],
      order: { timestamp: 'ASC' },
      relations: ['sender', 'receiver']
    });
  }
  async getInbox(userId: number) {
    const messages = await this.messageRepository.find({
      where: [
        { sender: { id: userId } },
        { receiver: { id: userId } }
      ],
      relations: ['sender', 'receiver'],
      order: { timestamp: 'DESC' }
    });
    
    const inboxMap = new Map<number, any>();
  
    for (const msg of messages) {
      const senderId = msg.sender?.id;
      const receiverId = msg.receiver?.id;
  
      if (!senderId || !receiverId) continue;
      console.log('🧪 message', {
        sender: msg.sender.id,
        receiver: msg.receiver.id,
        currentUser: userId
      });
      
      const otherUser =
        senderId === userId ? msg.receiver :
        receiverId === userId ? msg.sender : null;
  
      if (!otherUser || otherUser.id === userId) continue;
      console.log('📦 เพิ่มเข้า inboxMap → otherUser:', otherUser.username, '| id:', otherUser.id);

      if (!inboxMap.has(otherUser.id)) {
        inboxMap.set(otherUser.id, {
          otherUser: {
            id: otherUser.id,
            username: otherUser.username,
            profileUrl: otherUser.profileUrl || '/default.jpg'
          },
          lastMessage: msg.content,
          lastTimestamp: msg.timestamp
        });
      }
    }
    console.log('📤 ส่งคืน inbox list:', Array.from(inboxMap.values()));

    return Array.from(inboxMap.values());
  }
  async sendImageMessage(senderId: number, receiverId:number, filename:string){
    const sender = await this.userRepository.findOneBy({id: senderId});
    const receiver = await this.userRepository.findOneBy({id: receiverId});

    const message = this.messageRepository.create({
      sender,
      receiver,
      imageUrl: '/uploads/chat/' + filename,
    });
    console.log('🖼️ Save image message:', message);
    return this.messageRepository.save(message)
  }
  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
