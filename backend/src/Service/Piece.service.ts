import { Injectable, Inject } from '@nestjs/common';
import { PieceDomain } from '@domain/Entities/PieceDomain';
import { PieceRepositoryInterface } from '@application/RepositoryInterfaces/PieceRepositoryInterface';

@Injectable()
export class PieceService {
  constructor(
    @Inject('PieceRepositoryInterface')
    private readonly pieceRepository: PieceRepositoryInterface
  ) {}

  async create(pieceData: {
    name: string;
    type: string;
    cost: number;
    quantity: number;
    alertLimit: number;
  }): Promise<PieceDomain> {
    const piece = new PieceDomain(
      null,
      pieceData.name,
      pieceData.type,
      pieceData.cost,
      pieceData.quantity,
      pieceData.alertLimit
    );
    return await this.pieceRepository.create(piece);
  }
  async findAllFilters(criteria: {
    filters?: { name?: string; type?: string; cost?: number; quantity?: number,alertLimit?:number },
    pagination?: { offset?: number; limit?: number }
  }): Promise<PieceDomain[]> {
    return await this.pieceRepository.findAllFilters(criteria);
  }
  async findById(id: string): Promise<PieceDomain> {
    return await this.pieceRepository.findById(id);
  }

  async findByName(name: string): Promise<PieceDomain> {
    return await this.pieceRepository.findByName(name);
  }

  async findByType(type: string): Promise<PieceDomain> {
    return await this.pieceRepository.findByType(type);
  }

  async findByQuantity(quantity: number): Promise<PieceDomain> {
    return await this.pieceRepository.findByQuantity(quantity);
  }
  async findByCost(cost: number): Promise<PieceDomain> {
    return await this.pieceRepository.findByCost(cost);
  }

  async findByAlertLimit(alertLimit: number): Promise<PieceDomain> {
    return await this.pieceRepository.findByAlertLimit(alertLimit);
  }

  async findAll(): Promise<PieceDomain[]> {
    return await this.pieceRepository.findAll();
  }

  async updatePatch(id: string, pieceData: Partial<PieceDomain>): Promise<PieceDomain> {
    return await this.pieceRepository.updatePatch(id, pieceData);
  }
  async update(id: string, pieceData: Partial<PieceDomain>): Promise<PieceDomain> {
    return await this.pieceRepository.update(id, pieceData);
  }

  async delete(id: string): Promise<void> {
    await this.pieceRepository.delete(id);
  }
}
