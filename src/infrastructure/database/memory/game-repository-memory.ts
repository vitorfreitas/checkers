import { GameRepository } from '../../../domain/repositories/game-repository';
import { Game } from '../../../domain/entities/game';
import { Player } from '../../../domain/entities/player';
import { Board } from '../../../domain/entities/board';

export class GameRepositoryMemory implements GameRepository {
  private games: Game[] = [];

  create(player: Player): Game {
    const game = new Game(this.generateId(), new Board(), player);
    this.games.push(game);
    return game;
  }

  findOneById(gameId: number): Game | undefined {
    return this.games.find((game) => game.id === gameId);
  }

  findOneByAccessToken(accessToken: string): Game | undefined {
    return this.games.find((game) => game.accessToken === accessToken);
  }

  private generateId() {
    if (this.games.length === 0) return 1;
    return this.games[this.games.length - 1].id + 1;
  }
}
