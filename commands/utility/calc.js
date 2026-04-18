 /**
 * Calculator Command - Safe Math Evaluator
 */

module.exports = {
  name: 'calc',
  aliases: ['calculate', 'math'],
  category: 'utility',
  description: 'Calculate math expressions safely',
  usage: '.calc <expression>',

  async execute(sock, msg, args, extra) {
    try {
      const jid = msg.key.remoteJid;

      if (!args.length) {
        return extra.reply(
`❌ Usage: .calc <expression>

Example:
.calc 5 + 3 * 2`
        );
      }

      const expression = args.join(' ');

      // ✅ Strict safety check (only math allowed)
      if (!/^[0-9+\-*/(). %]+$/.test(expression)) {
        return extra.reply(
          '❌ Only numbers and math symbols allowed (+ - * / % ( ))'
        );
      }

      // 🚀 Safer evaluator (no full eval execution)
      let result;
      try {
        result = Function('"use strict"; return (' + expression + ')')();
      } catch (err) {
        return extra.reply('❌ Invalid math expression.');
      }

      if (result === undefined || isNaN(result)) {
        return extra.reply('❌ Could not calculate this expression.');
      }

      return extra.reply(
`🧮 *Calculator*

📝 Expression:
${expression}

✅ Result:
${result}`
      );

    } catch (error) {
      console.error('Calc error:', error);
      return extra.reply('❌ Error while calculating.');
    }
  }
};
