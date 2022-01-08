import { Player } from './player';

export class Piece {
  protected row: number;
  protected column: number;
  public readonly player: Player;

  constructor(row: number, column: number, player: Player) {
    this.row = row;
    this.column = column;
    this.player = player;
  }

  getPossibleMovements() {
    const movements = new Map()
      .set(1, [
        [this.row + 1, this.column - 1],
        [this.row + 1, this.column + 1],
      ])
      .set(2, [
        [this.row - 1, this.column - 1],
        [this.row - 1, this.column + 1],
      ]);
    return movements.get(this.player.playerOrder) || [];
  }

  setCoords(row: number, column: number) {
    this.row = row;
    this.column = column;
  }
}
