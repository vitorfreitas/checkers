import { Module } from '@nestjs/common';
import { GameModule } from './infrastructure/ioc/game.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './infrastructure/storage/database/models/game';
import { Board } from './infrastructure/storage/database/models/board';
import { Piece } from './infrastructure/storage/database/models/piece';
import { Player } from './infrastructure/storage/database/models/player';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [Game, Board, Piece, Player],
      synchronize: false,
    }),
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
