import { ChildEntity } from 'typeorm';
import { BasePiece } from './base-piece';

export type Movement = {
  base: number[];
  jump: number[];
};

@ChildEntity()
export class Piece extends BasePiece {
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
}
