import { Injectable } from '@nestjs/common';
import { GameRepository } from '../../../domain/repositories/game-repository';
import { Player } from '../../../domain/entities/player';
import { CreateGameOutputData } from './dto/create-game-output-data';
import { Game } from '../../../domain/entities/game';
import { Piece } from '../../../domain/entities/piece';

@Injectable()
export class GameService {
  constructor(private gameRepository: GameRepository) {}

  findOneByToken(token: string): Game {
    const game = this.gameRepository.findOneByAccessToken(token);
    if (!game) {
      throw new Error('GameNotFound');
    }
    return game;
  }

  create(): CreateGameOutputData {
    const game = this.gameRepository.create(new Player(1));
    return new CreateGameOutputData(game);
  }

  join(gameId: number, accessToken: string): number {
    const game = this.gameRepository.findOneById(gameId);
    if (!game) {
      throw new Error('GameNotFound');
    }
    const isTokenValid = game.isTokenValid(accessToken);
    if (!isTokenValid) {
      throw new Error('InvalidToken');
    }
    const player = new Player(2);
    game.addPlayer(player);
    return player.playerOrder;
  }

  movePiece(params: {
    accessToken: string;
    currentPiecePosition: number[];
    newPiecePosition: number[];
  }) {
    const game = this.findOneByToken(params.accessToken);
    game.makePlay(params.currentPiecePosition, params.newPiecePosition);
    return this.getBoardState(params.accessToken);
  }

  getBoardState(accessToken: string) {
    const game = this.findOneByToken(accessToken);
    return game.getBoard().getState();
  }

  getPieceStatus(accessToken: string, row: number, column: number): Piece {
    const game = this.findOneByToken(accessToken);
    const piece = game.getBoard().getPiece(row, column);
    if (!piece) {
      throw new Error('Piece not found');
    }
    return piece;
  }
}
