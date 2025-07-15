import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderMongo } from '../Models/Mongo/Order.mongo';
import { OrderSql } from '../Models/Sql/Order.sql';
import { OrderRepositoryInterface } from '@application/RepositoryInterfaces/OrderRepositoryInterface';
import { OrderDomain } from '@domain/Entities/OrderDomain';
import { PieceMongo} from '../Models/Mongo/Piece.mongo';
import { PieceSql } from '../Models/Sql/Piece.sql';
import { PieceRepository } from './PieceRepository';

@Injectable()
export class OrderRepository implements OrderRepositoryInterface {
  constructor(
    @InjectRepository(OrderMongo, 'mongodb')
    private readonly orderMongoRepository: Repository<OrderMongo>,
    @InjectRepository(OrderSql)
    private readonly orderSqlRepository: Repository<OrderSql>,
    @InjectRepository(PieceSql)
    private readonly pieceSqlRepository: Repository<PieceSql>,
    @InjectRepository(PieceMongo, 'mongodb')
    private readonly pieceMongoRepository: Repository<PieceMongo>,
    private readonly pieceRepository: PieceRepository  
  ) {}
  
  private mapMongoToDomain(mongo: OrderMongo): OrderDomain {
    return new OrderDomain(
      mongo.id,
      mongo.pieces,
      mongo.status,
      mongo.orderDate,
      mongo.deliveryDate,
      parseInt(mongo.totalAmount)
    );
  }

  private mapSqlToDomain(sql: OrderSql): OrderDomain {
    return new OrderDomain(
      sql.id,
      sql.pieces,
      sql.status,
      sql.orderDate,
      sql.deliveryDate,
      parseInt(sql.totalAmount)
    );
  }

  async findAllFilters(criteria: any): Promise<OrderDomain[]> {
    const { filters = {}, pagination = {} } = criteria;
    const { orderDate, deliveryDate, quantity, totalAmount, status } = filters;
    const { offset = 0, limit = 10 } = pagination;

    try {
      const mongoQuery: Record<string, any> = {};
      if (orderDate) mongoQuery.orderDate = orderDate;
      if (status) mongoQuery.status = status;
      if (deliveryDate) mongoQuery.deliveryDate = deliveryDate;
      if (quantity !== undefined) mongoQuery.quantity = quantity;
      if (totalAmount !== undefined) mongoQuery.totalAmount = totalAmount;

      const [mongoOrders, sqlOrders] = await Promise.all([
        this.orderMongoRepository.find({
          where: mongoQuery,
          skip: offset,
          take: limit
        }),
        this.orderSqlRepository.find({
          where: mongoQuery,
          skip: offset,
          take: limit
        })
      ]);
      
      return mongoOrders.map(order => this.mapMongoToDomain(order));
    } catch (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }
  }

