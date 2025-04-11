import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  sender: User;

  @ManyToOne(() => User, { eager: true })
  receiver: User;

  @Column({nullable: true})
  content: string;

  @Column({nullable: true})
  imageUrl?: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ default: false })
  isRead: boolean;
}
