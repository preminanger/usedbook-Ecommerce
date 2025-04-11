import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum AddressType {
    HOME = 'home',
    WORK = 'work',
    OTHER = 'other',
}

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    houseNumber: string;
    
    @Column({ type: 'varchar', length: 100, nullable: true })
    building: string;

    @Column({ type: 'varchar', length: 100 })
    street: string;

    @Column({ type: 'varchar', length: 100 })
    subDistrict: string;

    @Column({ type: 'varchar', length: 100 })
    district: string;

    @Column({ type: 'varchar', length: 100 })
    province: string;

    @Column({ type: 'varchar', length: 10 })
    postalCode: string;

    @Column({ type: 'varchar', length: 100, default: 'Thailand' })
    country: string;

    @Column({ type: 'enum', enum: AddressType, default: AddressType.HOME })
    addressType: AddressType;

    @Column({ default: true})
    isActive: boolean;

    @Column({ type: 'text', nullable: true })
    additionalInfo: string;

    @ManyToOne(() => User, (user) => user.addresses)
    user: User;
}
