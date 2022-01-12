export class Player {
  public readonly id: number;
  public readonly playerOrder: number;

  constructor(id: number, playerOrder: number) {
    this.id = id;
    this.playerOrder = playerOrder;
  }

  isPlayerTurn(turn: number) {
    return turn === this.playerOrder;
  }
}
