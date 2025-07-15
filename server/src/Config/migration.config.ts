/* eslint-disable prettier/prettier */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as config from './typeorm.config';

@Injectable()
export class MigrationService implements OnModuleInit {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit() {
    console.log('MigrationService initialized');

    console.log('Loaded TypeORM config:', config);

    await this.runMigrations();
  }

  private async runMigrations() {
    try {
      console.log('Running migrations...');
      await this.dataSource.runMigrations();
      console.log('Migrations completed successfully.');
    } catch (error) {
      console.error('Error running migrations:',
        this.dataSource,
        'test',
        error,
      );
    }
  }
}