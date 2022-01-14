import { Injectable } from '@nestjs/common';
import { GameRepository } from '../../../domain/repositories/game-repository';
import { CreateGameOutputData } from './dto/create-game-output-data';
import { Game } from '../../../domain/entities/game';
import { Players } from '../../../domain/shared/constants/game';
import {
  GameNotFoundException, GameNotStartedException,
  InvalidTokenException,
  PieceNotFoundException
} from "../../../domain/exceptions";
import { GetPieceOutputData } from './dto/get-piece-output-data';

@Injectable()
export class GameService {
  constructor(private gameRepository: GameRepository) {}

  async findOneByToken(token: string): Promise<Game> {
    const game = await this.gameRepository.findOneByAccessToken(token);
    if (!game) {
      throw new GameNotFoundException();
    }
    return game;
  }

  async create(): Promise<CreateGameOutputData> {
    const player1 = await this.gameRepository.createPlayer(Players.ONE);
    const game = await this.gameRepository.create(player1);
    return new CreateGameOutputData(game);
  }

  async join(accessToken: string): Promise<number> {
    const game = await this.findOneByToken(accessToken);
    const isTokenValid = game.isTokenValid(accessToken);
    if (!isTokenValid) {
      throw new InvalidTokenException();
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
    await this.gameRepository.reRenderGameState(game);
    return this.getBoardState(params.accessToken);
  }

  async getBoardState(accessToken: string) {
    const game = await this.findOneByToken(accessToken);
    const board = game.getBoard();
    if (!board) {
      throw new GameNotStartedException();
    }
    return game.getBoard().getState();
  }

  async getPieceStatus(
    accessToken: string,
    row: number,
    column: number,
  ): Promise<GetPieceOutputData> {
    const game = await this.findOneByToken(accessToken);
    const board = game.getBoard();
    if (!board) {
      throw new GameNotStartedException();
    }
    const result = board.getPiece(row, column);
    if (!result) {
      throw new PieceNotFoundException();
    }
    const { piece, movements } = result;
    return new GetPieceOutputData(piece, movements);
  }

  async getGameStatus(accessToken: string) {
    const game = await this.findOneByToken(accessToken);
    return game.getStatus();
  }
}
