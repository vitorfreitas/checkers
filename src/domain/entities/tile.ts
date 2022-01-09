import { Movement, Piece } from './piece';
import { equals } from "ramda";

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

  isPlayerTurn(playerTurn: number) {
    return this.piece.player.isPlayerTurn(playerTurn);
  }

  equals(position: number[]) {
    return equals(position, [this.row, this.column]);
  }

  get movements(): Movement[] {
    return this.piece.getPossibleMovements();
  }
}
