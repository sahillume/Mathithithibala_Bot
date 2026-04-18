/**
 * Tic Tac Toe Utility (WhatsApp Bot Game System)
 */

const games = new Map();

/**
 * Create new game
 */
function createGame(chatId, playerX) {
  const game = {
    chatId,
    board: Array(9).fill(null),
    playerX,
    playerO: null,
    turn: playerX,
    winner: null,
    status: 'waiting' // waiting | playing | ended
  };

  games.set(chatId, game);
  return game;
}

/**
 * Join game as O
 */
function joinGame(chatId, playerO) {
  const game = games.get(chatId);
  if (!game) return null;

  game.playerO = playerO;
  game.status = 'playing';

  return game;
}

/**
 * Get game
 */
function getGame(chatId) {
  return games.get(chatId);
}

/**
 * Make move
 */
function makeMove(chatId, player, index) {
  const game = games.get(chatId);
  if (!game || game.status !== 'playing') return { error: 'No active game' };

  if (game.turn !== player) return { error: 'Not your turn' };
  if (game.board[index] !== null) return { error: 'Cell already taken' };

  const symbol = player === game.playerX ? 'X' : 'O';
  game.board[index] = symbol;

  // check winner
  const winner = checkWinner(game.board);
  if (winner) {
    game.status = 'ended';
    game.winner = player;
  } else if (!game.board.includes(null)) {
    game.status = 'ended';
    game.winner = 'draw';
  } else {
    game.turn =
      game.turn === game.playerX ? game.playerO : game.playerX;
  }

  return game;
}

/**
 * Check winner
 */
function checkWinner(board) {
  const wins = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
  ];

  for (let combo of wins) {
    const [a,b,c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

/**
 * Render board (for WhatsApp message)
 */
function renderBoard(board) {
  return `
${board[0] || '1'} | ${board[1] || '2'} | ${board[2] || '3'}
---------
${board[3] || '4'} | ${board[4] || '5'} | ${board[5] || '6'}
---------
${board[6] || '7'} | ${board[7] || '8'} | ${board[8] || '9'}
`;
}

/**
 * Reset game
 */
function resetGame(chatId) {
  games.delete(chatId);
}

module.exports = {
  createGame,
  joinGame,
  getGame,
  makeMove,
  renderBoard,
  resetGame
};
