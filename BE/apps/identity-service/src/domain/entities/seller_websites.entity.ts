import { AbstractEntity } from '@app/common';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SellerProfile } from './seller_profiles.entity';

@Entity({ name: 'seller_websites' })
@Index(['sellerId'])
export class SellerWebsite extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'seller_id', type: 'varchar' })
  sellerId!: string;

  @Column({
    name: 'website_type',
    type: 'varchar',
    length: 50,
    default: 'portfolio',
  })
  websiteType!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 1024 })
  url!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon?: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ name: 'is_visible', type: 'boolean', default: true })
  isVisible!: boolean;

  @ManyToOne(() => SellerProfile, (profile) => profile.websites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seller_id' })
  sellerProfile?: SellerProfile;
}
