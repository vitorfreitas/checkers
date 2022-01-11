import * as randomString from 'randomstring';
import { Board } from './board';
import { Player } from './player';

const MAX_PLAYERS = 2;
const FIRST_PLAYER = 1;
const SECOND_PLAYER = 2;

export class Game {
  id: number;
  accessToken: string;
  playerTurn: number;
  private readonly board: Board;
  private readonly players: Player[];

  constructor(id: number, board: Board, firstPlayer: Player) {
    this.id = id;
    this.board = board;
    const code = randomString.generate(4);
    this.accessToken = `${id}${new Date().getFullYear()}${code}`;
    this.players = [firstPlayer];
    this.playerTurn = FIRST_PLAYER;
  }

  addPlayer(player: Player) {
    if (this.players.length === MAX_PLAYERS) {
      throw new Error('MaxNumberOfPlayersReached');
    }
    this.players.push(player);
    const [player1, player2] = this.players;
    this.board.initialize(player1, player2);
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
      throw new Error('UserMustJump');
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
    const winner = this.board.getWinner();
    if (winner) {
      return `player_${winner.playerOrder} won`;
    }

    return `player_${this.playerTurn} turn`;
  }
}
