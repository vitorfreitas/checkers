import { GameRepository } from '../../../../domain/repositories/game-repository';
import { Game } from '../../../../domain/entities/game';
import { Player } from '../../../../domain/entities/player';
import { Board } from '../../../../domain/entities/board';

export class GameRepositoryMemory implements GameRepository {
  private games: Game[] = [];

  async create(player: Player): Promise<Game> {
    const game = new Game(player);
    this.games.push(game);
    return game;
  }

  async findOneByAccessToken(accessToken: string): Promise<Game | undefined> {
    return this.games.find((game) => game.accessToken === accessToken);
  }

  async reRenderGameState(game: Game): Promise<Game> {
    return game;
  }

  async createBoard(
    accessToken: string,
    player1: Player,
    player2: Player,
  ): Promise<Board> {
    return new Board(Board.createGrid(player1, player2));
  }

  async createPlayer(
    playerOrder: number,
    accessToken?: string,
  ): Promise<Player> {
    return new Player(playerOrder, playerOrder);
  }
}
