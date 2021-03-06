import { Board } from './board';
import { Player } from './player';
import * as randomString from 'randomstring';
import {
  GameNotStartedException,
  MaxNumberOfPlayersException,
  UserMustJumpException
} from "../exceptions";

const MAX_PLAYERS = 2;
const FIRST_PLAYER = 1;
const SECOND_PLAYER = 2;

export class Game {
  accessToken: string;
  playerTurn: number;
  private board: Board;
  readonly players: Player[];

  constructor(firstPlayer: Player, accessToken?: string, playerTurn?: number) {
    const code = randomString.generate(4);
    this.accessToken = accessToken || `${new Date().getFullYear()}${code}`;
    this.players = [firstPlayer];
    this.playerTurn = playerTurn || FIRST_PLAYER;
  }

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
