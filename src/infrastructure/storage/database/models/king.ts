import { ChildEntity } from 'typeorm';
import { BasePiece } from './base-piece';

@ChildEntity()
export class King extends BasePiece {
  getPossibleMovements() {
    return [
      {
        base: [this.row + 1, this.column - 1],
        jump: [this.row + 2, this.column - 2],
      },
      {
        base: [this.row + 1, this.column + 1],
        jump: [this.row + 2, this.column + 2],
      },
      {
        base: [this.row - 1, this.column - 1],
        jump: [this.row - 2, this.column - 2],
      },
      {
        base: [this.row - 1, this.column + 1],
        jump: [this.row - 2, this.column + 2],
      },
    ];
  }
}

