import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OneToMany } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

import { Status } from '../../common/enums/status.enum';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
  })
  name!: string;

  @Column({
    nullable: true,
  })
  description!: string;

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(
  () => Product,
  (product) => product.category,
)
products!: Product[];
}