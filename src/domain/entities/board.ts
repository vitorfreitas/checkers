import { equals } from 'ramda';
import { Piece } from './piece';
import { Tile } from './tile';
import { Player } from './player';
import { INITIAL_BOARD } from '../shared/constants/board';

const MAX_ROW_LENGTH = 7;
const MIN_ROW_LENGTH = 0;
const MAX_COLUMN_LENGTH = 7;
const MIN_COLUMN_LENGTH = 0;
const xAxisLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export class Board {
  grid: Tile[][];

  initialize(player1: Player, player2: Player) {
    const players = new Map().set(1, player1).set(2, player2);
    this.grid = INITIAL_BOARD.map((row, rowIndex) => {
      return row.map((playerId, columnIndex) => {
        const player = players.get(playerId);
        const piece =
          playerId > 0 ? new Piece(rowIndex, columnIndex, player) : null;
        return new Tile(rowIndex, columnIndex, piece);
      });
    });
  }

  makeMovement(
    playerTurn: number,
    [oldRow, oldColumn]: number[],
    [newRow, newColumn]: number[],
  ) {
    const oldTile = this.grid[oldRow][oldColumn];
    const newTile = this.grid[newRow][newColumn];
    if (!oldTile.isOccupied()) {
      throw new Error('EmptyTile');
    }
    if (newTile.isOccupied()) {
      throw new Error('OccupiedTile');
    }
    const newMovementExists = oldTile
      .getPiece()
      .getPossibleMovements()
      .filter(([row, column]) => this.isMovementValid(row, column))
      .find((movement) => equals(movement, [newRow, newColumn]));
    if (!newMovementExists) {
      throw new Error('InvalidMovement');
    }
    if (!oldTile.getPiece().player.isPlayerTurn(playerTurn)) {
      throw new Error('NotPlayerTurn');
    }
    newTile.setPiece(oldTile.getPiece());
    oldTile.empty();
  }

  getState() {
    return this.grid.map((rows) => {
      return rows.map((tile) => tile.getPiece()?.player.playerOrder ?? 0);
    });
  }

  private isMovementValid(row: number, column: number): boolean {
    if (
      row < MIN_ROW_LENGTH ||
      row > MAX_ROW_LENGTH ||
      column < MIN_COLUMN_LENGTH ||
      column > MAX_COLUMN_LENGTH
    ) {
      return false;
    }
    const tile = this.grid[row][column];
    return !tile.isOccupied();
  }
}
