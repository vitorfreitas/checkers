import { equals, head, isEmpty, update } from 'ramda';
import {
  EmptyTileException,
  InvalidMovementException,
  NotPlayerTurnException,
  OccupiedTileException
} from 'src/domain/exceptions';
import { 
  INITIAL_BOARD,
  MAX_COLUMN_LENGTH,
  MAX_ROW_LENGTH,
  MIN_COLUMN_LENGTH,
  MIN_ROW_LENGTH
} from 'src/domain/shared/constants/board';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game';
import { Players } from 'src/domain/shared/constants/game';
import { Player } from './player';
import { King } from './king'
import { BasePiece } from './base-piece';
import { Piece } from './piece';

type PlayerTurn = 0 | 1 | 2;

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => Game, (game: Game) => game.board)
  @JoinColumn()
  game: Game;

  @OneToMany(() => BasePiece, (piece) => piece.board, { cascade: true })
  pieces: BasePiece[];

  get grid(): (BasePiece | null)[][] {
    return INITIAL_BOARD.map((row, rowIndex) =>
      row.map((_, columnIndex) => 
        this.pieces.find(
          piece => piece.row === rowIndex && piece.column === columnIndex
        )
      )
    )
  }

  move(
    playerTurn: number,
    [oldRow, oldColumn]: number[],
    [newRow, newColumn]: number[],
  ) {
    const piece = this.grid[oldRow][oldColumn];
    const newPosition = this.grid[newRow][newColumn];
    if (!piece) {
      throw new EmptyTileException();
    }
    if (newPosition) {
      throw new OccupiedTileException();
    }

    if (!piece.isPlayerTurn(playerTurn)) {
      throw new NotPlayerTurnException();
    }
    const isJump = piece.movements
      .filter(({ jump: [row, column] }) => this.isMovementValid(row, column))
      .find((movement) => equals(movement.jump, [newRow, newColumn]));
    return isJump
      ? this.makeJump(piece, [newRow, newColumn])
      : this.makeMovement(piece, [newRow, newColumn]);
  }

  getState() {
    return this.grid.map((rows) => {
      return rows
        .map((piece) => piece?.player.playerOrder ?? 0)
        .join(' ');
    });
  }

  isJumpMovement(
    playerTurn: number,
    [row, column]: number[],
    newPiecePosition: number[],
  ): boolean {
    const piece = this.grid[row][column];

    if (!piece) return false;

    return piece.getPossibleMovements().some(({ base, jump }) => {
      const [row, column] = base;
      const [jumpRow, jumpColumn] = jump;
      const nextMovement = this.grid[row]?.[column];
      const isOpponentTile =
        nextMovement && !nextMovement?.isPlayerTurn(playerTurn);

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
      return row.some((piece) => {
        if (!piece || !piece.isPlayerTurn(playerTurn)) return;

        return piece.movements.some(({ base, jump }) => {
          const [row, column] = base;
          const [jumpRow, jumpColumn] = jump;
          const nextMovement = this.grid[row]?.[column];
          const isOpponentTile = nextMovement && !nextMovement?.isPlayerTurn(playerTurn);

          return isOpponentTile && this.isMovementValid(jumpRow, jumpColumn);
        });
      });
    });
  }

  getPiece(row: number, column: number): { piece: BasePiece, movements: number[][] } | null {
    const piece = this.grid[row][column];
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
    const pieces = this.grid.flat().filter(Boolean);
    const playerOnePieces = pieces.filter(
      // todo: piece.player.isPlayerOne()
      (piece) => piece.player.playerOrder === Players.ONE,
    );
    const playerTwoPieces = pieces.filter(
      // todo: piece.player.isPlayerTwo()
      (piece) => piece.player.playerOrder === Players.TWO,
    );
    if (isEmpty(playerOnePieces)) {
      return head(playerTwoPieces).player;
    }
    if (isEmpty(playerTwoPieces)) {
      return head(playerOnePieces).player;
    }

    return null;
  }

  static createGrid(player1: Player, player2: Player): BasePiece[][] {
    const players = new Map().set(1, player1).set(2, player2);

    return INITIAL_BOARD.map((row, rowIndex) => {
      return row.map((playerTurn: PlayerTurn, columnIndex) => {
        const player = players.get(playerTurn);

        if (!player) return null

        const piece = new Piece()
        piece.row = rowIndex
        piece.column = columnIndex
        piece.player = player

        return piece;
      });
    });
  }

  private makeMovement(piece: BasePiece, [x, y]: [number, number]) {
    const newMovementExists = piece.movements
      .filter(({ base: [row, column] }) => this.isMovementValid(row, column))
      .find((movement) => equals([x, y], movement.base));
    if (!newMovementExists) {
      throw new InvalidMovementException();
    }

    // move to new position
    this.grid[x][y] = piece
    piece.setCoords(x, y)

    if (piece.isEdgeTile()) {
      const updatedPieces = this.pieces.map(p => {
        if (p !== piece) return p

        const king = new King()
        king.row = piece.row
        king.column = piece.column
        king.player = piece.player

        return king
      })

      this.pieces = updatedPieces
    }
  }

  private makeJump(piece: BasePiece, [x, y]: [number, number]) {
    const {
      base: [jumpedX, jumpedY],
    } = piece.movements.find(
      ({ jump: [row, column] }) =>
        this.isMovementValid(row, column) && equals([x, y], [row, column]),
    );
    if (!jumpedX && !jumpedY) {
      throw new InvalidMovementException();
    }

    // move to new position and remove the jumped piece
    this.grid[x][y] = piece
    piece.setCoords(x, y)
    const removedPiece = this.grid[jumpedX][jumpedY]
    const updatedPieces = this.pieces.filter(piece => piece !== removedPiece)
    this.pieces = updatedPieces

    if (piece.isEdgeTile()) {
      piece.makeKing();
    }
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
    const pieceExists = this.grid[row][column];

    return !pieceExists;
  }
}
