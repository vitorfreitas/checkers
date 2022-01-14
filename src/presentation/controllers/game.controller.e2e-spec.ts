import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PLAYER_1_WIN_GAME } from '../../../test/constants/game';

jest.setTimeout(100000);

describe('GameController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  describe('/games/:accessToken/move', () => {
    let req: request.SuperTest<any>;
    let accessToken: string;

    beforeAll(async () => {
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
  });
});

const a = [
  [0, 1, 0, 1, 0, 1, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 2, 0, 2],
  [1, 0, 1, 0, 0, 0, 0, 0],
];
