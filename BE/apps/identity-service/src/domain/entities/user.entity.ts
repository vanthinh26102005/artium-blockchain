import { AbstractEntity, UserRole } from '@app/common';
import { registerEnumType } from '@nestjs/graphql';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

registerEnumType(UserRole, {
  name: 'UserRole',
});

@Entity({ name: 'users' })
@Index(['email'], { unique: true })
@Index(['googleId'], { unique: true, sparse: true })
@Index(['isActive', 'createdAt'])
export class User extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  id!: string;

  @Column({ type: 'varchar', length: 320, unique: true })
  email!: string;

  @Column({ name: 'password', type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullName: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 1024, nullable: true })
  avatarUrl: string | null;

  @Column({
    name: 'google_id',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  googleId: string | null;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.COLLECTOR],
  })
  roles!: UserRole[];

  @Column({
    name: 'stripe_customer_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripeCustomerId: string | null;

  @Column({
    name: 'last_login',
    type: 'timestamp with time zone',
    nullable: true,
  })
  lastLogin: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
