import { Piece } from './piece';

export class King extends Piece {
  getPossibleMovements() {
    const diagonalUpLeft = [this.row - 1, this.column - 1];
    const diagonalUpRight = [this.row - 1, this.column + 1];
    const diagonalDownLeft = [this.row + 1, this.column - 1];
    const diagonalDownRight = [this.row + 1, this.column + 1];

    return [
      diagonalUpLeft,
      diagonalUpRight,
      diagonalDownLeft,
      diagonalDownRight,
    ];
  }
}
