import { Piece } from "src/infrastructure/storage/database/models/piece"

export class GetPieceOutputData {
  readonly movements: number[][]
  readonly row: number
  readonly column: number
  readonly player: string
  readonly isKing: boolean

  constructor(piece: Piece, movements: number[][]) {
    this.movements = movements
    this.row = piece.row
    this.column = piece.column
    this.player = `player_${piece.player.playerOrder}`
    this.isKing = piece.isKing
  }
}
