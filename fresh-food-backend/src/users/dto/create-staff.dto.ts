import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

import { Role } from '../../common/enums/role.enum';

export class CreateStaffDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name!: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsNotEmpty({ message: 'Phone is required' })
  phone!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[@$!%*?&])/, {
    message: 'Password must contain at least one special character',
  })
  password!: string;

  @IsNotEmpty({ message: 'Address is required' })
  address!: string;

  @IsEnum(Role)
  role!: Role;
}