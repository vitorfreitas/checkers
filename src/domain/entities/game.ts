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
    const isJumpAvailable = this.board.isJumpAvailable(this.playerTurn);
    if (isJumpAvailable) {
      throw new Error('UserMustJump');
    }
    this.board.makeMovement(
      this.playerTurn,
      currentPiecePosition,
      newPiecePosition,
    );
    this.changePlayerTurn();
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
}
