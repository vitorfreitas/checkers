import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game';
import { Piece } from './piece';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne((type) => Game)
  @JoinColumn()
  game: Game;

  @OneToMany(() => Piece, (piece) => piece.board)
  pieces: Piece[];
}
