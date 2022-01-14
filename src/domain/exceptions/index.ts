export class EmptyTileException extends Error {
  constructor(message?: string) {
    super(message || 'The desired tile does not have any piece');
  }
}

export class UserMustJumpException extends Error {
  constructor(message?: string) {
    super(message || 'The user must perform a jump');
  }
}

export class OccupiedTileException extends Error {
  constructor(message?: string) {
    super(message || 'The desired tile is occupied with another piece');
  }
}

export class NotPlayerTurnException extends Error {
  constructor(message?: string) {
    super(message || "It's not your turn, try again later");
  }
}

export class InvalidMovementException extends Error {
  constructor(message?: string) {
    super(
      message || 'The requested movement does not comply with the game rules',
    );
  }
}

export class MaxNumberOfPlayersException extends Error {
  constructor(message?: string) {
    super(message || 'The game already has 2 players');
  }
}

export class GameNotFoundException extends Error {
  constructor(message?: string) {
    super(message || 'The game was not found');
  }
}

export class InvalidTokenException extends Error {
  constructor(message?: string) {
    super(message || 'The token is invalid');
  }
}

export class PieceNotFoundException extends Error {
  constructor(message?: string) {
    super(message || 'The requested piece was not found');
  }
}
