import { Movement, Piece } from './piece';
import { equals } from 'ramda';
import { King } from './king';
import { MAX_ROW_LENGTH, MIN_ROW_LENGTH } from '../shared/constants/board';

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

  makeKing() {
    this.piece = new King(this.row, this.column, this.piece.player);
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

  isEdgeTile() {
    return this.row === MIN_ROW_LENGTH || this.row === MAX_ROW_LENGTH;
  }

  get movements(): Movement[] {
    return this.piece?.getPossibleMovements() ?? [];
  }
}
