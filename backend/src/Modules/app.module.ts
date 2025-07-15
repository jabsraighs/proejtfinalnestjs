import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MigrationService } from '../config/migration.config';
import DataSource from '../config/typeorm.config';
import { mongoDataSource } from '../config/mongoOrmConfig';
import { PieceModule } from './piece.module';
import { OrderModule } from './order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...DataSource,
      name: 'default',
      autoLoadEntities: true,
    }),
    TypeOrmModule.forRoot({
      ...mongoDataSource.options,
      name: 'mongodb',
      autoLoadEntities: true,
    }),
    OrderModule,
    PieceModule,
  ],
  providers: [MigrationService],
})
export class AppModule {}
