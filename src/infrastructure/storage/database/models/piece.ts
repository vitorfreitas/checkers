import { equals } from 'ramda'
import { MAX_ROW_LENGTH, MIN_ROW_LENGTH } from 'src/domain/shared/constants/board';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from './board';
import { Player } from './player';

export type Movement = {
  base: number[];
  jump: number[];
};

@Entity()
export class Piece {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Board)
  @JoinColumn()
  board: Board;

  @ManyToOne(() => Player)
  @JoinColumn()
  player: Player;

  @Column()
  row: number;

  @Column()
  column: number;

  @Column({ nullable: true })
  isKing: boolean;

  getPossibleMovements(): Movement[] {
    const movements = new Map()
      .set(1, [
        {
          base: [this.row + 1, this.column - 1],
          jump: [this.row + 2, this.column - 2],
        },
        {
          base: [this.row + 1, this.column + 1],
          jump: [this.row + 2, this.column + 2],
        },
      ])
      .set(2, [
        {
          base: [this.row - 1, this.column - 1],
          jump: [this.row - 2, this.column - 2],
        },
        {
          base: [this.row - 1, this.column + 1],
          jump: [this.row - 2, this.column + 2],
        },
      ]);
    return movements.get(this.player.playerOrder) || [];
  }

  setCoords(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  // todo: move to repository
  isOccupied(): boolean {
    return false
  }

  // todo: move to repository or remove
  setPiece(piece: Piece) {
  }

  makeKing() {
    this.isKing = true
  }

  // todo: remove usages
  getPiece() {
  }

  // todo: remove usages
  empty() {
  }

  isPlayerTurn(playerTurn: number) {
    return this.player.isPlayerTurn(playerTurn);
  }

  equals(position: number[]) {
    return equals(position, [this.row, this.column]);
  }

  isEdgeTile() {
    return this.row === MIN_ROW_LENGTH || this.row === MAX_ROW_LENGTH;
  }

  get movements(): Movement[] {
    return this.getPossibleMovements();
  }

  // isKing(): boolean {
  //   return false;
  // }
}
