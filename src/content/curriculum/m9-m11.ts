import type { Module } from '../types';

const LUCENA = 'W: Kb8 b7 Rd1; B: Ke7 Rc2; w';
const PHILIDOR = 'W: Kd5 e5 Ra7; B: Ke8 Rh6; w';

export const m9: Module = {
  id: 'm9',
  num: 9,
  title: 'Endgames',
  stage: 4,
  icon: 'K',
  blurb: 'King and pawn endings, opposition, the square, Lucena and Philidor, and the principles of rook and bishop endings.',
  lessons: [
    {
      id: 'm9-active-king',
      title: 'The active king',
      summary: 'In the endgame the king becomes a fighting piece.',
      minutes: 4,
      steps: [
        {
          kind: 'text',
          title: 'Centralise the king',
          body: 'With the queens off, there is little danger of mate, so the king becomes a strong piece. Bring it toward the **centre** and toward the pawns. In king and pawn endings, the side with the more active king usually wins.',
          fen: 'W: Ke4 a2 b2 f2 g2 h2; B: Kg8 a7 b7 f7 g7 h7; w',
          arrows: [{ from: 'e4', to: 'd5', color: 'green' }],
        },
        {
          kind: 'quiz',
          prompt: 'Queens have just been traded. Where should your king go?',
          noBoard: true,
          options: [
            { text: 'Toward the centre and the pawns.', correct: true, why: 'An active king attacks pawns and supports your own.' },
            { text: 'Stay in the corner behind pawns.', why: 'That was right in the middlegame; in the endgame it wastes a strong piece.' },
            { text: 'It does not matter.', why: 'King activity is often decisive.' },
          ],
        },
      ],
    },
    {
      id: 'm9-opposition',
      title: 'Opposition',
      summary: 'The key to king and pawn endings.',
      minutes: 6,
      steps: [
        {
          kind: 'text',
          title: 'Taking the opposition',
          body: 'Two kings standing on the same file with one square between them are in **opposition**. The side that does **not** have to move “has the opposition”: the other king must step aside and let it through.\n\nIn king and pawn endings, getting your king in front of your pawn and taking the opposition is usually the winning method.',
          fen: 'W: Ke5 e4; B: Ke7; b',
          highlights: ['e5', 'e7'],
        },
        { kind: 'move', prompt: 'White to move and win. Take the opposition.', fen: 'W: Kd5 e4; B: Ke7; w', solution: 'Ke5', hint: 'Put your king directly in front of Black’s, with one square between them.', explain: 'After Ke5 Black must give way, and White’s king reaches d6 or f6, escorting the pawn home.' },
        {
          kind: 'quiz',
          prompt: 'Who has the opposition matters. Here White is to move. What is the result with best play?',
          fen: 'W: Ke4 e3; B: Ke6; w',
          options: [
            { text: 'A draw: Black keeps the opposition.', correct: true, why: 'White must move and give up the opposition, so Black’s king holds the pawn back. With Black to move instead, White would win.' },
            { text: 'White wins because of the extra pawn.', why: 'Only if White had the opposition. Here White has to move, so Black keeps the opposition and draws.' },
            { text: 'Black wins.', why: 'Black has only a king.' },
          ],
        },
      ],
    },
    {
      id: 'm9-square',
      title: 'The rule of the square',
      summary: 'Can the king catch the pawn?',
      minutes: 4,
      steps: [
        {
          kind: 'text',
          title: 'Draw the square',
          body: 'To know whether a king can catch a passed pawn, imagine a **square** from the pawn to its promotion rank. If the king can step **into** the square on its move, it catches the pawn. Remember: a pawn on its starting square can move two squares, so count from one rank further.',
          fen: 'W: Kh1 a4; B: Kf4; b',
          highlights: ['a4', 'b4', 'c4', 'd4', 'e4', 'a8', 'e8', 'e5', 'e6', 'e7'],
        },
        { kind: 'move', prompt: 'Black to move. Step into the square and catch the pawn.', fen: 'W: Kh1 a4; B: Kf4; b', solution: 'Ke5|Ke4', hint: 'The square runs from a4 to e8.', explain: 'The king enters the square and reaches the pawn in time: a draw.' },
      ],
    },
    {
      id: 'm9-lucena',
      title: 'The Lucena position',
      summary: 'How to win with rook and pawn against rook: build a bridge.',
      minutes: 7,
      steps: [
        {
          kind: 'text',
          title: 'Building a bridge',
          body: 'In the **Lucena position** your pawn is on the seventh rank, your king is in front of it, and the enemy king is cut off. The problem is that your king cannot leave the promotion square without being checked forever.\n\nThe solution is to **build a bridge**: bring your rook to the fourth rank, step out with the king, and when the checks come, block them with the rook.',
          fen: LUCENA,
        },
        {
          kind: 'demo',
          title: 'Bridge building',
          body: 'Follow the classic winning method.',
          fen: LUCENA,
          line: '1. Rd4 {The rook goes to the fourth rank to prepare the bridge.} Rc1 2. Ka7 {The king steps out.} Ra1+ 3. Kb6 Rb1+ 4. Ka6 Ra1+ 5. Kb5 Rb1+ 6. Rb4 {The bridge: the rook blocks the checks, and the pawn will queen.}',
        },
        { kind: 'move', prompt: 'Find the first move of the winning method.', fen: LUCENA, solution: 'Rd4|Rd5', hint: 'Prepare a shield for your king against side and vertical checks.', explain: 'Rd4 builds the bridge on the fourth rank. Rd5 also wins, with the same idea one rank higher.' },
      ],
    },
    {
      id: 'm9-philidor',
      title: 'The Philidor position',
      summary: 'How to draw with rook against rook and pawn.',
      minutes: 6,
      steps: [
        {
          kind: 'text',
          title: 'The third-rank defence',
          body: 'When defending rook and pawn against rook, keep your king in front of the pawn and put your rook on **your third rank** (the sixth rank for Black). This stops the enemy king from advancing.\n\nAs soon as the pawn moves to that rank, the enemy king loses its shelter: swing your rook to the **back of the board** and give checks from behind.',
          fen: PHILIDOR,
          arrows: [{ from: 'h6', to: 'a6', color: 'blue' }],
        },
        {
          kind: 'demo',
          title: 'Checks from behind',
          body: 'Once White pushes e6, Black’s rook goes to the first rank and checks.',
          fen: PHILIDOR,
          line: '1. e6 {The pawn advances, but now White’s king has no shelter.} Rh1 {The rook goes far away to check from behind.} 2. Kd6 Rd1+ 3. Ke5 Re1+ 4. Kf6 Rf1+ {The checks never end. Draw.}',
        },
        {
          kind: 'quiz',
          prompt: 'In the Philidor defence, where does the defending rook stand before the pawn advances?',
          noBoard: true,
          options: [
            { text: 'On its own third rank, stopping the king.', correct: true, why: 'This keeps the attacking king from reaching the sixth rank.' },
            { text: 'On the back rank next to its king.', why: 'Passive defence on the back rank loses.' },
            { text: 'Directly in front of the pawn.', why: 'The king blocks the pawn; the rook holds the third rank.' },
          ],
        },
      ],
    },
    {
      id: 'm9-rooks',
      title: 'Rook endgame principles',
      summary: 'Rooks behind passed pawns, and active rooks.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Tarrasch’s rule',
          body: '**Rooks belong behind passed pawns**, both your own and your opponent’s. Behind your own pawn, the rook supports it more as it advances. Behind the enemy pawn, it attacks it and gains activity as the pawn moves forward.\n\nAlso: an **active rook** is worth a pawn. Do not tie your rook down to passive defence if you can counterattack.',
          fen: 'W: Kg1 Ra1 a5 g2 h2; B: Kg8 Rb8 g7 h7; w',
          arrows: [{ from: 'a1', to: 'a5', color: 'green' }],
        },
        {
          kind: 'quiz',
          prompt: 'You have a passed a-pawn. Where should your rook be?',
          noBoard: true,
          options: [
            { text: 'Behind the pawn, on the a-file.', correct: true, why: 'It supports the pawn all the way, and its range grows as the pawn advances.' },
            { text: 'In front of the pawn.', why: 'A rook in front blocks its own pawn.' },
            { text: 'On the opposite wing.', why: 'Support the passed pawn from behind.' },
          ],
        },
      ],
    },
    {
      id: 'm9-bishops',
      title: 'Bishop endgames',
      summary: 'Opposite colours draw, wrong bishops draw.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Opposite-coloured bishops',
          body: 'With **bishops of opposite colours** and no other pieces, the defender can often blockade on the squares of their own bishop’s colour. Even two extra pawns are frequently not enough to win.\n\nThe **wrong bishop**: with a rook pawn (a- or h-pawn) whose promotion square is the opposite colour from your bishop, a defending king in the corner cannot be driven out. It is a draw.',
          fen: 'W: Kf4 Bd3 e5 f5; B: Ke7 Bb6; w',
        },
        {
          kind: 'quiz',
          prompt: 'You are two pawns down in an opposite-coloured bishop ending. What should you do?',
          noBoard: true,
          options: [
            { text: 'Blockade the pawns on your bishop’s colour.', correct: true, why: 'The enemy bishop can never challenge those squares.' },
            { text: 'Resign.', why: 'These endings are often drawn.' },
            { text: 'Trade bishops.', why: 'Then the pawns run free in a king and pawn ending.' },
          ],
        },
      ],
    },
    {
      id: 'm9-checkpoint',
      title: 'Checkpoint: Endgames',
      summary: 'Technique under test.',
      minutes: 6,
      checkpoint: true,
      steps: [
        { kind: 'move', prompt: 'Take the opposition and win.', fen: 'W: Kd5 e4; B: Ke7; w', solution: 'Ke5', hint: 'Face the black king with one square in between.', explain: 'Ke5 takes the opposition; Black must step aside.' },
        { kind: 'move', prompt: 'Black to move. Catch the pawn.', fen: 'W: Kh1 a4; B: Kf4; b', solution: 'Ke5|Ke4', hint: 'Use the rule of the square.', explain: 'The king steps into the square of the pawn and catches it.' },
        { kind: 'practice', title: 'Endgame puzzles', themes: ['endgame', 'promotion'], count: 4 },
      ],
    },
  ],
};

