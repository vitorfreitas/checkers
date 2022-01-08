import { Injectable } from '@nestjs/common';
import { GameRepository } from '../../../domain/repositories/game-repository';
import { Player } from '../../../domain/entities/player';
import { CreateGameOutputData } from './dto/create-game-output-data';

@Injectable()
export class GameService {
  constructor(private gameRepository: GameRepository) {}

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
    const game = this.gameRepository.findOneByAccessToken(params.accessToken);
    if (!game) {
      throw new Error('GameNotFound');
    }
    game.makePlay(params.currentPiecePosition, params.newPiecePosition);
    return this.getBoardState(params.accessToken);
  }

  getBoardState(accessToken: string) {
    const game = this.gameRepository.findOneByAccessToken(accessToken);
    if (!game) {
      throw new Error('GameNotFound');
    }
    return game.getBoard().getState();
  }
}
