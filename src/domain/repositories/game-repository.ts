import { Board } from "src/infrastructure/storage/database/models/board";
import { Game } from "src/infrastructure/storage/database/models/game";
import { Player } from "src/infrastructure/storage/database/models/player";

export abstract class GameRepository {
  abstract create(player: Player): Promise<Game>;
  abstract findOneByAccessToken(accessToken: string): Promise<Game | undefined>;
  abstract reRenderGameState(game: Game): Promise<Game>;
  abstract createPlayer(
    playerOrder: number,
    accessToken?: string,
  ): Promise<Player>;
  abstract createBoard(
    accessToken: string,
    player1: Player,
    player2: Player,
  ): Promise<Board>;
}
