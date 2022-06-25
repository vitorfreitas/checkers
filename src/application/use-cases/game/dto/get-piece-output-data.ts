import { BasePiece } from "src/infrastructure/storage/database/models/base-piece"

export class GetPieceOutputData {
  readonly movements: number[][]
  readonly row: number
  readonly column: number
  readonly player: string

  constructor(piece: BasePiece, movements: number[][]) {
    this.movements = movements
    this.row = piece.row
    this.column = piece.column
    this.player = `player_${piece.player.playerOrder}`
  }
}
