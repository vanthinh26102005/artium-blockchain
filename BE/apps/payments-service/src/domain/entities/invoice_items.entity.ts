import { AbstractEntity } from '@app/common';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Invoice } from './invoices.entity';

@Entity({ name: 'invoice_items' })
@Index(['invoiceId'])
@Index(['artworkId'])
export class InvoiceItem extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' })
  id!: string;

  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId!: string;

  @Column({ name: 'artwork_id', type: 'uuid', nullable: true })
  artworkId?: string | null;

  @Column({
    name: 'artwork_title',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  artworkTitle?: string | null;

  @Column({
    name: 'artwork_image_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  artworkImageUrl?: string | null;

  @Column({ type: 'varchar', length: 1024 })
  description!: string;

  @Column({ type: 'smallint', default: 1 })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice!: number;

  @Column({
    name: 'line_total',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  lineTotal?: number | null;

  @Column({
    name: 'tax_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  taxRate?: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  taxAmount!: number;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    nullable: true,
  })
  discountAmount?: number | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice?: Invoice;
}
