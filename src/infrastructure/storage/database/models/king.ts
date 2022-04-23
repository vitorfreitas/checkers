import { Entity } from 'typeorm';
import { Piece } from './piece';

@Entity()
export class King extends Piece {
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

  setCoords(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  // isKing(): boolean {
  //   return false;
  // }
}

