import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cart_items' })
@Index(['cartId'])
@Index(['artworkId'])
@Index(['cartId', 'artworkId'], { unique: true })
export class CartItem extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'cart_item_id' })
  id!: string;

  @Column({ name: 'cart_id', type: 'uuid' })
  cartId!: string;

  @Column({ name: 'artwork_id', type: 'uuid' })
  artworkId!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({ type: 'smallint', default: 1 })
  quantity!: number;

  @Column({
    name: 'added_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  addedAt!: Date;
}
