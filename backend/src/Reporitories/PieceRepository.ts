import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PieceMongo } from '../Models/Mongo/Piece.mongo';
import { PieceSql } from '../Models/Sql/Piece.sql';
import { PieceRepositoryInterface } from '@application/RepositoryInterfaces/PieceRepositoryInterface';
import { PieceDomain } from '@domain/Entities/PieceDomain';
import { OrderDomain } from '@domain/Entities/OrderDomain';

@Injectable()
export class PieceRepository implements PieceRepositoryInterface {
  constructor(
    @InjectRepository(PieceMongo, 'mongodb')
    private readonly pieceMongoRepository: Repository<PieceMongo>,
    @InjectRepository(PieceSql)
    private readonly pieceSqlRepository: Repository<PieceSql>
  ) {}
  
  private mapMongoToDomain(mongo: PieceMongo): PieceDomain {
    return new PieceDomain(
      mongo.id,
      mongo.name,
      mongo.type,
      parseInt(mongo.cost),
      parseInt(mongo.quantity),
      parseInt(mongo.alertLimit)
    );
  }
  private mapSqlToDomain(sql: PieceSql): PieceDomain {
    return new PieceDomain(
      sql.id,
      sql.name,
      sql.type,
      parseInt(sql.cost),
      parseInt(sql.quantity),
      parseInt(sql.alertLimit)
    );
  }
  async findAllFilters(criteria: any): Promise<PieceDomain[]> {
    const { filters = {}, pagination = {} } = criteria;
    const { name, quantity, cost,type , alertLimit } = filters;
    const { offset = 0, limit = 10 } = pagination;

    try {
      const mongoQuery: Record<string, any> = {};
      if (name) mongoQuery.name = name;
      if (type) mongoQuery.type= type;
      if (quantity !== undefined) mongoQuery.quantity = quantity;
      if (cost !== undefined) mongoQuery.cost = cost;
      if (alertLimit !== undefined) mongoQuery.alertLimit = alertLimit;

      const sqlQuery: Record<string, any> = { ...mongoQuery };

      const [mongoPieces, sqlPieces] = await Promise.all([
        this.pieceMongoRepository.find({
          where: mongoQuery,
          skip: offset,
          take: limit
        }),
        this.pieceSqlRepository.find({
          where: sqlQuery,
          skip: offset,
          take: limit
        })
      ]);
      return [
        ...mongoPieces.map(piece => this.mapMongoToDomain(piece)),
      ];
    } catch (error) {
      console.error('Error fetching filtered pieces:', error);
      throw new Error(`Failed to fetch pieces: ${error.message}`);
    }
  }
 

  async create(piece: PieceDomain): Promise<PieceDomain> {
    try {
  
      const sqlPiece = this.pieceSqlRepository.create({
        name: piece.name,
        type: piece.type,
        cost: piece.cost.toString(),
        quantity: piece.quantity.toString(),
        alertLimit: piece.alertLimit.toString(),
      });


      const savedSqlPiece = await this.pieceSqlRepository.save(sqlPiece);


      const mongoPiece = new PieceMongo();
      mongoPiece.id = savedSqlPiece.id;
      mongoPiece.name = piece.name;
      mongoPiece.type = piece.type;
      mongoPiece.cost = piece.cost.toString();
      mongoPiece.quantity = piece.quantity.toString();
      mongoPiece.alertLimit = piece.alertLimit.toString();


      const savedMongoPiece = await this.pieceMongoRepository.save(mongoPiece);

      return this.mapMongoToDomain(savedMongoPiece);
    } catch (error) {
      console.error('Error creating piece:', error);
      throw new Error(`Failed to create piece: ${error.message}`);
    }
  }

  async findById(id: string): Promise<PieceDomain> {
    try {
      const sqlPiece = await this.pieceSqlRepository.findOneBy({ id });
      if (sqlPiece) {
        const mongoPiece = await this.pieceMongoRepository.findOneBy({
          id: id
        });
          return this.mapMongoToDomain(mongoPiece);
      }

    } catch (error) {
      return error;
    }
  }


  async findByName(name: string): Promise<PieceDomain> {
    try {
          const sqlPiece = await this.pieceSqlRepository.findOneBy({ name });
          if (sqlPiece) {
            const mongoPiece = await this.pieceMongoRepository.findOneBy({name: name});
            return this.mapMongoToDomain(mongoPiece);
          }
    } catch (error) {
        return error;
    }
  }
  async findByType(type: string): Promise<PieceDomain | null> {
    try {
      const sqlPiece = await this.pieceSqlRepository.findOneBy({ type });
      if (sqlPiece) {
        const mongoPiece = await this.pieceMongoRepository.findOneBy({ type: type });
          return this.mapMongoToDomain(mongoPiece);
        }
      }
    catch (error) {
      return error;
    }
  }


