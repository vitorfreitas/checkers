import { Game } from '../../../../domain/entities/game';

export class CreateGameOutputData {
  public accessToken: string;

  constructor(game: Game) {
    this.accessToken = game.accessToken;
  }
}
