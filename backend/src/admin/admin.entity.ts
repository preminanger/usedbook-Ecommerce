import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('admins')
export class Admin{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50})
    username: string;

    @Column({length: 300})
    password: string;

    @Column({length: 50})
    nickname: string;
}