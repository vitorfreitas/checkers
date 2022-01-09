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

  move(
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
    if (!oldTile.isPlayerTurn(playerTurn)) {
      throw new Error('NotPlayerTurn');
    }
    const isJump = oldTile.movements
      .filter(({ jump: [row, column] }) => this.isMovementValid(row, column))
      .find((movement) => equals(movement.jump, [newRow, newColumn]));
    if (isJump) {
      return this.makeJump(oldTile, newTile);
    }
    return this.makeMovement(oldTile, newTile);
  }

  getState() {
    return this.grid.map((rows) => {
      return rows.map((tile) => tile.getPiece()?.player.playerOrder ?? 0);
    });
  }

  isJumpAvailable(playerTurn: number, newPiecePosition: number[]) {
    return this.grid.some((row) => {
      return row.some((tile) => {
        if (!tile.isOccupied() || !tile.isPlayerTurn(playerTurn)) return;

        return tile.movements.some(({ base, jump }) => {
          const [row, column] = base;
          const [jumpRow, jumpColumn] = jump;
          const nextTile = this.grid[row][column];
          const isOpponentTile =
            nextTile?.isOccupied() && !nextTile?.isPlayerTurn(playerTurn);

          return (
            isOpponentTile &&
            this.isMovementValid(jumpRow, jumpColumn) &&
            !equals(newPiecePosition, jump)
          );
        });
      });
    });
  }

  private makeMovement(oldTile: Tile, newTile: Tile) {
    const newMovementExists = oldTile.movements
      .filter(({ base: [row, column] }) => this.isMovementValid(row, column))
      .find((movement) => newTile.equals(movement.base));
    if (!newMovementExists) {
      throw new Error('InvalidMovement');
    }
    newTile.setPiece(oldTile.getPiece());
    oldTile.empty();
  }

  private makeJump(oldTile: Tile, newTile: Tile) {
    const {
      base: [row, column],
    } = oldTile.movements.find(
      ({ jump: [row, column] }) =>
        this.isMovementValid(row, column) && newTile.equals([row, column]),
    );
    if (!row && !column) {
      throw new Error('InvalidMovement');
    }
    const removedTile = this.grid[row][column];
    newTile.setPiece(oldTile.getPiece());
    oldTile.empty();
    removedTile.empty();
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
