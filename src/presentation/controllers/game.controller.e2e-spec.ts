import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PLAYER_1_WIN_GAME } from '../../../test/constants/game';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';

jest.setTimeout(100000);

describe('GameController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const httpAdapter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));

    await app.init();
  });

  describe('/games (POST)', () => {
    it('should create a new game', () => {
      return request(app.getHttpServer())
        .post('/games')
        .expect(201)
        .then((response) => {
          return expect(response.body.accessToken).toMatch(
            new Date().getFullYear().toString(),
          );
        });
    });
  });

  describe('/games/:accessToken/join', () => {
    it('should join a game', async () => {
      const req = request(app.getHttpServer());
      const response = await req.post('/games');
      const accessToken = response.body.accessToken;

      return req.post(`/games/${accessToken}/join`).expect(201);
    });

    it('should throw an error for game not found', async () => {
      const req = request(app.getHttpServer());
      return req
        .post('/games/not-found/join')
        .expect(404)
        .then((response) => {
          expect(response.body.message).toEqual('The game was not found');
        });
    });
  });

  describe('/games/:accessToken/move', () => {
    let req: request.SuperTest<any>;
    let accessToken: string;

    beforeEach(async () => {
      req = request(app.getHttpServer());
      const response = await req.post('/games');
      accessToken = response.body.accessToken;
      await req.post(`/games/${accessToken}/join`);
    });

    it('should win a game as player 1', async () => {
      for (const move of PLAYER_1_WIN_GAME) {
        await req
          .post(`/games/${accessToken}/move`)
          .send({
            oldPosition: move.a,
            newPosition: move.b,
          })
          .expect(201);
      }

      return req
        .get(`/games/${accessToken}/status`)
        .expect(200)
        .expect('player_1 won');
    });

    it('should throw an error for invalid movement', async () => {
      return req
        .post(`/games/${accessToken}/move`)
        .send({
          oldPosition: [2, 1],
          newPosition: [3, 1],
        })
        .expect(422)
        .then((response) => {
          expect(response.body.message).toEqual(
            'The requested movement does not comply with the game rules',
          );
        });
    });

    it('should throw an error for piece not found', async () => {
      return req
        .post(`/games/${accessToken}/move`)
        .send({
          oldPosition: [0, 0],
          newPosition: [3, 1],
        })
        .expect(422)
        .then((response) => {
          expect(response.body.message).toEqual(
            'The desired tile does not have any piece',
          );
        });
    });
  });
});
