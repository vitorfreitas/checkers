import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { GameRepository } from '../../../domain/repositories/game-repository';
import { GameRepositoryMemory } from '../../../infrastructure/storage/memory/repositories/game-repository-memory';
import { INITIAL_BOARD } from '../../../domain/shared/constants/board';
import { PLAYER_1_WIN_GAME } from '../../../../test/constants/game';
import {
  EmptyTileException,
  UserMustJumpException,
  OccupiedTileException,
  NotPlayerTurnException,
  InvalidMovementException,
  MaxNumberOfPlayersException,
  GameNotFoundException,
  InvalidTokenException,
  PieceNotFoundException,
} from '../../../domain/exceptions';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: GameRepository,
          useClass: GameRepositoryMemory,
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  describe('create', () => {
    it('should create a new game', async () => {
      const { accessToken } = await service.create();
      expect(accessToken).toMatch(new Date().getFullYear().toString());
    });
  });

  describe('join', () => {
    it('should throw an error for game not found', async () => {
      await expect(() => service.join('')).rejects.toThrow(GameNotFoundException);
    });

    it('should join a game', async () => {
      const { accessToken } = await service.create();
      const playerId = await service.join(accessToken);
      expect(playerId).toEqual(2);
    });

    it('should throw an error when the game is full', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      await expect(() => service.join(accessToken)).rejects.toThrow(
        MaxNumberOfPlayersException
      );
    });
  });

  describe('movePiece', () => {
    it('should throw an error for game not found', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      const params = {
        accessToken: '',
        currentPiecePosition: [5, 0],
        newPiecePosition: [4, 1],
      };
      await expect(() => service.movePiece(params)).rejects.toThrow(
        GameNotFoundException
      );
    });

    it('should throw an error for when a piece belongs to the other player', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      const params = {
        accessToken,
        currentPiecePosition: [5, 0],
        newPiecePosition: [4, 1],
      };
      await expect(() => service.movePiece(params)).rejects.toThrow(
        NotPlayerTurnException
      );
    });

    it('should throw an error for invalid movement', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      const params = {
        accessToken,
        currentPiecePosition: [2, 1],
        newPiecePosition: [3, 1],
      };
      await expect(() => service.movePiece(params)).rejects.toThrow(
        InvalidMovementException,
      );
    });

    it('should throw an error for occupied tile', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      const params = {
        accessToken,
        currentPiecePosition: [5, 0],
        newPiecePosition: [5, 2],
      };
      await expect(() => service.movePiece(params)).rejects.toThrow(
        OccupiedTileException,
      );
    });

    it('should throw an error if a jump is available', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      await service.movePiece({
        accessToken,
        currentPiecePosition: [2, 1],
        newPiecePosition: [3, 2],
      });
      await service.movePiece({
        accessToken,
        currentPiecePosition: [5, 0],
        newPiecePosition: [4, 1],
      });
      const params = {
        accessToken,
        currentPiecePosition: [3, 2],
        newPiecePosition: [4, 3],
      };
      await expect(() => service.movePiece(params)).rejects.toThrow(
        UserMustJumpException,
      );
    });

    it('should perform a simple play', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      const params = {
        accessToken,
        currentPiecePosition: [2, 1],
        newPiecePosition: [3, 2],
      };
      const boardState = await service.movePiece(params);
      expect(boardState).toEqual([
        '0 1 0 1 0 1 0 1',
        '1 0 1 0 1 0 1 0',
        '0 0 0 1 0 1 0 1',
        '0 0 1 0 0 0 0 0',
        '0 0 0 0 0 0 0 0',
        '2 0 2 0 2 0 2 0',
        '0 2 0 2 0 2 0 2',
        '2 0 2 0 2 0 2 0',
      ]);
    });

    it('should perform a jump', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      await service.movePiece({
        accessToken,
        currentPiecePosition: [2, 1],
        newPiecePosition: [3, 2],
      });
      await service.movePiece({
        accessToken,
        currentPiecePosition: [5, 0],
        newPiecePosition: [4, 1],
      });
      const boardState = await service.movePiece({
        accessToken,
        currentPiecePosition: [3, 2],
        newPiecePosition: [5, 0],
      });
      expect(boardState).toEqual([
        '0 1 0 1 0 1 0 1',
        '1 0 1 0 1 0 1 0',
        '0 0 0 1 0 1 0 1',
        '0 0 0 0 0 0 0 0',
        '0 0 0 0 0 0 0 0',
        '1 0 2 0 2 0 2 0',
        '0 2 0 2 0 2 0 2',
        '2 0 2 0 2 0 2 0',
      ]);
    });

    it('should crown a king', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      const moves = [
        { a: [2, 1], b: [3, 2] },
        { a: [5, 0], b: [4, 1] },
        { a: [3, 2], b: [5, 0] },
        { a: [5, 2], b: [4, 3] },
        { a: [2, 5], b: [3, 6] },
        { a: [6, 1], b: [5, 2] },
        { a: [1, 0], b: [2, 1] },
        { a: [7, 2], b: [6, 1] },
        { a: [5, 0], b: [7, 2] },
      ];
      await Promise.all(
        moves.map((move) => {
          return service.movePiece({
            accessToken,
            currentPiecePosition: move.a,
            newPiecePosition: move.b,
          });
        }),
      );
      const piece = await service.getPieceStatus(accessToken, 7, 2);

      expect(piece.isKing).toBeTruthy();
    });

    it('should win a game', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      await Promise.all(
        PLAYER_1_WIN_GAME.map((move) => {
          return service.movePiece({
            accessToken,
            currentPiecePosition: move.a,
            newPiecePosition: move.b,
          });
        }),
      );

      const gameStatus = await service.getGameStatus(accessToken);

      expect(gameStatus).toEqual('player_1 won');
    });
  });

  describe('getBoardState', () => {
    it('should return the board state', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      const board = await service.getBoardState(accessToken);
      const expectedBoard = INITIAL_BOARD.map((row) => row.join(' '));
      expect(board).toEqual(expectedBoard);
    });
  });

  describe('getPieceStatus', () => {
    it('should return the piece status', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      const piece = await service.getPieceStatus(accessToken, 0, 1);
      expect(piece).not.toBeNull();
    });

    it('should throw an error for piece not found', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      await expect(() =>
        service.getPieceStatus(accessToken, 0, 0),
      ).rejects.toThrow(PieceNotFoundException);
    });
  });

  describe('getGameStatus', () => {
    it('should return the game status', async () => {
      const { accessToken } = await service.create();
      await service.join(accessToken);
      const gameStatus = await service.getGameStatus(accessToken);
      expect(gameStatus).toEqual('player_1 turn');
    });
  });
});
