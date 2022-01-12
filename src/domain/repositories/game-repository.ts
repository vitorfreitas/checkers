import { Game } from '../entities/game';
import { Player } from '../entities/player';
import { Board } from '../entities/board';

export abstract class GameRepository {
  abstract create(player: Player): Promise<Game>;
  abstract findOneByAccessToken(accessToken: string): Promise<Game | undefined>;
  abstract update(game: Game): Promise<Game>;
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
