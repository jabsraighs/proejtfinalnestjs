import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OrderMongo } from '../Models/Mongo/Order.mongo';
import { OrderSql } from '../Models/Sql/Order.sql';
import { OrderRepository } from '../Reporitories/OrderRepository';
import { OrderController } from '../Controllers/order.controller';
import { OrderService } from '../Service/order.service';
import { PieceModule } from './piece.module';
import { PieceRepository } from '../Reporitories/PieceRepository';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([OrderSql]),
    TypeOrmModule.forFeature([OrderMongo], 'mongodb'),
    PieceModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    PieceRepository,
    {
      provide: 'OrderRepositoryInterface',
      useClass: OrderRepository,
    },
    {
      provide: 'PieceRepositoryInterface',
      useClass: PieceRepository,
    },
  ],
  exports: [OrderService, 'OrderRepositoryInterface', TypeOrmModule],
})
export class OrderModule {}
