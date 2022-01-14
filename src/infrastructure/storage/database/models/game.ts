import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from './player';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column()
  accessToken: string;

  @Column()
  playerTurn: number;

  @OneToMany((type) => Player, (player) => player.game)
  @JoinColumn()
  players: Player[];
}
