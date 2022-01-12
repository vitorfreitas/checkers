import { Module } from '@nestjs/common';
import { GameService } from '../../application/use-cases/game/game.service';
import { GameRepository } from '../../domain/repositories/game-repository';
import { GameController } from '../../presentation/controllers/game.controller';
import { GameRepositoryDatabase } from '../storage/database/repositories/game-repository-database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../storage/database/models/game';
import { Board } from '../storage/database/models/board';
import { Piece } from '../storage/database/models/piece';
import { Player } from '../storage/database/models/player';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Board, Piece, Player])],
  providers: [
    GameService,
    {
      provide: GameRepository,
      useClass: GameRepositoryDatabase,
    },
  ],
  controllers: [GameController],
})
export class GameModule {}
