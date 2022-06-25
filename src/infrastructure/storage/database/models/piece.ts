import { equals } from 'ramda'
import { MAX_ROW_LENGTH, MIN_ROW_LENGTH } from 'src/domain/shared/constants/board';
import {
  ChildEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';
import { BasePiece } from './base-piece';
import { Board } from './board';
import { Player } from './player';

export type Movement = {
  base: number[];
  jump: number[];
};

@ChildEntity()
export class Piece extends BasePiece {
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
}
