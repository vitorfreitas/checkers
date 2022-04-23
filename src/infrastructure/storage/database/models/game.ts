import { GameNotStartedException, MaxNumberOfPlayersException, UserMustJumpException } from 'src/domain/exceptions';
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
import { Board } from './board';
import { Player } from './player';

const MAX_PLAYERS = 2;
const FIRST_PLAYER = 1;
const SECOND_PLAYER = 2;

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

  @OneToOne(() => Board, (board: Board) => board.game)
  board: Board

  addPlayer(player: Player, board: Board) {
    if (this.players.length === MAX_PLAYERS) {
      throw new MaxNumberOfPlayersException();
    }
    this.board = board;
    this.players.push(player);
  }

  isTokenValid(accessToken: string): boolean {
    return this.accessToken === accessToken;
  }

  makePlay(currentPiecePosition: number[], newPiecePosition: number[]) {
    const playerMustJump = this.board.playerMustJump(
      this.playerTurn,
      currentPiecePosition,
      newPiecePosition,
    );
    if (playerMustJump) {
      throw new UserMustJumpException();
    }
    const isJumpMove = this.board.isJumpMovement(
      this.playerTurn,
      currentPiecePosition,
      newPiecePosition,
    );
    
    this.board.move(this.playerTurn, currentPiecePosition, newPiecePosition);
    const isJumpAvailable = this.board.playerMustJump(
      this.playerTurn,
      currentPiecePosition,
      newPiecePosition,
    );
    if (!isJumpMove || !isJumpAvailable) {
      this.changePlayerTurn();
    }
  }

  changePlayerTurn() {
    const playerTurns = new Map()
      .set(FIRST_PLAYER, SECOND_PLAYER)
      .set(SECOND_PLAYER, FIRST_PLAYER);
    this.playerTurn = playerTurns.get(this.playerTurn);
  }

  getBoard() {
    return this.board;
  }

  getStatus(): string {
    if (!this.board) {
      throw new GameNotStartedException();
    }
    const winner = this.board.getWinner();
    if (winner) {
      return `player_${winner.playerOrder} won`;
    }

    return `player_${this.playerTurn} turn`;
  }
}
