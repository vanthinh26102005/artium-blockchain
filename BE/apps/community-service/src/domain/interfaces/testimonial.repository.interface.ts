import { FindManyOptions, IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { Testimonial } from '../entities/testimonials.entity';
import { CreateTestimonialInput } from '../dtos';

export const ITestimonialRepository = Symbol('ITestimonialRepository');

export interface ITestimonialRepository extends IRepository<
  Testimonial,
  string
> {
  create(
    data: CreateTestimonialInput,
    transactionManager?: EntityManager,
  ): Promise<Testimonial>;

  findByArtworkId(
    artworkId: string,
    options?: FindManyOptions<Testimonial>,
    transactionManager?: EntityManager,
  ): Promise<Testimonial[]>;

  findBySellerId(
    sellerId: string,
    options?: FindManyOptions<Testimonial>,
    transactionManager?: EntityManager,
  ): Promise<Testimonial[]>;

  findByBuyerId(
    buyerId: string,
    options?: FindManyOptions<Testimonial>,
    transactionManager?: EntityManager,
  ): Promise<Testimonial[]>;

  findApproved(
    sellerId: string,
    options?: FindManyOptions<Testimonial>,
    transactionManager?: EntityManager,
  ): Promise<Testimonial[]>;

  approve(
    id: string,
    approvedBy: string,
    transactionManager?: EntityManager,
  ): Promise<Testimonial | null>;

  reject(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<Testimonial | null>;

  flag(
    id: string,
    reason: string,
    transactionManager?: EntityManager,
  ): Promise<Testimonial | null>;

  addSellerResponse(
    id: string,
    response: string,
    transactionManager?: EntityManager,
  ): Promise<Testimonial | null>;

  incrementHelpfulCount(
    id: string,
    isHelpful: boolean,
    transactionManager?: EntityManager,
  ): Promise<void>;

  getAverageRatingForSeller(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<number>;

  getAverageRatingForArtwork(
    artworkId: string,
    transactionManager?: EntityManager,
  ): Promise<number>;

  hasUserReviewedArtwork(
    buyerId: string,
    artworkId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean>;
}
