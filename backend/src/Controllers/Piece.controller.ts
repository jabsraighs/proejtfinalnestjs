import { Controller, Get, Post, Put, Delete, Body,Patch, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { PieceService } from '../Service/Piece.service';
import { PieceDomain } from '@domain/Entities/PieceDomain';
import { CreatePieceDto , UpdatePieceDto , DeletePieceDto } from '../Models/Dto/Piece.dto';



@Controller('piece')
export class PieceController {
  constructor(private readonly pieceService: PieceService) {}

  @Post()
  async create(@Body() pieceData: CreatePieceDto): Promise<PieceDomain> {
    try {
      if (!pieceData.name || !pieceData.type || pieceData.cost === undefined || pieceData.quantity === undefined || pieceData.alertLimit === undefined) {
        throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
      }
      const data = {
        ...pieceData,
        cost: Number(pieceData.cost),
        quantity: Number(pieceData.quantity),
        alertLimit: Number(pieceData.alertLimit)
      };
      
      return await this.pieceService.create(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create piece',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<PieceDomain> {
    const piece = await this.pieceService.findById(id);
    if (!piece) {
      throw new HttpException('Piece not found', HttpStatus.NOT_FOUND);
    }
    return piece;
  }

  @Get(':name')
  async findByName(@Param('name') name: string): Promise<PieceDomain> {
    const piece = await this.pieceService.findByName(name);
    if (!piece) {
      throw new HttpException('Piece not found', HttpStatus.NOT_FOUND);
    }
    return piece;
  }
  @Get()
  async findAllFilters(
    @Query('name') name?: string,
    @Query('type') type?: string,
    @Query('cost') cost?: number,
    @Query('quantity') quantity?: number,
    @Query('alertLimit') alertLimit?: number,

    @Query('offset') offset?: number,
    @Query('limit') limit?: number
  ): Promise<PieceDomain[]> {
    return await this.pieceService.findAllFilters({
      filters: { name, type, cost, quantity ,alertLimit },
      pagination: { offset, limit }
    });
  }

  @Get()
  async findAll(): Promise<PieceDomain[]> {
    return await this.pieceService.findAll();
  }
  @Get(':type')
  async findByType(@Param('type') type: string): Promise<PieceDomain> {
    const piece = await this.pieceService.findByType(type);
    if (!piece) {
      throw new HttpException('Piece not found', HttpStatus.NOT_FOUND);
    }
    return piece;
  }

  @Get(':quantity')
  async findByQuantity(@Param('quantity') quantity: number): Promise<PieceDomain> {
    const piece = await this.pieceService.findByQuantity(quantity);
    if (!piece) {
      throw new HttpException('Piece not found', HttpStatus.NOT_FOUND);
    }
    return piece;
  }

  @Get(':alertLimit')
  async findByAlertLimit(@Param('alertLimit') alertLimit: number): Promise<PieceDomain> {
    const piece = await this.pieceService.findByAlertLimit(alertLimit);
    if (!piece) {
      throw new HttpException('Piece not found', HttpStatus.NOT_FOUND);
    }
    return piece;
  }
  @Get(':cost')
  async findByCost(@Param('cost') cost: number): Promise<PieceDomain> {
    const piece = await this.pieceService.findByCost(cost);
    if (!piece) {
      throw new HttpException('Piece not found', HttpStatus.NOT_FOUND);
    }
    return piece;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() pieceData: Partial<PieceDomain>
  ): Promise<PieceDomain> {
    const updatedPiece = await this.pieceService.update(id, pieceData);
    if (!updatedPiece) {
      throw new HttpException('Piece not found', HttpStatus.NOT_FOUND);
    }
    return updatedPiece;
  }
  @Patch(':id')
  async updatePatch(
    @Param('id') id: string,
    @Body() pieceData: Partial<PieceDomain>
  ): Promise<PieceDomain> {
    const updatedPiece = await this.pieceService.updatePatch(id, pieceData);
    if (!updatedPiece) {
      throw new HttpException('Piece not found', HttpStatus.NOT_FOUND);
    }
    return updatedPiece;
  }
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    try {
      await this.pieceService.delete(id);
    } catch (error) {
      throw new HttpException('Failed to delete piece', HttpStatus.BAD_REQUEST);
    }
  }
}