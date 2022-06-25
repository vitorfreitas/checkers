import { MAX_ROW_LENGTH, MIN_ROW_LENGTH } from 'src/domain/shared/constants/board';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';
import { Board } from './board';
import { Player } from './player';

export type Movement = {
  base: number[];
  jump: number[];
};

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class BasePiece extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Board)
  @JoinColumn()
  board: Board;

  @ManyToOne(() => Player, { eager: true })
  @JoinColumn()
  player: Player;

  @Column()
  row: number;

  @Column()
  column: number;

  @Column()
  type: string;

  makeKing() {
    this.type = 'King'
  }

  isPlayerTurn(playerTurn: number) {
    return this.player.isPlayerTurn(playerTurn);
  }

  get movements(): Movement[] {
    return this.getPossibleMovements();
  }

  getPossibleMovements() {
    return []
  }

  setCoords(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  isEdgeTile() {
    return this.row === MIN_ROW_LENGTH || this.row === MAX_ROW_LENGTH;
  }
}

