import { Injectable } from '@nestjs/common';
import { GameRepository } from '../../../domain/repositories/game-repository';
import { CreateGameOutputData } from './dto/create-game-output-data';
import { Game } from '../../../domain/entities/game';
import { Piece } from '../../../domain/entities/piece';
import { Players } from '../../../domain/shared/constants/game';

@Injectable()
export class GameService {
  constructor(private gameRepository: GameRepository) {}

  async findOneByToken(token: string): Promise<Game> {
    const game = await this.gameRepository.findOneByAccessToken(token);
    if (!game) {
      throw new Error('GameNotFound');
    }
    return game;
  }

  async create(): Promise<CreateGameOutputData> {
    const player1 = await this.gameRepository.createPlayer(Players.ONE);
    const game = await this.gameRepository.create(player1);
    return new CreateGameOutputData(game);
  }

  async join(accessToken: string): Promise<number> {
    const game = await this.gameRepository.findOneByAccessToken(accessToken);
    if (!game) {
      throw new Error('GameNotFound');
    }
    const isTokenValid = game.isTokenValid(accessToken);
    if (!isTokenValid) {
      throw new Error('InvalidToken');
    }
    const player2 = await this.gameRepository.createPlayer(
      Players.TWO,
      accessToken,
    );
    const [player1] = game.players;
    const board = await this.gameRepository.createBoard(
      accessToken,
      player1,
      player2,
    );
    game.addPlayer(player2, board);
    return player2.playerOrder;
  }

  async movePiece(params: {
    accessToken: string;
    currentPiecePosition: number[];
    newPiecePosition: number[];
  }) {
    const game = await this.findOneByToken(params.accessToken);
    game.makePlay(params.currentPiecePosition, params.newPiecePosition);
    await this.gameRepository.update(game);
    return this.getBoardState(params.accessToken);
  }

  async getBoardState(accessToken: string) {
    const game = await this.findOneByToken(accessToken);
    return game.getBoard().getState();
  }

  async getPieceStatus(
    accessToken: string,
    row: number,
    column: number,
  ): Promise<Piece> {
    const game = await this.findOneByToken(accessToken);
    const piece = game.getBoard().getPiece(row, column);
    if (!piece) {
      throw new Error('PieceNotFound');
    }
    return piece;
  }

  async getGameStatus(accessToken: string) {
    const game = await this.findOneByToken(accessToken);
    return game.getStatus();
  }
}
