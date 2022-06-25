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
import { BasePiece } from './base-piece';
import { Game } from './game';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne((type) => Game, (game) => game.players)
  @JoinColumn()
  game: Game;

  @Column()
  playerOrder: number;

  @OneToMany((type) => BasePiece, (piece) => piece.player)
  pieces: BasePiece[];

  isPlayerTurn(turn: number) {
    return turn === this.playerOrder;
  }
}