export const m10: Module = {
  id: 'm10',
  num: 10,
  title: 'Thinking and Time',
  stage: 5,
  icon: 'B',
  blurb: 'A repeatable thinking routine, clock management, and handling the emotional side of competition.',
  lessons: [
    {
      id: 'm10-routine',
      title: 'A thinking routine',
      summary: 'The same five steps, every move.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Five steps',
          body: 'Strong players use a routine so they do not miss things:\n\n1. **Threat check**: what does my opponent’s last move want?\n2. **Forcing moves**: list my checks, captures and threats.\n3. **Plan**: if nothing is forcing, what is my plan? Which piece is worst?\n4. **Candidates**: pick two or three candidate moves and compare them.\n5. **Blunder check**: after my chosen move, what are my opponent’s checks and captures?\n\nUse the full routine in critical positions and a quick version in simple ones.',
          noBoard: true,
        },
        {
          kind: 'quiz',
          prompt: 'What is the first step of every move?',
          noBoard: true,
          options: [
            { text: 'Check what the opponent’s last move threatens.', correct: true, why: 'Ignoring threats loses more games than anything else.' },
            { text: 'Play the move you wanted to play last turn.', why: 'The position may have changed.' },
            { text: 'Look for checkmate only.', why: 'Mate is part of step 2, after the threat check.' },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'How many candidate moves should you usually compare in a critical position?',
          noBoard: true,
          options: [
            { text: 'Two or three.', correct: true, why: 'Enough to avoid tunnel vision, few enough to calculate properly.' },
            { text: 'Every legal move.', why: 'There is not enough time; focus on serious candidates.' },
            { text: 'Just one.', why: 'With only one candidate you never compare and miss better moves.' },
          ],
        },
      ],
    },
    {
      id: 'm10-time',
      title: 'Managing the clock',
      summary: 'Spend time where it matters.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Time is a resource',
          body: '- Play **known opening moves quickly** and save time for the middlegame.\n- Spend the most time at **critical moments**: when the position changes character, when there are tactics, or before irreversible decisions such as trades and pawn breaks.\n- Avoid spending ten minutes on a simple move.\n- In time trouble, **simplify** and play safe moves; do not start complications.\n- With increment, keep a buffer: never let your clock run below what you need for the remaining moves.',
          noBoard: true,
        },
        {
          kind: 'quiz',
          prompt: 'When should you spend the most time?',
          noBoard: true,
          options: [
            { text: 'At critical moments, such as before trades or pawn breaks.', correct: true, why: 'Irreversible decisions deserve your time.' },
            { text: 'On every opening move.', why: 'Known opening moves should be played quickly.' },
            { text: 'Only when you are winning.', why: 'Critical moments happen in every type of position.' },
          ],
        },
      ],
    },
    {
      id: 'm10-mindset',
      title: 'Mindset and tilt',
      summary: 'Stay steady after mistakes and wins.',
      minutes: 4,
      steps: [
        {
          kind: 'text',
          title: 'After a mistake',
          body: 'Everyone blunders. What separates strong players is what happens **next**:\n\n- Accept the new position as it is. Do not play the next move angry.\n- Ask: what is the **best practical try** now? Complicate if you are worse.\n- After a loss, take a break before the next game. **Tilt** (playing emotionally after losses) costs more rating points than any opening.\n- When winning, stay alert: many games are lost by relaxing too early.',
          noBoard: true,
        },
        {
          kind: 'quiz',
          prompt: 'You just blundered a piece. What now?',
          noBoard: true,
          options: [
            { text: 'Take a breath and look for the best practical chances.', correct: true, why: 'Many games are saved by fighting on with a clear head.' },
            { text: 'Resign immediately.', why: 'Opponents make mistakes too. Fight on.' },
            { text: 'Play fast to get it over with.', why: 'That compounds the error.' },
          ],
        },
      ],
    },
    {
      id: 'm10-checkpoint',
      title: 'Checkpoint: Thinking',
      summary: 'Apply the routine.',
      minutes: 5,
      checkpoint: true,
      steps: [
        {
          kind: 'quiz',
          prompt: 'Your opponent just moved a bishop that now points at your king. Your first job is…',
          noBoard: true,
          options: [
            { text: 'Check what it threatens.', correct: true, why: 'Threat check first, every time.' },
            { text: 'Continue your own plan.', why: 'Not before you know whether you are in danger.' },
            { text: 'Trade queens.', why: 'Maybe, but only after checking the threat.' },
          ],
        },
        { kind: 'move', prompt: 'Black threatens mate. Defend.', fen: 'W: Kg1 Qd1 Re1 Nd2 a2 b2 c2 f2 g2 h2; B: Kg8 Qh4 Bd6 a7 b7 c7 f7 g7 h6; w', solution: 'Nf3|Nf1|g3|h3', hint: 'h2 is the target.', explain: 'Nf3 defends h2 and attacks the queen.' },
        { kind: 'practice', title: 'Stay sharp', themes: ['fork', 'pin', 'mateIn2'], count: 4 },
      ],
    },
  ],
};

