import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GameService } from '../../application/use-cases/game/game.service';
import {
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

class MoveDto {
  @ApiProperty({ example: [0, 1] })
  oldPosition: number[];

  @ApiProperty({ example: [1, 2] })
  newPosition: number[];
}

class GetPieceDto {
  @ApiProperty({ example: [0, 1] })
  position: number[];
}

@ApiTags('games')
@Controller('games')
export class GameController {
  constructor(private service: GameService) {}

  @Post()
  @ApiOperation({ summary: 'Create game' })
  @ApiResponse({ status: 201, description: 'Created.' })
  create() {
    return this.service.create();
  }

  @Post('/:accessToken/join')
  @ApiOperation({ summary: 'Join game' })
  @ApiResponse({ status: 200, description: 'Game joined' })
  join(@Param('accessToken') accessToken: string) {
    return this.service.join(accessToken);
  }

  @Post('/:accessToken/move')
  @ApiOperation({ summary: 'Move pieces' })
  @ApiResponse({ status: 200, description: 'Piece successfully moved' })
  @ApiBody({ type: MoveDto })
  move(@Param('accessToken') accessToken: string, @Body() body: MoveDto) {
    return this.service.movePiece({
      accessToken,
      currentPiecePosition: body.oldPosition,
      newPiecePosition: body.newPosition,
    });
  }

  @Get('/:accessToken/board')
  @ApiOperation({ summary: 'Get board state (grid)' })
  @ApiResponse({ status: 200, description: 'Board state' })
  getBoardState(@Param('accessToken') accessToken: string) {
    return this.service.getBoardState(accessToken);
  }

  @Post('/:accessToken/piece')
  @ApiOperation({ summary: 'Get piece state' })
  @ApiResponse({ status: 200, description: 'Piece found' })
  @ApiBody({ type: GetPieceDto })
  getPieceState(
    @Param('accessToken') accessToken: string,
    @Body() body: GetPieceDto,
  ) {
    const [row, column] = body.position;
    return this.service.getPieceStatus(accessToken, row, column);
  }

  @Get('/:accessToken/status')
  @ApiOperation({ summary: 'Get game status' })
  @ApiResponse({ status: 200, description: 'Game status' })
  getGameStatus(@Param('accessToken') accessToken: string) {
    return this.service.getGameStatus(accessToken);
  }
}