  async findByQuantity(quantity: number): Promise<PieceDomain | null> {
    const quantityString = quantity.toString();
    try {
      const sqlPiece = await this.pieceSqlRepository.findOneBy({quantity: quantityString});
      if (sqlPiece) {
        const mongoPiece = await this.pieceMongoRepository.findOneBy({ quantity: quantityString });
        return this.mapMongoToDomain(mongoPiece);
      }
    } catch (error) {
      return error;
    }
  }
  async findByCost(cost: number): Promise<PieceDomain | null> {
    const costString = cost.toString();
    try {
      const sqlPiece = await this.pieceSqlRepository.findOneBy({cost: costString});
      if (sqlPiece) {
        const mongoPiece = await this.pieceMongoRepository.findOneBy({cost: costString });
          return this.mapMongoToDomain(mongoPiece);
      }
    }
    catch (error) {
      return error;
    }
  }
  async findByAlertLimit(alertLimit: number): Promise<PieceDomain | null> {
    const alertLimitString = alertLimit.toString();
    try {
      const sqlPiece = await this.pieceSqlRepository.findOneBy({alertLimit: alertLimitString});
      if (sqlPiece) {
        const mongoPiece = await this.pieceMongoRepository.findOneBy({cost: alertLimitString });
          return this.mapMongoToDomain(mongoPiece);
      }
    }
    catch (error) {
      return error;
    }
  }

  async findAll(): Promise<PieceDomain[]> {
    const [mongoPieces, sqlPieces] = await Promise.all([
      this.pieceMongoRepository.find(),
      this.pieceSqlRepository.find()
    ]);

    return [
      ...mongoPieces.map(piece => this.mapMongoToDomain(piece)),
    ];
  }

  async update(id: string, pieceData: Partial<PieceDomain>): Promise<PieceDomain> {
    const updateData = {
      ...pieceData,
      name: pieceData.name,
      type: pieceData.type,
      cost: pieceData.cost?.toString(),
      alertLimit: pieceData.alertLimit?.toString(),
      quantity: pieceData.quantity?.toString(),
    };
  
    try {

      await this.pieceSqlRepository.update(id, updateData);

      const sqlPiece = await this.pieceSqlRepository.findOneBy({ id });

      await this.pieceMongoRepository.update(
        { id: id },
        updateData
      );
  

      if (sqlPiece) {
        return this.mapSqlToDomain(sqlPiece);
      }

      const mongoPiece = await this.pieceMongoRepository.findOneBy({ id });
      if (mongoPiece) {
        return this.mapMongoToDomain(mongoPiece);
      }
  
      return null;
    } catch (error) {
      console.error('Error updating piece:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await Promise.all([
        this.pieceMongoRepository.delete({ id: id }),
        this.pieceSqlRepository.delete(id)
      ]);
    } catch (error) {
      console.error('Error deleting piece:', error);
      throw error;
    }
  }
  async updatePatch(id: string, pieceData: Partial<PieceDomain>): Promise<PieceDomain> {
    try {
      const existingSqlPiece = await this.pieceSqlRepository.findOneBy({ id });
      if (!existingSqlPiece) {
        throw new Error(`Piece with ID ${id} not found`);
      }
  

      const updatedData = {
        ...existingSqlPiece, 
        ...pieceData, 
        cost: pieceData.cost?.toString() || existingSqlPiece.cost,
        alertLimit: pieceData.alertLimit?.toString() || existingSqlPiece.alertLimit,
        quantity: pieceData.quantity?.toString() || existingSqlPiece.quantity,
      };
  

      await this.pieceSqlRepository.update(id, updatedData);
  

      await this.pieceMongoRepository.update({ id }, updatedData);
  
     
      const sqlPiece = await this.pieceSqlRepository.findOneBy({ id });
      if (sqlPiece) {
        return this.mapSqlToDomain(sqlPiece);
      }
  
      const mongoPiece = await this.pieceMongoRepository.findOneBy({ id });
      if (mongoPiece) {
        return this.mapMongoToDomain(mongoPiece);
      }
  
      return null;
    } catch (error) {
      console.error('Error patching piece:', error);
      throw new Error(`Failed to patch piece with ID ${id}: ${error.message}`);
    }
  }
  
}