import { Injectable, Inject } from '@nestjs/common';
import { OrderDomain } from '@domain/Entities/OrderDomain';
import { OrderRepositoryInterface } from '@application/RepositoryInterfaces/OrderRepositoryInterface';

@Injectable()
export class OrderService {
  constructor(
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface
  ) {}

  async create(orderData: {
    pieces: object[];
    status: string;
    orderDate: string;
    deliveryDate: string;
    totalAmount?: number;
  }): Promise<OrderDomain> {
    const order = new OrderDomain(
      null,
      orderData.pieces,
      orderData.status,
      orderData.orderDate,
      orderData.deliveryDate,
      orderData.totalAmount,
    );
    return await this.orderRepository.create(order);
  }

  async findAllFilters(criteria: {
    filters?: {  orderDate?: string; deliveryDate?: string; status?: string; totalAmount?: number; quantity?: number },
    pagination?: { offset?: number; limit?: number }
  }): Promise<OrderDomain[]> {
    return await this.orderRepository.findAllFilters(criteria);
  }
  async findById(id: string): Promise<OrderDomain> {
    return await this.orderRepository.findById(id);
  }

  async findByStatus(status: string): Promise<OrderDomain> {
    return await this.orderRepository.findByStatus(status);
  }
  async findByOrderDate(date: string): Promise<OrderDomain> {
    return await this.orderRepository.findByStatus(date);
  }
  async findByDeliveryDate(date: string): Promise<OrderDomain> {
    return await this.orderRepository.findByStatus(date);
  }
  async findByTotalAmount(totalAmont: number): Promise<OrderDomain> {
    return await this.orderRepository.findByTotalAmount(totalAmont);
  }

  async findAll(): Promise<OrderDomain[]> {
    return await this.orderRepository.findAll();
  }

  async update(id: string, orderData: Partial<OrderDomain>): Promise<OrderDomain> {
    return await this.orderRepository.update(id, orderData);
  }
  async updatePatch(id: string, orderData: Partial<OrderDomain>): Promise<OrderDomain> {
    return await this.orderRepository.updatePatch(id, orderData);
  }
  async delete(id: string): Promise<void> {
    await this.orderRepository.delete(id);
  }
}