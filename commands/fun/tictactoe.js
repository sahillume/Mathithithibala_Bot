/**
 * TicTacToe Game - Multiplayer
 * Mathithibala_Bot Pro | Professor Sahil System
 */

const games = new Map();

function createBoard() {
  return ["1","2","3","4","5","6","7","8","9"];
}

function render(board) {
  return `
${board[0]} | ${board[1]} | ${board[2]}
---------
${board[3]} | ${board[4]} | ${board[5]}
---------
${board[6]} | ${board[7]} | ${board[8]}
`;
}

function checkWin(b, p) {
  const win = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return win.some(c => c.every(i => b[i] === p));
}

module.exports = {
  name: "tictactoe",
  aliases: ["ttt"],
  category: "fun",
  description: "Play TicTacToe with someone",
  usage: ".tictactoe @user",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;
      const sender = extra.sender;

      const mention =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      // START GAME
      if (mention && !games.has(chatId)) {
        const board = createBoard();

        games.set(chatId, {
          player1: sender,
          player2: mention,
          turn: sender,
          board
        });

        return sock.sendMessage(chatId, {
          text:
`🎮 *TIC TAC TOE STARTED*

👤 Player 1: @${sender.split("@")[0]} (X)
👤 Player 2: @${mention.split("@")[0]} (O)

${render(board)}

👉 @${sender.split("@")[0]}'s turn
Send number (1-9)`,
          mentions: [sender, mention]
        }, { quoted: msg });
      }

      // PLAY MOVE
      const game = games.get(chatId);
      if (!game) return;

      const move = parseInt(args[0]);

      if (!move || move < 1 || move > 9) return;

      if (game.turn !== sender) {
        return extra.reply("⏳ Not your turn!");
      }

      const index = move - 1;

      if (game.board[index] === "X" || game.board[index] === "O") {
        return extra.reply("❌ Spot already taken!");
      }

      const symbol = sender === game.player1 ? "X" : "O";

      game.board[index] = symbol;

      // CHECK WIN
      if (checkWin(game.board, symbol)) {
        await sock.sendMessage(chatId, {
          text:
`🏆 *GAME OVER*

${render(game.board)}

🎉 Winner: @${sender.split("@")[0]}

🤖 Mathithibala_Bot`,
          mentions: [sender]
        }, { quoted: msg });

        games.delete(chatId);
        return;
      }

      // CHECK DRAW
      if (game.board.every(x => x === "X" || x === "O")) {
        await sock.sendMessage(chatId, {
          text:
`🤝 *DRAW GAME*

${render(game.board)}

No winner!`,
        }, { quoted: msg });

        games.delete(chatId);
        return;
      }

      // SWITCH TURN
      game.turn =
        sender === game.player1 ? game.player2 : game.player1;

      await sock.sendMessage(chatId, {
        text:
`${render(game.board)}

👉 @${game.turn.split("@")[0]}'s turn`,
        mentions: [game.turn]
      }, { quoted: msg });

    } catch (err) {
      console.log("TICTACTOE ERROR:", err);
      extra.reply("❌ Game error occurred.");
    }
  }
};
