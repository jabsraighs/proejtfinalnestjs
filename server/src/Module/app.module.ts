/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import DataSource from '../Config/typeorm.config';
import { UserModule } from './user.module';
import { MessageModule } from './message.module';
import { AuthModule } from './auth.module';
import { ChatModule } from './chat.module';
import { MigrationService } from '../Config/migration.config';
@Module({
  imports: [
    ConfigModule.forRoot({
        envFilePath: '.env.local',
      isGlobal: true,
    }),
    
    TypeOrmModule.forRoot({
      ...DataSource,
      name: 'default',
      autoLoadEntities: true,
    }),
    UserModule,
    MessageModule,
    AuthModule,
    ChatModule,
  ],
  providers: [MigrationService],
})
export class AppModule {}