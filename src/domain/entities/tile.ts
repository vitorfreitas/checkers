import { Piece } from './piece';

export class Tile {
  public readonly row: number;
  public readonly column: number;
  private piece: Piece | null;

  constructor(row: number, column: number, piece: Piece | null) {
    this.row = row;
    this.column = column;
    this.piece = piece;
  }

  isOccupied(): boolean {
    return Boolean(this.piece);
  }

  setPiece(piece: Piece) {
    this.piece = piece;
    this.piece.setCoords(this.row, this.column);
  }

  getPiece() {
    return this.piece;
  }

  empty() {
    this.piece = null;
  }
}
