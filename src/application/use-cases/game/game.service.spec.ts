import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { GameRepository } from '../../../domain/repositories/game-repository';
import { GameRepositoryMemory } from '../../../infrastructure/database/memory/game-repository-memory';
import { INITIAL_BOARD } from "../../../domain/shared/constants/board";

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
    it('should create a new game', () => {
      const { gameId, accessToken } = service.create();
      expect(gameId).toEqual(1);
      expect(accessToken).toMatch(`${gameId}${new Date().getFullYear()}`);
    });
  });

  describe('join', () => {
    it('should throw an error for game not found', () => {
      expect(() => service.join(999, '')).toThrow('GameNotFound');
    });

    it('should throw an error for invalid token', () => {
      const { gameId } = service.create();
      expect(() => service.join(gameId, '')).toThrow('InvalidToken');
    });

    it('should join a game', () => {
      const { gameId, accessToken } = service.create();
      const playerId = service.join(gameId, accessToken);
      expect(playerId).toEqual(2);
    });

    it('should throw an error when the game is full', () => {
      const { gameId, accessToken } = service.create();
      service.join(gameId, accessToken);
      expect(() => service.join(gameId, accessToken)).toThrow(
        'MaxNumberOfPlayersReached',
      );
    });
  });

  describe('movePiece', () => {
    it('should throw an error for game not found', () => {
      const { gameId, accessToken } = service.create();
      service.join(gameId, accessToken);
      const params = {
        accessToken: '',
        currentPiecePosition: [5, 0],
        newPiecePosition: [4, 1],
      };
      expect(() => service.movePiece(params)).toThrow('GameNotFound');
    });

    it('should throw an error for when a piece belongs to the other player', () => {
      const { gameId, accessToken } = service.create();
      service.join(gameId, accessToken);
      const params = {
        accessToken,
        currentPiecePosition: [5, 0],
        newPiecePosition: [4, 1],
      };
      expect(() => service.movePiece(params)).toThrow('NotPlayerTurn');
    });

    it('should throw an error for invalid movement', () => {
      const { gameId, accessToken } = service.create();
      service.join(gameId, accessToken);
      const params = {
        accessToken,
        currentPiecePosition: [2, 1],
        newPiecePosition: [3, 1],
      };
      expect(() => service.movePiece(params)).toThrow('InvalidMovement');
    });

    it('should throw an error for occupied tile', () => {
      const { gameId, accessToken } = service.create();
      service.join(gameId, accessToken);
      const params = {
        accessToken,
        currentPiecePosition: [5, 0],
        newPiecePosition: [5, 2],
      };
      expect(() => service.movePiece(params)).toThrow('OccupiedTile');
    });

    it('should throw an error if a jump is available', () => {
      const { gameId, accessToken } = service.create();
      service.join(gameId, accessToken);
      service.movePiece({
        accessToken,
        currentPiecePosition: [2, 1],
        newPiecePosition: [3, 2],
      });
      service.movePiece({
        accessToken,
        currentPiecePosition: [5, 0],
        newPiecePosition: [4, 1],
      });
      const params = {
        accessToken,
        currentPiecePosition: [3, 2],
        newPiecePosition: [4, 3],
      };
      expect(() => service.movePiece(params)).toThrow('UserMustJump');
    });

    it('should perform a simple play', () => {
      const { gameId, accessToken } = service.create();
      service.join(gameId, accessToken);
      const params = {
        accessToken,
        currentPiecePosition: [2, 1],
        newPiecePosition: [3, 2],
      };
      const boardState = service.movePiece(params);
      expect(boardState).toEqual([
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 1, 0, 1, 0, 1],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [2, 0, 2, 0, 2, 0, 2, 0],
        [0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0],
      ]);
    });

    it('should perform a jump', () => {
      const { gameId, accessToken } = service.create();
      service.join(gameId, accessToken);
      service.movePiece({
        accessToken,
        currentPiecePosition: [2, 1],
        newPiecePosition: [3, 2],
      });
      service.movePiece({
        accessToken,
        currentPiecePosition: [5, 0],
        newPiecePosition: [4, 1],
      });
      const boardState = service.movePiece({
        accessToken,
        currentPiecePosition: [3, 2],
        newPiecePosition: [5, 0],
      });
      expect(boardState).toEqual([
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 2, 0, 2, 0, 2, 0],
        [0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0],
      ]);
    });
  });

  describe('getBoardState', () => {
    it('should return the board state', () => {
      const { gameId, accessToken } = service.create();
      service.join(gameId, accessToken);
      const board = service.getBoardState(accessToken);
      expect(board).toEqual(INITIAL_BOARD);
    });
  });
});