export const m11: Module = {
  id: 'm11',
  num: 11,
  title: 'Game Review and Repertoire',
  stage: 5,
  icon: 'R',
  blurb: 'Learn from your own games: classify errors, find patterns, and build an opening repertoire that fits you.',
  lessons: [
    {
      id: 'm11-review',
      title: 'How to review a game',
      summary: 'Think first, engine second.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'A review routine',
          body: '1. **Right after the game**, write down the moments you were unsure about and what you were thinking.\n2. **Review without an engine first**: find where the game turned and why.\n3. **Then use the engine** (Chess Forge’s Game Review) to check your conclusions.\n4. **Find the pattern**: was it a missed tactic, a bad plan, time trouble, or an opening gap?\n5. **Turn mistakes into training**: Chess Forge adds your mistakes to your puzzle review queue automatically.',
          noBoard: true,
        },
        {
          kind: 'quiz',
          prompt: 'Why review without the engine first?',
          noBoard: true,
          options: [
            { text: 'To understand your own thinking, not just the right moves.', correct: true, why: 'The engine shows what was best; only you can find why you missed it.' },
            { text: 'Engines are often wrong.', why: 'Engines are very strong tactically. The point is understanding your thought process.' },
            { text: 'It is faster.', why: 'It is slower, and that is why it works.' },
          ],
        },
      ],
    },
    {
      id: 'm11-errors',
      title: 'Inaccuracies, mistakes and blunders',
      summary: 'How Chess Forge grades your moves.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Winning chances',
          body: 'Chess Forge grades each move by how much it lowers your **winning chances**, estimated from the engine evaluation:\n\n- **Best / Good**: little or no loss.\n- **Inaccuracy**: about a 10% drop in winning chances.\n- **Mistake**: about a 20% drop.\n- **Blunder**: 30% or more, often losing material or the game.\n\nA 2-pawn drop matters a lot in an equal position and much less when you are already a queen ahead.',
          noBoard: true,
        },
        {
          kind: 'quiz',
          prompt: 'Why does a 2-pawn drop matter less when you are a queen ahead?',
          noBoard: true,
          options: [
            { text: 'Your winning chances barely change.', correct: true, why: 'You were winning before and you are still winning after.' },
            { text: 'Pawns do not count in winning positions.', why: 'They count, but the result is unlikely to change.' },
            { text: 'Engines ignore pawns when ahead.', why: 'The engine sees them; winning chances stay near 100%.' },
          ],
        },
      ],
    },
    {
      id: 'm11-repertoire',
      title: 'Building your repertoire',
      summary: 'Choose openings that fit your style.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'A repertoire that fits',
          body: 'You need: one opening as **White**, one defence against **1.e4**, and one against **1.d4**. Choose by style:\n\n- **Tactical players**: Italian or King’s Gambit; Sicilian Najdorf; King’s Indian.\n- **Positional players**: Ruy Lopez, Catalan or London; Caro-Kann or French; Queen’s Gambit Declined or Nimzo-Indian.\n- **Busy players**: London; Scandinavian; Slav.\n\nStudy each one in the **Openings** tab, drill it until recall is automatic, then test it in practice games.',
          noBoard: true,
        },
        {
          kind: 'quiz',
          prompt: 'Which set is a complete basic repertoire?',
          noBoard: true,
          options: [
            { text: 'London as White, Caro-Kann vs 1.e4, Slav vs 1.d4.', correct: true, why: 'One White opening and one answer to each main first move.' },
            { text: 'Italian and Ruy Lopez only.', why: 'Both are White openings; you need defences as Black too.' },
            { text: 'Sicilian and French.', why: 'Both answer 1.e4; you still need a White opening and a defence to 1.d4.' },
          ],
        },
      ],
    },
    {
      id: 'm11-checkpoint',
      title: 'Final checkpoint',
      summary: 'Everything together.',
      minutes: 8,
      checkpoint: true,
      steps: [
        { kind: 'practice', title: 'Final mixed test', themes: ['fork', 'pin', 'skewer', 'discoveredAttack', 'mateIn2', 'sacrifice', 'endgame'], count: 8 },
        {
          kind: 'quiz',
          prompt: 'What turns a lost game into improvement?',
          noBoard: true,
          options: [
            { text: 'Reviewing it and training the pattern you missed.', correct: true, why: 'That is exactly what the review queue is for.' },
            { text: 'Playing another game immediately.', why: 'Without review, the same mistakes repeat.' },
            { text: 'Blaming bad luck.', why: 'Chess has no luck. Find the lesson.' },
          ],
        },
      ],
    },
  ],
};