  async create(order: OrderDomain): Promise<OrderDomain> {
    try {
      const processedPieces = await this.processPiecesAndUpdateStock(order.pieces as Array<{ id: string; quantity: number }>);
      const totalAmount = this.calculateTotalAmount(processedPieces);
      
      const sqlOrder = await this.createAndSaveSqlOrder(order, totalAmount);
      const mongoOrder = await this.createAndSaveMongoOrder(order, sqlOrder.id, totalAmount);
      
      return this.mapMongoToDomain(mongoOrder);
    } catch (error) {
      await this.handleErrorAndRollback(order.pieces as Array<{ id: string; quantity: number }>);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  private async processPiecesAndUpdateStock(
    pieces: Array<{ id: string; quantity: number }>
  ): Promise<Array<PieceSql & { orderedQuantity: number }>> {
    return Promise.all(
      pieces.map(async (piece) => {
        const pieceEntity = await this.findAndValidatePiece(piece.id);
        await this.validateAndUpdateStock(pieceEntity, piece.quantity);
        return { 
          ...pieceEntity, 
          orderedQuantity: piece.quantity 
        };
      })
    );
  }

  private async findAndValidatePiece(pieceId: string): Promise<PieceSql> {
    const pieceEntitySql = await this.pieceSqlRepository.findOne({
      where: { id: pieceId }
    });
    
    const pieceEntityMongo = await this.pieceMongoRepository.findOne({
      where: { id: pieceId }
    });

    if (!pieceEntitySql || !pieceEntityMongo) {
      throw new Error(`Piece with ID ${pieceId} not found`);
    }

   
    if (pieceEntitySql.quantity !== pieceEntityMongo.quantity) {
      throw new Error(`Quantity mismatch for piece ${pieceId} between SQL and MongoDB`);
    }
    
    return pieceEntitySql;
  }

  private async validateAndUpdateStock(
    pieceEntity: PieceSql,
    requestedQuantity: number
  ): Promise<void> {
    const currentStock = parseInt(pieceEntity.quantity);
  
    if (currentStock < requestedQuantity) {
      throw new Error(
        `Not enough stock for piece ${pieceEntity.id}. Available: ${currentStock}, Requested: ${requestedQuantity}`
      );
    }
  
    const newQuantity = currentStock - requestedQuantity;
  
   
    await this.pieceRepository.updatePatch(pieceEntity.id, {
      quantity: newQuantity
    });
  }

  private calculateTotalAmount(
    processedPieces: Array<PieceSql & { orderedQuantity: number }>
  ): number {
    return processedPieces.reduce(
      (total, piece) => total + parseFloat(piece.cost) * piece.orderedQuantity,
      0
    );
  }

  private async createAndSaveSqlOrder(
    order: OrderDomain,
    totalAmount: number
  ): Promise<OrderSql> {
    const sqlOrder = new OrderSql();
    sqlOrder.pieces = order.pieces;
    sqlOrder.status = order.status;
    sqlOrder.orderDate = order.orderDate;
    sqlOrder.deliveryDate = order.deliveryDate;
    sqlOrder.totalAmount = totalAmount.toString();

    return this.orderSqlRepository.save(sqlOrder);
  }

  private async createAndSaveMongoOrder(
    order: OrderDomain,
    sqlOrderId: string,
    totalAmount: number
  ): Promise<OrderMongo> {
    const mongoOrder = new OrderMongo();
    mongoOrder.id = sqlOrderId;
    mongoOrder.pieces = order.pieces;
    mongoOrder.status = order.status;
    mongoOrder.orderDate = order.orderDate;
    mongoOrder.deliveryDate = order.deliveryDate;
    mongoOrder.totalAmount = totalAmount.toString();

    return this.orderMongoRepository.save(mongoOrder);
  }

  private async handleErrorAndRollback(
    pieces: Array<{ id: string; quantity: number }>
  ): Promise<void> {
    try {
      await Promise.all(
        pieces.map(async (piece) => {
          const pieceEntity = await this.pieceSqlRepository.findOne({
            where: { id: piece.id }
          });
  
          if (pieceEntity) {
            const currentStock = parseInt(pieceEntity.quantity);
            const newQuantity = currentStock + piece.quantity;
  
         
            await this.pieceRepository.updatePatch(piece.id, {
              quantity: newQuantity
            });
          }
        })
      );
    } catch (rollbackError) {
     
      throw new Error(`Rollback failed: ${rollbackError.message}`);
    }
  }

  async findById(id: string): Promise<OrderDomain | null> {
    try {
      const sqlOrder = await this.orderSqlRepository.findOneBy({ id });
      if (sqlOrder) {
        const mongoOrder = await this.orderMongoRepository.findOneBy({ id });
        return this.mapMongoToDomain(mongoOrder);
      }
    } catch (error) {
      return error;
    }
  }

  async findByStatus(status: string): Promise<OrderDomain | null> {
    try {
      const sqlOrder = await this.orderSqlRepository.findOneBy({ status });
      if (sqlOrder) {
        const mongoOrder = await this.orderMongoRepository.findOneBy({ status });
        return this.mapMongoToDomain(mongoOrder);
      }
    } catch (error) {
      return error;
    }
  }

  async findByOrderDate(orderDate: string): Promise<OrderDomain | null> {
    try {
      const sqlOrder = await this.orderSqlRepository.findOneBy({ orderDate });
      if (sqlOrder) {
        const mongoOrder = await this.orderMongoRepository.findOneBy({ orderDate });
        return this.mapMongoToDomain(mongoOrder);
      }
    } catch (error) {
      return error;
    }
  }

  async findByDeliveryDate(deliveryDate: string): Promise<OrderDomain | null> {
    try {
      const sqlOrder = await this.orderSqlRepository.findOneBy({ deliveryDate });
      if (sqlOrder) {
        const mongoOrder = await this.orderMongoRepository.findOneBy({ deliveryDate });
        return this.mapMongoToDomain(mongoOrder);
      }
    } catch (error) {
      return error;
    }
  }

  async findByTotalAmount(totalAmount: number): Promise<OrderDomain | null> {
    const totalAmountString = totalAmount.toString();
    try {
      const sqlOrder = await this.orderSqlRepository.findOneBy({ totalAmount: totalAmountString });
      if (sqlOrder) {
        const mongoOrder = await this.orderMongoRepository.findOneBy({ totalAmount: totalAmountString });
        return this.mapMongoToDomain(mongoOrder);
      }
    } catch (error) {
      return error;
    }
  }

  async findAll(): Promise<OrderDomain[]> {
    const [mongoOrders, sqlOrders] = await Promise.all([
      this.orderMongoRepository.find(),
      this.orderSqlRepository.find()
    ]);

    return mongoOrders.map(order => this.mapMongoToDomain(order));
  }

  async update(id: string, orderData: Partial<OrderDomain>): Promise<OrderDomain | null> {
    const updateData = {
      ...orderData,
      pieces: orderData.pieces,
      status: orderData.status,
      orderDate: orderData.orderDate,
      deliveryDate: orderData.deliveryDate,
      totalAmount: orderData.totalAmount?.toString()
    };
  
    try {
      await this.orderSqlRepository.update(id, updateData);
      const sqlOrder = await this.orderSqlRepository.findOneBy({ id });
  
      await this.orderMongoRepository.update(
        { id },
        updateData
      );
  
      if (sqlOrder) {
        return this.mapSqlToDomain(sqlOrder);
      }
  
      const mongoOrder = await this.orderMongoRepository.findOneBy({ id });
      if (mongoOrder) {
        return this.mapMongoToDomain(mongoOrder);
      }
  
      return null;
    } catch (error) {
      throw error;
    }
  }

  async updatePatch(id: string, orderData: Partial<OrderDomain>): Promise<OrderDomain> {
    try {
      const existingSqlOrder = await this.orderSqlRepository.findOneBy({ id });
      if (!existingSqlOrder) {
        throw new Error(`Order with ID ${id} not found`);
      }
  
      const updatedData = {
        ...existingSqlOrder,
        ...orderData,
        totalAmount: orderData.totalAmount?.toString() || existingSqlOrder.totalAmount
      };
  
      await this.orderSqlRepository.update(id, updatedData);
      await this.orderMongoRepository.update({ id }, updatedData);
  
      const sqlOrder = await this.orderSqlRepository.findOneBy({ id });
      if (sqlOrder) {
        return this.mapSqlToDomain(sqlOrder);
      }
  
      const mongoOrder = await this.orderMongoRepository.findOneBy({ id });
      if (mongoOrder) {
        return this.mapMongoToDomain(mongoOrder);
      }
  
      return null;
    } catch (error) {
      throw new Error(`Failed to patch order`);
    }
  }
  
  async delete(id: string): Promise<void> {
    try {
      await Promise.all([
        this.orderMongoRepository.delete({ id }),
        this.orderSqlRepository.delete(id)
      ]);
    } catch (error) {
      throw error('Error deleting order');
    }
  }
}