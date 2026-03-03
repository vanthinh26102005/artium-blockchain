import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { User } from '../entities/user.entity';
import { EntityManager } from 'typeorm';
import { CreateUserInput } from '../dtos/input';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async ensureEmailIsUnique(email: string): Promise<void> {
    this.logger.debug(`Checking for existence of email: ${email}`);
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`Attempted registration with existing email: ${email}`);
      throw new ConflictException(`Email '${email}' đã được sử dụng.`);
    }
    this.logger.debug(`Email ${email} is unique.`);
  }

  async createUser(
    createUserInput: CreateUserInput,
    transactionManager?: EntityManager,
  ): Promise<User> {
    this.logger.log(`Creating new user for email: ${createUserInput.email}`);

    const newUser = await this.userRepository.create(
      createUserInput,
      transactionManager,
    );
    this.logger.log(`Successfully created user with ID: ${newUser.id}`);
    return newUser;
  }
}
