import { Address } from "src/address/entities/address.entity";
import { Cart } from "src/cart/entities/cart.entity";
import { Order } from "src/order/entities/order.entity";
import { Pokemon } from "src/pokemon/pokemon.entity";
import { Report } from "src/report/entities/report.entity";
import { Review } from "src/review/entities/review.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    username: string;

    @Column({ length: 300 })
    password: string;

    @Column({ length: 50 })
    firstname: string;

    @Column({ length: 50 })
    lastname: string;

    @Column({ length: 50 })
    email: string;

    @Column({ length: 20 })
    phone_number: string;

    @Column({ nullable: true })
    bank_name: string;

    @Column({ nullable: true })
    account_name: string;

    @Column({ nullable: true })
    account_number: string;

    @Column({ nullable: true })
    qr_image_url: string;

    @Column()
    birth_date: Date;

    @Column({ length: 5000, nullable: true })
    profileUrl: string;

    @OneToOne(() => Cart, (cart) => cart.user, { cascade: true })
    cart: Cart[];

    @OneToMany(() => Order, order => order.user)
    order: Order

    @OneToMany(() => Pokemon, (pokemon) => pokemon.user)
    pokemons: Pokemon[];

    @OneToMany(() => Address, (address) => address.user)
    addresses: Address[];

    @OneToMany(() => Review, review => review.user)
    reviews: Review[];

    @OneToMany(() => Report, report => report.reporter)
    reportsMade: Report[];

    @OneToMany(() => Report, report => report.reportedUser)
    reportsReceived: Report[];

    @Column({ default: false })
    isBlacklisted: boolean;

    @Column({default: false})
    isAdmin: boolean
}
