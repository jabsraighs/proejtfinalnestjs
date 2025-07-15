import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PieceMongo } from '../Models/Mongo/Piece.mongo';
import { PieceSql } from '../Models/Sql/Piece.sql';
import { PieceRepository } from '../Reporitories/PieceRepository';
import { PieceController } from '../Controllers/Piece.controller';
import { PieceService } from '../Service/Piece.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PieceSql]),
    TypeOrmModule.forFeature([PieceMongo], 'mongodb'),
  ],
  controllers: [PieceController],
  providers: [
    PieceService,
    PieceRepository,
    {
      provide: 'PieceRepositoryInterface',
      useClass: PieceRepository,
    },
  ],
  exports: [PieceService, 'PieceRepositoryInterface', TypeOrmModule],
})
export class PieceModule {}
