import type { Module } from '../types';

const GREEK = 'W: Kg1 Qd1 Ra1 Rf1 Bc1 Bd3 Nf3 Nc3 a2 b2 c2 d4 e5 f2 g2 h2; B: Kg8 Qd8 Ra8 Rf8 Bc8 Bb4 Nd7 Nc6 a7 b7 c7 d5 e6 f7 g7 h7; w';

export const m5: Module = {
  id: 'm5',
  num: 5,
  title: 'Calculation and Visualisation',
  stage: 3,
  icon: 'B',
  blurb: 'A reliable method for finding moves: candidate moves, forcing lines, counting, and the blunder check.',
  lessons: [
    {
      id: 'm5-cct',
      title: 'Checks, captures, threats',
      summary: 'Look at the forcing moves first.',
      minutes: 6,
      steps: [
        {
          kind: 'text',
          title: 'Forcing moves',
          body: 'Strong players do not look at every move. They start with the **forcing moves**, because those limit the opponent’s replies:\n\n1. **Checks**: the opponent must respond to them.\n2. **Captures**: they change the material balance.\n3. **Threats**: moves that attack something valuable or threaten mate.\n\nList them for **both sides**, and calculate the most forcing ones first.',
          noBoard: true,
        },
        { kind: 'move', prompt: 'Look at every check and capture. Win by force.', fen: 'W: Kg1 Qe4 Re1 f2 g2 h2; B: Kg8 Re8 Qd7 f7 g7 h7; w', solution: 'Qxe8+ Qxe8 Rxe8#', hint: 'The e8 rook is attacked twice and defended once.', explain: 'Qxe8+ forces …Qxe8, and Rxe8 is back-rank mate. Two attackers beat one defender.' },
        { kind: 'practice', title: 'Forcing-move practice', themes: ['mateIn2', 'sacrifice', 'discoveredAttack'], count: 4 },
      ],
    },
    {
      id: 'm5-count',
      title: 'Counting attackers and defenders',
      summary: 'Can you win that piece? Count first.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Count before you capture',
          body: 'Before capturing on a square, count how many of your pieces **attack** it and how many enemy pieces **defend** it. If you have more attackers than they have defenders, you can usually win the target, as long as you capture with your **cheapest** pieces first.',
          fen: 'W: Kg1 Qd1 Bb3 Nc3 f2 g2 h2; B: Kg8 Qd8 Nf6 d5 f7 g7 h7; w',
          arrows: [{ from: 'c3', to: 'd5', color: 'green' }, { from: 'b3', to: 'd5', color: 'green' }, { from: 'd1', to: 'd5', color: 'green' }, { from: 'f6', to: 'd5', color: 'red' }, { from: 'd8', to: 'd5', color: 'red' }],
        },
        {
          kind: 'quiz',
          prompt: 'White has three attackers on d5 (knight, bishop, queen). Black has two defenders. Can White win the pawn?',
          fen: 'W: Kg1 Qd1 Bb3 Nc3 f2 g2 h2; B: Kg8 Qd8 Nf6 d5 f7 g7 h7; w',
          options: [
            { text: 'Yes: three attackers beat two defenders, starting with the knight.', correct: true, why: 'Nxd5 Nxd5 Bxd5 and Black cannot continue with …Qxd5 because of Qxd5. White wins a pawn.' },
            { text: 'No: the pawn is defended, so it is safe.', why: 'Defended is not enough. Count: three attackers against two defenders.' },
            { text: 'Yes, but only by capturing with the queen first.', why: 'Capture with the cheapest piece first. Qxd5 Qxd5 loses the queen for a pawn.' },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'In an exchange sequence, which piece should usually capture first?',
          noBoard: true,
          options: [
            { text: 'The least valuable attacker.', correct: true, why: 'If the sequence stops early, you have risked the least.' },
            { text: 'The queen, because it is strongest.', why: 'The queen is the worst first capturer: if it is recaptured, you lose the most.' },
            { text: 'It does not matter.', why: 'The order matters a lot.' },
          ],
        },
      ],
    },
    {
      id: 'm5-blunder',
      title: 'The blunder check',
      summary: 'Before you move, ask what your opponent wants.',
      minutes: 6,
      steps: [
        {
          kind: 'text',
          title: 'Three questions',
          body: 'Before every move, run a quick **blunder check**:\n\n1. What does my opponent’s **last move** threaten?\n2. After my move, which of my pieces are **undefended** or attacked?\n3. What are my opponent’s **checks and captures** after my move?\n\nThis takes ten seconds and prevents most lost games.',
          noBoard: true,
        },
        { kind: 'move', prompt: 'Black threatens **…Qxh2#**. Stop the threat.', fen: 'W: Kg1 Qd1 Re1 Nd2 a2 b2 c2 f2 g2 h2; B: Kg8 Qh4 Bd6 a7 b7 c7 f7 g7 h6; w', solution: 'Nf3|Nf1|g3|h3', hint: 'Cover h2, or block the line, or attack the queen.', explain: 'Nf3 is best: it defends h2 and attacks the queen at the same time.' },
        {
          kind: 'quiz',
          prompt: 'Black has just played …Nd4. What is the trap if White grabs e5?',
          setup: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4',
          options: [
            { text: '4.Nxe5 Qg5! hits the knight and g2, with a mating attack.', correct: true, why: 'This is the Blackburne Shilling trap. White should play 4.Nxd4 or 4.O-O.' },
            { text: 'There is no trap; White simply wins a pawn.', why: 'After 4.Nxe5 Qg5 Black wins material or mates.' },
            { text: 'Black threatens …Nxf3+ winning the queen.', why: '…Nxf3+ gxf3 just trades knights. The trap is …Qg5 after Nxe5.' },
          ],
        },
      ],
    },
    {
      id: 'm5-visualise',
      title: 'Seeing ahead',
      summary: 'Calculate three moves deep without moving pieces.',
      minutes: 7,
      steps: [
        {
          kind: 'text',
          title: 'Visualisation',
          body: 'Calculation means moving pieces **in your head**. To train it:\n\n- Name each move to yourself as you visualise it.\n- At the end of a line, stop and **picture the whole board**: where is every piece now?\n- Check whether a captured piece is really gone in your mental picture.\n\nThe longer puzzles below need 2–4 moves of exact calculation. Try to see the full line before you touch a piece.',
          noBoard: true,
        },
        { kind: 'practice', title: 'Longer combinations', themes: ['long', 'mateIn3', 'mateIn4'], count: 4 },
      ],
    },
    {
      id: 'm5-checkpoint',
      title: 'Checkpoint: Calculation',
      summary: 'Forcing lines and blunder checks.',
      minutes: 7,
      checkpoint: true,
      steps: [
        { kind: 'move', prompt: 'Win by force.', fen: 'W: Kg1 Qe4 Re1 f2 g2 h2; B: Kg8 Re8 Qd7 f7 g7 h7; w', solution: 'Qxe8+ Qxe8 Rxe8#', hint: 'Count attackers on e8.', explain: 'The double attack on e8 ends in back-rank mate.' },
        { kind: 'move', prompt: 'Defend against the mate threat.', fen: 'W: Kg1 Qd1 Re1 Nd2 a2 b2 c2 f2 g2 h2; B: Kg8 Qh4 Bd6 a7 b7 c7 f7 g7 h6; w', solution: 'Nf3|Nf1|g3|h3', hint: 'h2 is attacked twice.', explain: 'Nf3 defends h2 and gains time on the queen.' },
        { kind: 'practice', title: 'Mixed calculation', themes: ['mateIn2', 'long', 'sacrifice', 'fork'], count: 5 },
      ],
    },
  ],
};

