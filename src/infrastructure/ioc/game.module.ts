import { Module } from '@nestjs/common';
import { GameService } from '../../application/use-cases/game/game.service';
import { GameRepository } from '../../domain/repositories/game-repository';
import { GameRepositoryMemory } from '../database/memory/game-repository-memory';

@Module({
  providers: [
    GameService,
    {
      provide: GameRepository,
      useClass: GameRepositoryMemory,
    },
  ],
})
export class GameModule {}
