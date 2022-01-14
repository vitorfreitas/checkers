import { equals, head, isEmpty } from 'ramda';
import { Piece } from './piece';
import { Tile } from './tile';
import { Player } from './player';
import {
  INITIAL_BOARD,
  MAX_COLUMN_LENGTH,
  MAX_ROW_LENGTH,
  MIN_COLUMN_LENGTH,
  MIN_ROW_LENGTH,
} from '../shared/constants/board';
import { Players } from '../shared/constants/game';
import {
  EmptyTileException,
  InvalidMovementException,
  NotPlayerTurnException,
  OccupiedTileException,
} from '../exceptions';

export class Board {
  grid: Tile[][];

  constructor(grid: Tile[][]) {
    this.grid = grid;
  }

  move(
    playerTurn: number,
    [oldRow, oldColumn]: number[],
    [newRow, newColumn]: number[],
  ) {
    const oldTile = this.grid[oldRow][oldColumn];
    const newTile = this.grid[newRow][newColumn];
    if (!oldTile.isOccupied()) {
      throw new EmptyTileException();
    }
    if (newTile.isOccupied()) {
      throw new OccupiedTileException();
    }
    if (!oldTile.isPlayerTurn(playerTurn)) {
      throw new NotPlayerTurnException();
    }
    const isJump = oldTile.movements
      .filter(({ jump: [row, column] }) => this.isMovementValid(row, column))
      .find((movement) => equals(movement.jump, [newRow, newColumn]));
    return isJump
      ? this.makeJump(oldTile, newTile)
      : this.makeMovement(oldTile, newTile);
  }

  getState() {
    return this.grid.map((rows) => {
      return rows.map((tile) => tile.getPiece()?.player.playerOrder ?? 0);
    });
  }

  isJumpMovement(
    playerTurn: number,
    [row, column]: number[],
    newPiecePosition: number[],
  ): boolean {
    const currentTile = this.grid[row][column];
    return currentTile.movements.some(({ base, jump }) => {
      const [row, column] = base;
      const [jumpRow, jumpColumn] = jump;
      const nextTile = this.grid[row]?.[column];
      const isOpponentTile =
        nextTile?.isOccupied() && !nextTile?.isPlayerTurn(playerTurn);

      return (
        isOpponentTile &&
        this.isMovementValid(jumpRow, jumpColumn) &&
        equals(newPiecePosition, jump)
      );
    });
  }

  playerMustJump(
    playerTurn: number,
    currentPiecePosition: number[],
    newPiecePosition: number[],
  ): boolean {
    const isJump = this.isJumpMovement(
      playerTurn,
      currentPiecePosition,
      newPiecePosition,
    );
    if (isJump) {
      return false;
    }

    return this.grid.some((row) => {
      return row.some((tile) => {
        if (!tile.isOccupied() || !tile.isPlayerTurn(playerTurn)) return;

        return tile.movements.some(({ base, jump }) => {
          const [row, column] = base;
          const [jumpRow, jumpColumn] = jump;
          const nextTile = this.grid[row]?.[column];
          const isOpponentTile =
            nextTile?.isOccupied() && !nextTile?.isPlayerTurn(playerTurn);

          return isOpponentTile && this.isMovementValid(jumpRow, jumpColumn);
        });
      });
    });
  }

  getPiece(row: number, column: number): { piece: Piece, movements: number[][] } | null {
    const piece = this.grid[row][column].getPiece();
    if (!piece) return null
    const movements = piece.getPossibleMovements()
      .reduce((movements, { base, jump }) => {
        const [baseRow, baseColumn] = base
        const [jumpRow, jumpColumn] = jump
        const isBaseMovementValid = this.isMovementValid(baseRow, baseColumn)
        const isJumpMovementValid = this.isJumpMovement(
          piece.player.playerOrder,
          [row, column],
          jump,
        )
        const validMovements = []
        if (isBaseMovementValid) validMovements.push(base)
        if (isJumpMovementValid) validMovements.push(jump)

        return [...movements, ...validMovements]
      }, [])

    return {
      piece,
      movements,
    }
  }

  getWinner(): Player | null {
    const pieces = this.grid.flat().filter((tile) => tile.isOccupied());
    const playerOnePieces = pieces.filter(
      (tile) => tile.getPiece().player.playerOrder === Players.ONE,
    );
    const playerTwoPieces = pieces.filter(
      (tile) => tile.getPiece().player.playerOrder === Players.TWO,
    );
    if (isEmpty(playerOnePieces)) {
      return head(playerTwoPieces).getPiece().player;
    }
    if (isEmpty(playerTwoPieces)) {
      return head(playerOnePieces).getPiece().player;
    }

    return null;
  }

  static createGrid(player1: Player, player2: Player): Tile[][] {
    const players = new Map().set(1, player1).set(2, player2);
    return INITIAL_BOARD.map((row, rowIndex) => {
      return row.map((playerId, columnIndex) => {
        const player = players.get(playerId);
        const piece =
          playerId > 0 ? new Piece(rowIndex, columnIndex, player) : null;
        return new Tile(rowIndex, columnIndex, piece);
      });
    });
  }

  static createEmptyGrid(): Tile[][] {
    return INITIAL_BOARD.map((row, rowIndex) => {
      return row.map((playerId, columnIndex) => {
        return new Tile(rowIndex, columnIndex, null);
      });
    });
  }

  private makeMovement(oldTile: Tile, newTile: Tile) {
    const newMovementExists = oldTile.movements
      .filter(({ base: [row, column] }) => this.isMovementValid(row, column))
      .find((movement) => newTile.equals(movement.base));
    if (!newMovementExists) {
      throw new InvalidMovementException();
    }
    newTile.setPiece(oldTile.getPiece());
    if (newTile.isEdgeTile()) {
      newTile.makeKing();
    }
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
      throw new InvalidMovementException();
    }
    const removedTile = this.grid[row][column];
    newTile.setPiece(oldTile.getPiece());
    if (newTile.isEdgeTile()) {
      newTile.makeKing();
    }
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