export const m6: Module = {
  id: 'm6',
  num: 6,
  title: 'Pawn Structure',
  stage: 3,
  icon: 'P',
  blurb: 'Passed, isolated, doubled and backward pawns, pawn chains and majorities: the skeleton of every position.',
  lessons: [
    {
      id: 'm6-passed',
      title: 'Passed pawns',
      summary: 'A pawn with no enemy pawns in its way.',
      minutes: 6,
      steps: [
        {
          kind: 'text',
          title: 'Passed pawns must be pushed',
          body: 'A **passed pawn** has no enemy pawns in front of it or on the neighbouring files. Nothing but pieces can stop it, so it ties down your opponent.\n\nA passed pawn grows stronger as it advances, and it is strongest when **supported** by its own king or pieces.',
          fen: 'W: Kg1 d5 f2 g2 h2; B: Kg8 f7 g7 h7; w',
          highlights: ['d5', 'd6', 'd7', 'd8'],
        },
        { kind: 'move', prompt: 'Create a passed pawn by force. The kings are too far away to help.', fen: 'W: Kh1 a5 b5 c5; B: Kh8 a7 b7 c7; w', solution: 'b6', hint: 'Sacrifice the middle pawn.', explain: 'After 1.b6, if …axb6 then 2.c6! and if …cxb6 then 2.a6!. One white pawn always gets through.' },
        {
          kind: 'quiz',
          prompt: 'Black to move. Can the king catch the a-pawn? (Use the rule of the square.)',
          fen: 'W: Kh1 a4; B: Kf4; b',
          options: [
            { text: 'Yes: the king steps into the square a4–e4–e8–a8.', correct: true, why: 'Draw a square from the pawn to the promotion rank. If the king can step inside it, it catches the pawn. …Ke5 does it.' },
            { text: 'No: the pawn is too fast.', why: 'With Black to move, …Ke5 enters the square and the king catches the pawn.' },
            { text: 'Only if White blunders.', why: 'It is a simple geometric fact: the king can enter the square.' },
          ],
        },
      ],
    },
    {
      id: 'm6-isolated',
      title: 'The isolated pawn',
      summary: 'Strength in the middlegame, weakness in the endgame.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'The isolated queen’s pawn',
          body: 'An **isolated pawn** has no friendly pawns on the neighbouring files, so no pawn can ever defend it.\n\nThe most common is the **isolated d-pawn**. In the middlegame it gives space, open files and outposts on e5 and c5. In the endgame it is a target. The side **against** it wants to **blockade** the square in front of it, usually with a knight, and trade pieces.',
          fen: 'W: Kg1 a2 b2 d4 f2 g2 h2; B: Kg8 a7 b7 e6 f7 g7 h7; w',
          highlights: ['d4', 'd5'],
        },
        {
          kind: 'quiz',
          prompt: 'You play against the isolated d4 pawn. Where does your knight belong?',
          fen: 'W: Kg1 a2 b2 d4 f2 g2 h2; B: Kg8 a7 b7 e6 f7 g7 h7; b',
          options: [
            { text: 'On d5, blockading the pawn.', correct: true, why: 'A knight on d5 cannot be attacked by pawns, stops the pawn and controls key squares.' },
            { text: 'On a6, out of the way.', why: 'A knight on the rim does nothing. Blockade on d5.' },
            { text: 'On h5, near the king.', why: 'The battle is about d5.' },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Which plan suits the side **with** the isolated pawn?',
          noBoard: true,
          options: [
            { text: 'Active piece play and attack before the endgame.', correct: true, why: 'Use the space and open lines; avoid simplifying into an endgame.' },
            { text: 'Trade all the pieces quickly.', why: 'That helps the opponent: the pawn becomes a pure weakness.' },
            { text: 'Push the pawn as early as possible regardless.', why: 'The d4–d5 break is a weapon, but only when it works tactically.' },
          ],
        },
      ],
    },
    {
      id: 'm6-weak',
      title: 'Doubled and backward pawns',
      summary: 'How structural weaknesses become targets.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Doubled pawns',
          body: '**Doubled pawns** stand on the same file. They cannot protect each other, and the front one blocks the back one. They are often a long-term weakness, but they can also open a file for your rooks or control important squares.',
          fen: 'W: Kg1 a2 b2 c3 c2 f2 g2 h2; B: Kg8 a7 b7 c7 f7 g7 h7; w',
          highlights: ['c2', 'c3'],
        },
        {
          kind: 'text',
          title: 'Backward pawns',
          body: 'A **backward pawn** has fallen behind its neighbours and cannot advance safely, because the square in front of it is controlled by enemy pawns. It sits on a half-open file where it is easy to attack, and the square in front of it is an ideal **outpost** for the opponent.',
          fen: 'W: Kg1 c4 e4 f2 g2 h2; B: Kg8 d6 e5 f7 g7 h7; w',
          highlights: ['d6', 'd5'],
        },
        {
          kind: 'quiz',
          prompt: 'Black’s d6 pawn is backward. What should White aim for?',
          fen: 'W: Kg1 c4 e4 f2 g2 h2; B: Kg8 d6 e5 f7 g7 h7; w',
          options: [
            { text: 'Put a piece on d5 and pile up on the d-file.', correct: true, why: 'd5 is a permanent outpost, and the d6 pawn is a fixed target.' },
            { text: 'Push c5 at once to trade it.', why: 'Trading frees Black. Keep the weakness and target it.' },
            { text: 'Attack on the queenside with a4.', why: 'The weakness is on d6. Play where the target is.' },
          ],
        },
      ],
    },
    {
      id: 'm6-chains',
      title: 'Pawn chains',
      summary: 'Attack the chain at its base.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Chains and levers',
          body: 'A **pawn chain** is a diagonal line of pawns, each protecting the next. The front pawn is the **head**, the back pawn is the **base**.\n\nNimzowitsch’s rule: **attack a chain at its base**. If the base falls, the whole chain is weakened. Also, play on the side where your pawns point: they give you space there.',
          fen: 'W: Kg1 b2 c3 d4 e5 f2 g2 h2; B: Kg8 a7 b7 d5 e6 f7 g7 h7; b',
          arrows: [{ from: 'c7', to: 'c5', color: 'green' }],
          highlights: ['d4', 'e5'],
        },
        {
          kind: 'quiz',
          prompt: 'In this French Advance structure, which pawn break should Black prepare first?',
          fen: 'W: Kg1 b2 c3 d4 e5 f2 g2 h2; B: Kg8 a7 b7 c7 d5 e6 f7 g7 h7; b',
          options: [
            { text: '…c5, attacking the base of the chain on d4.', correct: true, why: 'Exactly: the base d4 is the key target.' },
            { text: '…g5, attacking nothing.', why: 'That only weakens Black’s king.' },
            { text: '…a5, gaining queenside space.', why: 'Useful later, but …c5 attacks the chain directly.' },
          ],
        },
      ],
    },
    {
      id: 'm6-majority',
      title: 'Pawn majorities',
      summary: 'Turn an extra pawn on one wing into a passed pawn.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Majorities and outside passed pawns',
          body: 'If you have more pawns than your opponent on one side of the board, you have a **majority** there. Advancing it creates a passed pawn.\n\nA queenside majority is often valuable in the endgame because the passed pawn it creates is an **outside passed pawn**, far from the kings. It drags the enemy king away, and your king invades the other side.',
          fen: 'W: Kg1 a2 b2 c2 f2 g2 h2; B: Kg8 a7 b7 f7 g7 h7; w',
          highlights: ['a2', 'b2', 'c2'],
        },
        {
          kind: 'quiz',
          prompt: 'White has three pawns against two on the queenside. What is the plan?',
          fen: 'W: Kg1 a2 b2 c2 f2 g2 h2; B: Kg8 a7 b7 f7 g7 h7; w',
          options: [
            { text: 'Advance the majority to create a passed pawn.', correct: true, why: 'Push the candidate pawn (usually the one without an opponent in front) supported by the others.' },
            { text: 'Advance the kingside pawns.', why: 'The kingside is even: the extra pawn is on the queenside.' },
            { text: 'Keep all pawns back for safety.', why: 'A majority only matters if you use it.' },
          ],
        },
      ],
    },
    {
      id: 'm6-checkpoint',
      title: 'Checkpoint: Pawn structure',
      summary: 'Structures and breakthroughs.',
      minutes: 5,
      checkpoint: true,
      steps: [
        { kind: 'move', prompt: 'Break through and promote a pawn.', fen: 'W: Ka1 f5 g5 h5; B: Ka8 f7 g7 h7; w', solution: 'g6', hint: 'The same idea as on the queenside: sacrifice the middle pawn.', explain: 'g6! and after either capture, the other wing pawn advances and one pawn queens.' },
        {
          kind: 'quiz',
          prompt: 'Where should you attack a pawn chain?',
          noBoard: true,
          options: [
            { text: 'At its base.', correct: true, why: 'The base is the only pawn not protected by another pawn.' },
            { text: 'At its head.', why: 'The head is protected by the pawn behind it.' },
            { text: 'In the middle.', why: 'Pawns in a chain protect each other; the base is the weak point.' },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'What is the best piece to blockade a passed or isolated pawn?',
          noBoard: true,
          options: [
            { text: 'A knight.', correct: true, why: 'A knight blockades well and still attacks squares from there.' },
            { text: 'The queen.', why: 'The queen is too valuable and can be chased away.' },
            { text: 'The king, always.', why: 'In the endgame the king can blockade, but in the middlegame a knight is ideal.' },
          ],
        },
      ],
    },
  ],
};

