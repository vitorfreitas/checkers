import { Player } from './player';

export type Movement = {
  base: number[];
  jump: number[];
};

export class Piece {
  public row: number;
  public column: number;
  public readonly player: Player;

  constructor(row: number, column: number, player: Player) {
    this.row = row;
    this.column = column;
    this.player = player;
  }

  getPossibleMovements(): Movement[] {
    const movements = new Map()
      .set(1, [
        {
          base: [this.row + 1, this.column - 1],
          jump: [this.row + 2, this.column - 2],
        },
        {
          base: [this.row + 1, this.column + 1],
          jump: [this.row + 2, this.column + 2],
        },
      ])
      .set(2, [
        {
          base: [this.row - 1, this.column - 1],
          jump: [this.row - 2, this.column - 2],
        },
        {
          base: [this.row - 1, this.column + 1],
          jump: [this.row - 2, this.column + 2],
        },
      ]);
    return movements.get(this.player.playerOrder) || [];
  }

  setCoords(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  isKing(): boolean {
    return false;
  }
}
