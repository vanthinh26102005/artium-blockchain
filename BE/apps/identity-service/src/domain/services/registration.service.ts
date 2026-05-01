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

  /**
   * Generates a unique slug from a base string (fullName, email prefix, or wallet address).
   * Normalizes to lowercase, replaces non-alphanumeric chars with hyphens,
   * and appends random digits on collision.
   */
  async generateUniqueSlug(
    base: string,
    transactionManager?: EntityManager,
  ): Promise<string> {
    const candidate = String(base ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 75);

    const slug = candidate.length >= 3
      ? candidate
      : `user-${candidate || Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await this.userRepository.findBySlug(slug, transactionManager);
    if (!existing) return slug;

    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      const suffix = Math.floor(1000 + Math.random() * 9000).toString();
      const slugWithSuffix = `${slug}-${suffix}`;
      const found = await this.userRepository.findBySlug(
        slugWithSuffix,
        transactionManager,
      );
      if (!found) return slugWithSuffix;
    }

    const fallback = `${slug}-${Date.now()}`;
    return fallback;
  }

  /**
   * Derives the best slug base from user creation input.
   */
  deriveSlugBase(input: Partial<CreateUserInput>): string {
    if (input.fullName) return input.fullName;
    if (input.email) return input.email.split('@')[0];
    if (input.walletAddress) return input.walletAddress.slice(0, 10);
    return 'user';
  }

  async createUser(
    createUserInput: CreateUserInput,
    transactionManager?: EntityManager,
  ): Promise<User> {
    this.logger.log(`Creating new user for email: ${createUserInput.email}`);

    if (!createUserInput.slug) {
      const slugBase = this.deriveSlugBase(createUserInput);
      createUserInput.slug = await this.generateUniqueSlug(
        slugBase,
        transactionManager,
      );
      this.logger.debug(`Auto-generated slug: ${createUserInput.slug}`);
    }

    const newUser = await this.userRepository.create(
      createUserInput,
      transactionManager,
    );
    this.logger.log(`Successfully created user with ID: ${newUser.id}`);
    return newUser;
  }
}
