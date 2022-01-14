# Checkers

You can access the api [here](http://www.checkers.frema.digital/api)

## Running

* You must have docker and docker-compose installed
* `./run.sh`
* Access `http://localhost:3000/api`

## Acceptance criteria

> 1. Como usuário quero criar um jogo que permita duas pessoas jogarem (assim que é criado, eu sou o player 1; api retorna o game_id e o
token de acesso para o player_2)

* Create a game via `POST /games`

__All the following steps must use the access code returned from this
endpoint.__

> 2. Como usuário que possui um token de acesso válido, quero entrar num jogo como player_2

* Join a game via `POST /games/:accessCode/join`

> 3. Como jogador, quero consultar qual o estado atual das peças no tabuleiro

* Use `GET /games/:accessCode/board`

This returns a grid with all the pieces in the table

> 4. Como jogador (participante de um game), quero consultar quais são os movimentos permitidos de uma certa peça

* Use `GET /games/:accessCode/piece`, passing the position as an array of
    numbers, where: the first item is the row, the second item is the column

> 6. Como jogador, quero mover peças no tabuleiro, respeitando as regras do jogo

* Use `POST /games/:accessCode/move`, passing and `oldPosition` array of
    row/column, and a `newPosition` following the same pattern

> 5. Como jogador, quero consultar de quem é a vez

> 7. Como jogador, quero consultar o status do jogo ('waiting for opponent', 'player_1 turn', 'player_2 turn', 'player_1 won', 'player_2 won')

* Use `GET /games/:accessCode/status`
* This endpoint returns one of the following status:
  * player_1 turn
  * player_2 turn
  * player_1 won
  * player_2 won

## Tests

* `npm test` - Unit tests
* `npm run test:e2e` - Integration tests
