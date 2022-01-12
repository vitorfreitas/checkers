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

@Entity()
export class Piece {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne((type) => Board)
  @JoinColumn()
  board: Board;

  @ManyToOne((type) => Player)
  @JoinColumn()
  player: Player;

  @Column()
  row: number;

  @Column()
  column: number;

  @Column({ nullable: true })
  isKing: boolean;
}
