import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from '../../category/entities/category.entity';
import { Status } from '../../common/enums/status.enum';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  price!: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
  })
  discountPrice!: number;

  @Column()
  stock!: number;

  @Column()
  unit!: string;

  @Column({
    nullable: true,
  })
  image!: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status!: Status;

  @ManyToOne(
    () => Category,
    (category) => category.products,
    {
      eager: true,
      onDelete: 'RESTRICT',
    },
  )
  category!: Category;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}