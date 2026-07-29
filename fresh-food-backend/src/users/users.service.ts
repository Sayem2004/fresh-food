import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private removePassword(user: any) {
    if (!user) return user;

    const { password, ...rest } = user;
    return rest;
  }

  async register(createUserDto: CreateUserDto) {
    const { email, phone, password } = createUserDto;

    // Check if email already exists
    const emailExists = await this.userRepository.findOne({
      where: { email },
    });

    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    // Check if phone already exists
    const phoneExists = await this.userRepository.findOne({
      where: { phone },
    });

    if (phoneExists) {
      throw new BadRequestException('Phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Return user without password
    return this.removePassword(savedUser);
  }

  // Find user by email (Used for Login)
  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }
}