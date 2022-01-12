import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game';
import { Piece } from './piece';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne((type) => Game, game => game.players)
  @JoinColumn()
  game: Game;

  @Column()
  playerOrder: number;

  @OneToMany((type) => Piece, (piece) => piece.player)
  pieces: Piece[];
}
