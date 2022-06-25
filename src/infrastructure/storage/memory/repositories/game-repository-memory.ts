import * as randomString from 'randomstring';
import { GameRepository } from '../../../../domain/repositories/game-repository';
import { Board } from '../../database/models/board';
import { Game } from '../../database/models/game';
import { Player } from '../../database/models/player';

export class GameRepositoryMemory implements GameRepository {
  private games: Game[] = [];

  async create(player: Player): Promise<Game> {
    const game = new Game();
    const code = randomString.generate(4);
    const accessToken = `${new Date().getFullYear()}${code}`;
    game.players = [player]
    game.accessToken = accessToken
    game.playerTurn = player.playerOrder
    this.games.push(game);

    return game;
  }

  async findOneByAccessToken(accessToken: string): Promise<Game | undefined> {
    return this.games.find((game) => game.accessToken === accessToken);
  }

  async update(game: Game): Promise<Game> {
    return game;
  }

  async createBoard(
    accessToken: string,
    player1: Player,
    player2: Player,
  ): Promise<Board> {
    const pieces = Board.createGrid(player1, player2)
    const board = new Board();
    board.pieces = pieces.flat().filter(Boolean).flat()

    return board
  }

  async createPlayer(
    playerOrder: number,
    accessToken?: string,
  ): Promise<Player> {
    const player = new Player();
    player.playerOrder = playerOrder
    
    return player
  }
}
