import { Module } from '@nestjs/common';
import { GameModule } from './infrastructure/ioc/game.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './infrastructure/storage/database/models/game';
import { Board } from './infrastructure/storage/database/models/board';
import { Piece } from './infrastructure/storage/database/models/piece';
import { Player } from './infrastructure/storage/database/models/player';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [Game, Board, Piece, Player],
      synchronize: false,
      keepConnectionAlive: true,
    }),
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
