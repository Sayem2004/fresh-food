import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../common/enums/role.enum';
import { CreateStaffDto } from './dto/create-staff.dto';
import { Status } from '../common/enums/status.enum';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  private removePassword(user: any) {
    if (!user) return user;

    const { password, ...rest } = user;
    return rest;
  }



  async findAll(
    search?: string,
    role?: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    if (page < 1) {
      page = 1;
    }

    if (limit < 1) {
      limit = 10;
    }

    if (limit > 50) {
      limit = 50;
    }

    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      query.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    const [users, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      users: users.map((user) => this.removePassword(user)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async createStaff(createStaffDto: CreateStaffDto) {
    const { email, phone, password, role } = createStaffDto;

    if (role !== Role.EMPLOYEE && role !== Role.DELIVERYMAN) {
      throw new BadRequestException(
        'Only EMPLOYEE or DELIVERYMAN can be created',
      );
    }

    const emailExists = await this.userRepository.findOne({
      where: { email },
    });

    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    const phoneExists = await this.userRepository.findOne({
      where: { phone },
    });

    if (phoneExists) {
      throw new BadRequestException('Phone already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...createStaffDto,
      password: hashedPassword,
      role,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      message: `${role} created successfully`,
      user: this.removePassword(savedUser),
    };
  }

  // Find user by email (Used for Login)
  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async updateUserRole(id: number, role: Role) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.role = role;

    const updatedUser = await this.userRepository.save(user);

    return {
      message: 'User role updated successfully',
      user: this.removePassword(updatedUser),
    };
  }
  async updateUserStatus(id: number, status: Status) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.status = status;

    const updatedUser = await this.userRepository.save(user);

    return {
      message: 'User status updated successfully',
      user: this.removePassword(updatedUser),
    };
  }
}