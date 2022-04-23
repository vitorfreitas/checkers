import { GameRepository } from '../../../../domain/repositories/game-repository';
import { Connection, Repository, EntityManager } from 'typeorm';
import { Game } from '../models/game';
import { Board } from '../models/board';
import { Piece } from '../models/piece';
import { Player } from '../models/player';
import { Players } from '../../../../domain/shared/constants/game';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';

export class GameRepositoryDatabase implements GameRepository {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(Piece)
    private pieceRepository: Repository<Piece>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectConnection() private connection: Connection,
  ) {}

  async create(player: Player): Promise<Game> {
    const game = new Game();
    game.players = [player]
    game.playerTurn = player.playerOrder
    game.accessToken = game.accessToken

    await this.gameRepository.save(game);
    await this.playerRepository.update(player.id, { game });

    return game;
  }

  async findOneByAccessToken(accessToken: string): Promise<Game | undefined> {
    const game = await this.gameRepository.findOne({
      where: { accessToken },
      relations: ['players'],
    });
    if (!game) return undefined;

    const player1 = game.players.find(
      (player) => player.playerOrder === Players.ONE,
    );
    if (!player1) return undefined;

    const board = await this.boardRepository.findOne({
      where: { game },
      relations: ['pieces', 'pieces.player'],
    });
    if (!board) return game;

    const player2 = game.players.find(
      (player) => player.playerOrder === Players.TWO,
    );
    if (!player2) return game;

    return game;
  }

  // todo: remove
  async reRenderGameState(game: Game): Promise<Game> {
    return game
  }

  async createPlayer(
    playerOrder: number,
    accessToken?: string,
  ): Promise<Player> {
    const game = await this.gameRepository.findOne({ accessToken });
    const player = await this.playerRepository.save({
      playerOrder,
      game,
    });

    return player;
  }

  async createBoard(
    accessToken: string,
    player1: Player,
    player2: Player,
  ): Promise<Board> {
    const game = await this.gameRepository.findOne({ accessToken });
    const grid = Board.createGrid(player1, player2);
    const pieces = grid.flat().filter(Boolean).flat()
    const board = await this.boardRepository.save({
      game,
      pieces,
    });

    return board
  }

  // todo: remove
  private createPiece(
    entityManager: EntityManager,
    board: Board,
  ) {
    // const piece = new Piece();
    // piece.row = tile.row;
    // piece.column = tile.column;
    // piece.isKing = tile.getPiece().isKing();
    // piece.board = board;
    // piece.player = { id: tile.getPiece().player.id } as Player;

    // return entityManager.save(piece);
  }
}
