import { Game } from '../../../../domain/entities/game';

export class CreateGameOutputData {
  public gameId: number;
  public accessToken: string;

  constructor(game: Game) {
    this.gameId = game.id;
    this.accessToken = game.accessToken;
  }
}
