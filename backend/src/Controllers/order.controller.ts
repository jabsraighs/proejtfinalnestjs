import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Put, 
  Delete, 
  Patch,
  Query 
} from '@nestjs/common';
import { OrderService } from '../Service/order.service';
import { OrderDomain } from '@domain/Entities/OrderDomain';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() orderData: { pieces:object[],orderDate:string; deliveryDate:string; status: string; totalAmount: number }): Promise<OrderDomain> {
    return await this.orderService.create(orderData);
  }

  @Get()
  async findAllFilters(
    @Query('status') status?: string,
    @Query('deliveryDate') deliveryDate?: string,
    @Query('orderDate') orderDate?: string,
    @Query('totalAmount') totalAmount?: number,
    @Query('quantity') quantity?: number,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number
  ): Promise<OrderDomain[]> {
    return await this.orderService.findAllFilters({
      filters: {  orderDate,deliveryDate,status, totalAmount, quantity },
      pagination: { offset, limit }
    });
  }

  @Get()
  async findAll(): Promise<OrderDomain[]> {
    return await this.orderService.findAll();
  }
  @Get(':id')
  async findById(@Param('id') id: string): Promise<OrderDomain> {
    return await this.orderService.findById(id);
  }
 
  @Get(':status')
  async findByStatus(@Param('status') status: string): Promise<OrderDomain> {
    return await this.orderService.findByStatus(status);
  }
  @Get(':date')
  async findByOrderDate(@Param('date') date: string): Promise<OrderDomain> {
    return await this.orderService.findByOrderDate(date);
  }
  @Get(':date')
  async findByDeliveryDate(@Param('date') date: string): Promise<OrderDomain> {
    return await this.orderService.findByDeliveryDate(date);
  }
  @Get(':totalAmount')
  async findByTotalAmount(@Param('totalAmount') totalAmount: number): Promise<OrderDomain> {
    return await this.orderService.findByTotalAmount(totalAmount);
  }



  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() orderData: Partial<OrderDomain>
  ): Promise<OrderDomain> {
    return await this.orderService.update(id, orderData);
  }
  @Patch(':id')
  async updatePatch(
    @Param('id') id: string, 
    @Body() orderData: Partial<OrderDomain>
  ): Promise<OrderDomain> {
    return await this.orderService.updatePatch(id, orderData);
  }
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.orderService.delete(id);
  }
}