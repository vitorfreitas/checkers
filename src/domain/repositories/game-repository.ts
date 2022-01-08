import { Game } from '../entities/game';
import { Player } from '../entities/player';

export abstract class GameRepository {
  abstract create(player: Player): Game;
  abstract findOneById(gameId: number): Game | undefined;
  abstract findOneByAccessToken(accessToken: string): Game | undefined;
}