export const m7: Module = {
  id: 'm7',
  num: 7,
  title: 'Piece Activity and Strategy',
  stage: 3,
  icon: 'R',
  blurb: 'Outposts, open files, good and bad bishops, space and prophylaxis: how to make your pieces better than your opponent’s.',
  lessons: [
    {
      id: 'm7-outposts',
      title: 'Outposts',
      summary: 'Squares where your pieces can never be chased away.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'A knight on an outpost',
          body: 'An **outpost** is a square in or near the enemy camp that **cannot be attacked by enemy pawns**, ideally supported by your own pawn. A knight on an outpost can be a monster: it attacks deep into the position and cannot be removed except by trading a piece for it.',
          fen: 'W: Kg1 Nd5 c4 e4 f2 g2 h2; B: Kg8 d6 e5 f7 g7 h7 a7 b7; w',
          highlights: ['d5'],
        },
        {
          kind: 'quiz',
          prompt: 'Which square is a perfect outpost for White’s knight?',
          fen: 'W: Kg1 Nf3 c4 e4 f2 g2 h2; B: Kg8 d6 e5 f7 g7 h7 a7 b7; w',
          options: [
            { text: 'd5', correct: true, why: 'No black pawn can attack d5, and the c4 and e4 pawns support it.' },
            { text: 'g5', why: '…h6 or …f6 can chase a knight from g5.' },
            { text: 'h4', why: 'A knight on the rim is far from the action.' },
          ],
        },
      ],
    },
    {
      id: 'm7-files',
      title: 'Open files and rooks',
      summary: 'Rooks belong on open files.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Rooks need open lines',
          body: 'An **open file** has no pawns on it. A **half-open** file has only an enemy pawn. Rooks are strongest on open files, where they can invade the seventh rank (the opponent’s second rank). **Doubling rooks** on an open file makes them even stronger.',
          fen: 'W: Kg1 Rd1 Rf1 a2 b2 c3 f2 g2 h2; B: Kg8 Rc8 Rf8 a7 b7 f7 g7 h7; w',
          highlights: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
        },
        {
          kind: 'quiz',
          prompt: 'Where should White put the f1 rook?',
          fen: 'W: Kg1 Rd1 Rf1 a2 b2 c3 f2 g2 h2; B: Kg8 Rc8 Rf8 a7 b7 f7 g7 h7; w',
          options: [
            { text: 'e1 or d2, to control the open files.', correct: true, why: 'The d- and e-files are open. Rooks belong there.' },
            { text: 'Leave it on f1 behind the pawns.', why: 'A rook behind its own pawn does little.' },
            { text: 'c1, behind the c3 pawn.', why: 'The c-file is blocked by White’s own pawn.' },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Why is a rook on the seventh rank so strong?',
          noBoard: true,
          options: [
            { text: 'It attacks pawns from the side and traps the king on the back rank.', correct: true, why: 'Pawns are often still on their starting squares, and the king can get boxed in.' },
            { text: 'It cannot be captured there.', why: 'It can be captured; it is strong because of what it attacks.' },
            { text: 'It protects your own king.', why: 'It is an attacking post, not a defensive one.' },
          ],
        },
      ],
    },
    {
      id: 'm7-bishops',
      title: 'Good and bad bishops',
      summary: 'Pawns on the bishop’s colour make it bad.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Good bishop, bad bishop',
          body: 'A **bad bishop** is blocked by its own pawns standing on its colour. A **good bishop** has its pawns on the opposite colour, so its diagonals are open.\n\nThe **bishop pair** (both bishops) is usually an advantage in open positions: together they cover every square.',
          fen: 'W: Kg1 Bc1 Be2 c3 d4 e5 f2 g2 h2; B: Kg8 Bc8 Bd6 d5 e6 f7 g7 h7; w',
          highlights: ['c8', 'd5', 'e6'],
        },
        {
          kind: 'quiz',
          prompt: 'Which black bishop is bad?',
          fen: 'W: Kg1 Bc1 Be2 c3 d4 e5 f2 g2 h2; B: Kg8 Bc8 Be7 d5 e6 f7 g7 h7; w',
          options: [
            { text: 'The c8 bishop, blocked by the pawns on d5 and e6.', correct: true, why: 'Those pawns stand on light squares, the same colour as the c8 bishop.' },
            { text: 'The e7 bishop.', why: 'The dark-squared bishop is not blocked by Black’s light-square pawns.' },
            { text: 'Neither: all bishops are equal.', why: 'Pawn placement makes a big difference.' },
          ],
        },
      ],
    },
    {
      id: 'm7-space',
      title: 'Space and prophylaxis',
      summary: 'Restrict the opponent and stop their plans before they start.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Space',
          body: 'Pawns that have advanced give you **space**: room for your pieces to manoeuvre behind them, while the opponent’s pieces get in each other’s way. The side with less space should look for **trades** and **pawn breaks**.',
          fen: 'W: Kg1 c4 d5 e4 f2 g2 h2; B: Kg8 c7 d6 e5 f7 g7 h7; w',
        },
        {
          kind: 'text',
          title: 'Prophylaxis',
          body: '**Prophylaxis** means asking: *what does my opponent want to do?* and preventing it before it happens. Moves like h3 (stopping …Bg4) or a4 (stopping …b5) are prophylactic. Great players spend as much time on their opponent’s plans as on their own.',
          setup: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3',
          arrows: [{ from: 'c8', to: 'g4', color: 'red' }],
        },
        {
          kind: 'quiz',
          prompt: 'Your opponent has much more space. What should you look for?',
          noBoard: true,
          options: [
            { text: 'Trades and pawn breaks to free your position.', correct: true, why: 'Trades give your remaining pieces room; breaks challenge the space advantage.' },
            { text: 'Keep all pieces on and wait.', why: 'With less space, keeping all pieces makes you more cramped.' },
            { text: 'Advance your king.', why: 'Not in the middlegame.' },
          ],
        },
      ],
    },
    {
      id: 'm7-worst',
      title: 'Improve your worst piece',
      summary: 'A simple question when you do not know what to play.',
      minutes: 4,
      steps: [
        {
          kind: 'text',
          title: 'The worst piece',
          body: 'When there are no tactics and no clear plan, find your **worst piece** and improve it. A knight on the rim, a bishop blocked by pawns, a rook that has not moved: bring it to a better square. Small improvements add up.',
          fen: 'W: Kg1 Na3 Bd3 Rf1 Ra1 a2 b2 c3 d4 f2 g2 h2; B: Kg8 Nf6 Bd6 Rf8 Ra8 a7 b7 c6 d5 f7 g7 h7; w',
          highlights: ['a3'],
        },
        {
          kind: 'quiz',
          prompt: 'Which white piece is the worst, and where should it go?',
          fen: 'W: Kg1 Na3 Bd3 Rf1 Ra1 a2 b2 c3 d4 f2 g2 h2; B: Kg8 Nf6 Bd6 Rf8 Ra8 a7 b7 c6 d5 f7 g7 h7; w',
          options: [
            { text: 'The a3 knight; reroute it via c2 to e3.', correct: true, why: 'It is stuck on the rim. From e3 it eyes d5, f5 and g4.' },
            { text: 'The d3 bishop; trade it at once.', why: 'The bishop is active, aiming at h7.' },
            { text: 'The king; move it to h1.', why: 'The king is fine. The knight on a3 is the problem.' },
          ],
        },
      ],
    },
    {
      id: 'm7-checkpoint',
      title: 'Checkpoint: Strategy',
      summary: 'Positional judgement.',
      minutes: 5,
      checkpoint: true,
      steps: [
        {
          kind: 'quiz',
          prompt: 'What makes a square an outpost?',
          noBoard: true,
          options: [
            { text: 'Enemy pawns can never attack it.', correct: true, why: 'And ideally your own pawn supports it.' },
            { text: 'It is in the centre.', why: 'Central squares are often outposts, but the key is that no pawn can attack it.' },
            { text: 'It is next to the enemy king.', why: 'Location helps, but the definition is about pawn attacks.' },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Where do rooks belong?',
          noBoard: true,
          options: [
            { text: 'On open and half-open files.', correct: true, why: 'They need open lines to be active.' },
            { text: 'In the corners.', why: 'That is where they start, not where they work best.' },
            { text: 'In front of their pawns, on the third rank, always.', why: 'Rook lifts happen, but open files come first.' },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Your pawns are on c4, d5 and e4 (light squares). Which bishop is your bad bishop?',
          noBoard: true,
          options: [
            { text: 'The light-squared bishop.', correct: true, why: 'Your pawns block the light squares it needs.' },
            { text: 'The dark-squared bishop.', why: 'It is free: your pawns are on light squares.' },
            { text: 'Neither.', why: 'Pawns on one colour hamper the bishop of that colour.' },
          ],
        },
      ],
    },
  ],
};

