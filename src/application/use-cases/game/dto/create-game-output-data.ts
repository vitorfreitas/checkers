import { Game } from "src/infrastructure/storage/database/models/game";

export class CreateGameOutputData {
  public accessToken: string;

  constructor(game: Game) {
    this.accessToken = game.accessToken;
  }
}
