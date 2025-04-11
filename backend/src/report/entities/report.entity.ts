// report.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.reportsMade, { eager: true })
  reporter: User;

  @ManyToOne(() => User, user => user.reportsReceived, { eager: true })
  reportedUser: User;
}
