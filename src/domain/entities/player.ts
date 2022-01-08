import * as uuid from 'uuid';

export class Player {
  public readonly uuid: string;
  public readonly playerOrder: number;

  constructor(playerOrder: number) {
    this.uuid = uuid.v4();
    this.playerOrder = playerOrder;
  }

  isPlayerTurn(turn: number) {
    return turn === this.playerOrder;
  }
}
