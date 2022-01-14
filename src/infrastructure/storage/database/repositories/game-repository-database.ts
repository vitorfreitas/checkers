import { GameRepository } from '../../../../domain/repositories/game-repository';
import { Game } from '../../../../domain/entities/game';
import { Player } from '../../../../domain/entities/player';
import { Board } from '../../../../domain/entities/board';
import { Connection, Repository, EntityManager } from 'typeorm';
import { Game as GameModel } from '../models/game';
import { Board as BoardModel } from '../models/board';
import { Piece as PieceModel } from '../models/piece';
import { Player as PlayerModel } from '../models/player';
import { Players } from '../../../../domain/shared/constants/game';
import { Tile } from '../../../../domain/entities/tile';
import { Piece } from '../../../../domain/entities/piece';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { King } from '../../../../domain/entities/king';

export class GameRepositoryDatabase implements GameRepository {
  constructor(
    @InjectRepository(GameModel)
    private gameRepository: Repository<GameModel>,
    @InjectRepository(BoardModel)
    private boardRepository: Repository<BoardModel>,
    @InjectRepository(PieceModel)
    private pieceRepository: Repository<PieceModel>,
    @InjectRepository(PlayerModel)
    private playerRepository: Repository<PlayerModel>,
    @InjectConnection() private connection: Connection,
  ) {}

  async create(player: Player): Promise<Game> {
    const game = new Game(player);
    const gameModel = await this.gameRepository.save({
      playerTurn: player.playerOrder,
      accessToken: game.accessToken,
    });
    await this.playerRepository.update(player.id, { game: gameModel });
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
    const player1Entity = new Player(player1.id, player1.playerOrder);
    const gameEntity = new Game(player1Entity, accessToken, game.playerTurn);
    const board = await this.boardRepository.findOne({
      where: { game },
      relations: ['pieces', 'pieces.player'],
    });
    if (!board) return gameEntity;
    const player2 = game.players.find(
      (player) => player.playerOrder === Players.TWO,
    );
    if (!player2) return gameEntity;
    const grid = Board.createEmptyGrid();
    for (const piece of board.pieces) {
      const player = new Player(piece.player.id, piece.player.playerOrder);
      const pieceEntity = piece.isKing
        ? new King(piece.row, piece.column, player)
        : new Piece(piece.row, piece.column, player);
      const tile = grid[piece.row][piece.column];
      tile.setPiece(pieceEntity);
    }

    const player2Entity = new Player(player2.id, player2.playerOrder);
    const boardEntity = new Board(grid);
    gameEntity.addPlayer(player2Entity, boardEntity);
    return gameEntity;
  }

  async reRenderGameState(game: Game): Promise<Game> {
    const board = await this.boardRepository.findOne({
      where: {
        game: {
          accessToken: game.accessToken,
        },
      },
      relations: ['game', 'pieces'],
    });

    await this.connection.transaction(async (entityManager) => {
      await entityManager.softDelete(PieceModel, board.pieces);

      await Promise.all(
        game
          .getBoard()
          .grid.flat()
          .filter((tile) => tile.isOccupied())
          .map((tile) => this.createPiece(entityManager, tile, board)),
      );

      await this.gameRepository.update(board.game.id, {
        playerTurn: game.playerTurn,
      });
    });

    return this.findOneByAccessToken(game.accessToken);
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
    return new Player(player.id, playerOrder);
  }

  async createBoard(
    accessToken: string,
    player1: Player,
    player2: Player,
  ): Promise<Board> {
    const game = await this.gameRepository.findOne({ accessToken });
    return this.connection.transaction(async (entityManager) => {
      const board = await this.boardRepository.save({ game });
      const grid = Board.createGrid(player1, player2);
      await Promise.all(
        grid
          .flat()
          .filter((tile) => tile.isOccupied())
          .map((tile) => this.createPiece(entityManager, tile, board)),
      );
      return new Board(grid);
    });
  }

  private createPiece(
    entityManager: EntityManager,
    tile: Tile,
    board: BoardModel,
  ) {
    const piece = new PieceModel();
    piece.row = tile.row;
    piece.column = tile.column;
    piece.isKing = tile.getPiece().isKing();
    piece.board = board;
    piece.player = { id: tile.getPiece().player.id } as PlayerModel;
    return entityManager.save(piece);
  }
}