export const m8: Module = {
  id: 'm8',
  num: 8,
  title: 'Middlegame Planning',
  stage: 4,
  icon: 'Q',
  blurb: 'How to choose a plan, attack the castled king, use pawn breaks, and decide when to trade.',
  lessons: [
    {
      id: 'm8-plan',
      title: 'Choosing a plan',
      summary: 'Read the position before you move.',
      minutes: 6,
      steps: [
        {
          kind: 'text',
          title: 'Evaluate, then plan',
          body: 'To find a plan, evaluate the position in this order:\n\n1. **King safety**: is either king exposed?\n2. **Material**: who is ahead?\n3. **Pawn structure**: weaknesses, passed pawns, majorities.\n4. **Piece activity**: who has better pieces? Which piece is worst?\n5. **Space** and **open lines**.\n\nYour plan comes from the imbalances: attack where you are stronger, target their weaknesses, and fix your own worst feature.',
          noBoard: true,
        },
        {
          kind: 'quiz',
          prompt: 'The centre is locked, your pawns point to the kingside and Black has castled there. What is the natural plan?',
          noBoard: true,
          options: [
            { text: 'A kingside attack, often with a pawn storm.', correct: true, why: 'Play on the wing where your pawns point and where the enemy king lives.' },
            { text: 'Open the centre at any cost.', why: 'The centre is locked; play on the wings.' },
            { text: 'Trade queens and aim for a draw.', why: 'That ignores your advantage on the kingside.' },
          ],
        },
      ],
    },
    {
      id: 'm8-greek',
      title: 'The Greek gift',
      summary: 'The classic bishop sacrifice on h7.',
      minutes: 7,
      steps: [
        {
          kind: 'text',
          title: 'Bxh7+!',
          body: 'The **Greek gift** sacrifice Bxh7+ works when:\n\n- White has a bishop on d3 aiming at h7, a knight that can reach **g5**, and a queen that can reach **h5**.\n- Black’s king is castled and **no knight on f6** defends h7.\n- Black cannot easily capture the knight on g5.\n\nAfter Bxh7+ Kxh7 Ng5+, the queen joins with Qh5 and threatens mate.',
          fen: GREEK,
          arrows: [{ from: 'd3', to: 'h7', color: 'red' }, { from: 'f3', to: 'g5', color: 'blue' }, { from: 'd1', to: 'h5', color: 'blue' }],
        },
        { kind: 'move', prompt: 'Play the Greek gift and follow it up.', fen: GREEK, solution: 'Bxh7+ Kxh7 Ng5+ Kg8 Qh5', hint: 'Bishop takes h7 with check, then knight check, then the queen arrives.', explain: 'After Qh5, White threatens Qh7 mate. Black must give up a lot of material to survive.' },
        { kind: 'practice', title: 'Attacking sacrifices', themes: ['sacrifice'], count: 3 },
      ],
    },
    {
      id: 'm8-attack',
      title: 'Attacking the castled king',
      summary: 'Pawn storms, piece lifts and opposite-side castling.',
      minutes: 6,
      steps: [
        {
          kind: 'text',
          title: 'How attacks are built',
          body: 'Attacks need **more attackers than defenders** near the king. Bring pieces first, then open lines.\n\n- **Same-side castling**: open lines with pieces and pawn breaks such as f4–f5, since pushing pawns in front of your own king is risky.\n- **Opposite-side castling**: launch a **pawn storm** against the enemy king; it is a race, so speed matters more than material.\n- **Rook lifts** (Rf3–h3, Re3–g3) bring rooks to the attack.',
          setup: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O Nbd7 11. g4 b5',
          arrows: [{ from: 'g4', to: 'g5', color: 'red' }, { from: 'b5', to: 'b4', color: 'red' }],
        },
        {
          kind: 'quiz',
          prompt: 'Kings are castled on opposite sides. What matters most?',
          noBoard: true,
          options: [
            { text: 'Tempo: whose attack lands first.', correct: true, why: 'Every move counts in a pawn race. A defensive move can lose the race.' },
            { text: 'Keeping every pawn.', why: 'Pawns are often sacrificed to open lines.' },
            { text: 'Trading pieces to be safe.', why: 'Trades help the side whose attack is slower.' },
          ],
        },
        { kind: 'practice', title: 'Mating attacks', themes: ['mateIn2', 'mateIn3'], count: 3 },
      ],
    },
    {
      id: 'm8-breaks',
      title: 'Pawn breaks',
      summary: 'The pawn move that opens the position.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Breaks change everything',
          body: 'A **pawn break** is a pawn advance that attacks an enemy pawn to open lines. In most structures each side has one or two typical breaks: …c5 and …f6 in the French, f4–f5 or c4–c5 in the King’s Indian, b4–b5 in the Queen’s Gambit Exchange.\n\nPrepare a break by putting your pieces behind it first, then strike.',
          fen: 'W: Kg1 b2 c3 d4 e5 f2 g2 h2; B: Kg8 a7 b7 c7 d5 e6 g7 h7; b',
          arrows: [{ from: 'c7', to: 'c5', color: 'green' }],
        },
        {
          kind: 'quiz',
          prompt: 'Why prepare a break before playing it?',
          noBoard: true,
          options: [
            { text: 'So your pieces are ready to use the lines it opens.', correct: true, why: 'A break opens lines for whoever is better developed toward them.' },
            { text: 'Because pawns cannot move twice.', why: 'They can. The issue is piece readiness.' },
            { text: 'Breaks should never be played.', why: 'Breaks are essential; timing is everything.' },
          ],
        },
      ],
    },
    {
      id: 'm8-trades',
      title: 'When to trade',
      summary: 'Good trades and bad trades.',
      minutes: 5,
      steps: [
        {
          kind: 'text',
          title: 'Trading rules of thumb',
          body: '- When you are **ahead in material**, trade pieces (not pawns): simpler positions are easier to win.\n- When you are **cramped**, trade to free your position.\n- When you are **attacking**, avoid trades; the defender wants them.\n- Trade your **bad pieces** for their **good pieces**.\n- Do not trade a piece that is doing an important job.',
          noBoard: true,
        },
        {
          kind: 'quiz',
          prompt: 'You are a knight up. What should you do?',
          noBoard: true,
          options: [
            { text: 'Trade pieces and head for a winning endgame.', correct: true, why: 'Each trade makes your extra piece relatively bigger.' },
            { text: 'Avoid all trades.', why: 'That keeps the position complicated, which helps the side that is behind.' },
            { text: 'Trade all your pawns.', why: 'Keep pawns: without pawns, an extra knight may not be enough to win.' },
          ],
        },
      ],
    },
    {
      id: 'm8-checkpoint',
      title: 'Checkpoint: Middlegame',
      summary: 'Plans and attacks.',
      minutes: 6,
      checkpoint: true,
      steps: [
        { kind: 'move', prompt: 'Find the classic attacking sacrifice and its follow-up.', fen: GREEK, solution: 'Bxh7+ Kxh7 Ng5+ Kg8 Qh5', hint: 'h7 is defended only by the king.', explain: 'The Greek gift: the queen and knight team up against h7.' },
        {
          kind: 'quiz',
          prompt: 'You are attacking the king. Your opponent offers a queen trade. Usually you should…',
          noBoard: true,
          options: [
            { text: 'Avoid it: the queen is your main attacker.', correct: true, why: 'The defender wants trades. Keep attacking pieces on the board.' },
            { text: 'Accept it immediately.', why: 'That ends your attack.' },
            { text: 'Resign.', why: 'Definitely not.' },
          ],
        },
        { kind: 'practice', title: 'Attacking practice', themes: ['sacrifice', 'mateIn2', 'mateIn3'], count: 4 },
      ],
    },
  ],
};
