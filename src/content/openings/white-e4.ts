import type { Opening } from '../types';

export const italian: Opening = {
  id: 'italian',
  name: 'Italian Game',
  side: 'w',
  eco: 'C50–C54',
  stage: 2,
  tagline: 'Aim the bishop at f7 and build the perfect centre.',
  character: 'Open, classical, tactical',
  overview: [
    'The Italian Game is one of the oldest openings in chess. White develops the king’s knight to attack e5 and puts the bishop on c4, where it stares at f7, the weakest square in Black’s camp because only the king defends it.',
    'White’s long-term plan is to play c3 and d4, building a broad pawn centre. Black must decide whether to meet the bishop head-on with …Bc5 (the Giuoco Piano, “quiet game”) or counterattack with …Nf6 (the Two Knights Defense).',
  ],
  whenToPlay: 'A perfect first opening. It teaches fast development, central control and king safety, and it leads to both quiet manoeuvring games and sharp attacks.',
  goals: {
    white: ['Develop quickly and castle early.', 'Prepare d4 with c3 to win the centre.', 'Use the c4 bishop and the f-file to pressure f7.'],
    black: ['Mirror White’s development and castle.', 'Strike back at the centre with …d5 at the right moment.', 'Use the c5 bishop to pressure f2.'],
  },
  plans: [
    'c3 and d4: if Black takes on d4, recapture with the c-pawn to get two pawns in the centre.',
    'If the centre becomes fixed, re-route the knight Nb1–d2–f1–g3 and attack on the kingside.',
    'In quieter lines (5.d3), play slowly: Re1, Bb3, h3, and only then d4.',
  ],
  mainLine: {
    name: 'Giuoco Piano, main line',
    line: `1. e4 {White takes the centre and opens lines for the queen and the f1 bishop.}
    e5 {Black claims an equal share of the centre.}
    2. Nf3 {Develops with a threat: the knight attacks the e5 pawn.}
    Nc6 {The most natural defence; the knight also eyes d4.}
    3. Bc4 {The Italian bishop. It controls d5 and aims straight at f7.}
    Bc5 {The Giuoco Piano: Black copies the idea and aims at f2.}
    4. c3 {Prepares d4. The c3 pawn will support a pawn on d4.}
    Nf6 {Counterattacks e4 and develops toward castling.}
    5. d4 {The key break. White gains space and forces Black to decide how to deal with the tension.}
    exd4 {Black releases the tension; holding e5 with …d6 would let White push d5.}
    6. cxd4 {White now has the ideal centre: pawns on d4 and e4.}
    Bb4+ {The bishop is attacked, so it moves with check to disrupt White’s development.}
    7. Bd2 {Blocks the check calmly and offers to trade bishops.}
    Bxd2+ {Black trades so that the d4 pawn loses a defender.}
    8. Nbxd2 {Recaptures with the knight, keeping control of e4.}
    d5 {The essential counter-strike. Black breaks up the centre before White can play e5.}
    9. exd5 {White accepts an isolated pawn on d4 in exchange for open lines and fast development.}
    Nxd5 {The knight lands on a strong central square.}
    10. Qb3 {Pressure on d5 and b7. White uses the open lines at once.}
    Nce7 {Defends the d5 knight a second time so White cannot win it.}
    11. O-O {White castles; the king is safe and the rook joins the game.}
    O-O {Black does the same.}
    12. Rfe1 {The rook takes the open e-file and eyes the e7 knight.}
    c6 {Black reinforces d5 with a pawn. The position is balanced: White has activity, Black has the healthier structure.}`,
  },
  variations: [
    {
      id: 'two-knights',
      name: 'Two Knights Defense (3…Nf6)',
      from: 5,
      line: `3... Nf6 {Instead of …Bc5, Black counterattacks e4 at once.}
      4. Ng5 {The aggressive try: White attacks f7 twice.}
      d5 {The only good defence: block the bishop’s diagonal.}
      5. exd5 {White wins a tempo on the knight.}
      Na5 {Correct! Black chases the bishop instead of recapturing (5…Nxd5? allows the Fried Liver Attack).}
      6. Bb5+ c6 7. dxc6 bxc6 8. Be2 {White keeps the extra pawn but must give ground.}
      h6 9. Nf3 e4 10. Ne5 {Black has a pawn less but much quicker development. A sharp, fighting position.}`,
      summary: 'Black gives a pawn for rapid development. Sharp and double-edged.',
    },
    {
      id: 'pianissimo',
      name: 'Giuoco Pianissimo (5.d3)',
      from: 8,
      line: `5. d3 {The modern, slower approach. White keeps the e4 pawn solid and builds up quietly.}
      d6 6. O-O O-O 7. Re1 a6 {Black makes a retreat square for the bishop on a7.}
      8. Bb3 Ba7 9. h3 {Prevents …Bg4 pins. White will regroup with Nbd2–f1–g3 and later play d4.}`,
      summary: 'A slow, strategic battle. Popular at every level, including the world’s best.',
    },
    {
      id: 'evans',
      name: 'Evans Gambit (4.b4)',
      from: 6,
      line: `4. b4 {White offers a pawn to deflect the bishop and win time for c3 and d4.}
      Bxb4 5. c3 {Gains a tempo on the bishop.}
      Ba5 6. d4 {The centre opens while Black’s pieces are offside.}
      exd4 7. O-O {White has a lead in development and attacking chances for the pawn.}`,
      summary: 'A romantic gambit: a pawn for a big lead in development.',
    },
  ],
  traps: [
    {
      id: 'fried-liver',
      name: 'Fried Liver Attack',
      side: 'you',
      line: `1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 {A natural recapture, but a mistake.}
      6. Nxf7 {White sacrifices the knight to drag the king out.}
      Kxf7 7. Qf3+ {Check, and the d5 knight is attacked twice.}
      Ke6 8. Nc3 {The king is stuck in the centre and the d5 knight is pinned. White has a crushing attack.}`,
      summary: 'If Black recaptures on d5 with the knight, the sacrifice on f7 leaves the black king in a storm.',
    },
    {
      id: 'blackburne-shilling',
      name: 'Blackburne Shilling Gambit',
      side: 'them',
      line: `1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 {A cheeky move that leaves e5 hanging.}
      4. Nxe5 {Greedy!}
      Qg5 {Attacks the knight and the g2 pawn.}
      5. Nxf7 Qxg2 6. Rf1 Qxe4+ 7. Be2 Nf3# {A smothered checkmate.}`,
      summary: 'Do not grab e5 after 3…Nd4. Play 4.Nxd4 or simply castle, and you are better.',
    },
  ],
  mistakes: [
    {
      title: 'Leaving f2 undefended against …Bc5',
      line: `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. Ng5 O-O 6. Nxf7 Rxf7 7. Bxf7+ Kxf7`,
      explanation: 'Attacking f7 only works when the king is still there. Once Black has castled, Nxf7 just gives up two minor pieces for a rook and a pawn, and the black pieces quickly dominate.',
    },
  ],
  quiz: [
    {
      q: 'Why is f7 a target in the Italian Game?',
      options: [
        { text: 'Only the black king defends it.', correct: true, why: 'Exactly. At the start, f7 is guarded by the king alone, so attacking it with the bishop and knight creates threats.' },
        { text: 'It is the square where Black’s queen lives.', why: 'The queen starts on d8. f7 matters because it is defended only by the king.' },
        { text: 'Pawns on f7 cannot move.', why: 'The f7 pawn can move normally. The point is that only the king protects it.' },
      ],
    },
    {
      q: 'White has played c3. What is the main idea?',
      line: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3',
      options: [
        { text: 'To prepare d4 and build a pawn centre.', correct: true, why: 'Right. After d4, if Black takes, White recaptures with the c-pawn and keeps two central pawns.' },
        { text: 'To open the queen toward a4.', why: 'Qb3 or Qa4 can happen later, but the main purpose is to support d4.' },
        { text: 'To stop …Nd4 forever.', why: 'It does control d4, but the real goal is the d4 advance.' },
      ],
    },
    {
      q: 'In the Two Knights after 4.Ng5 d5 5.exd5, what should Black play?',
      line: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5',
      options: [
        { text: '5…Na5, chasing the bishop.', correct: true, why: 'Correct. Black gives a pawn but gains time and avoids the Fried Liver Attack.' },
        { text: '5…Nxd5, recapturing the pawn.', why: 'This allows 6.Nxf7! Kxf7 7.Qf3+ with a dangerous attack on the exposed king.' },
        { text: '5…Qxd5, recapturing with the queen.', why: 'The queen is exposed and White develops with tempo, for example 6.Nc3.' },
      ],
    },
  ],
  modelGame: {
    title: 'Greco’s attack (Gioachino Greco, 1620)',
    line: `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Nc3 {White offers a pawn instead of trading bishops.}
    Nxe4 8. O-O Nxc3 9. bxc3 Bxc3 {Black greedily takes material.}
    10. Qb3 Bxa1 11. Bxf7+ Kf8 12. Bg5 Ne7 13. Ne5 Bxd4 14. Bg6 d5 15. Qf3+ Bf5 16. Bxf5 Bxe5 17. Be6+ Bf6 18. Bxf6 gxf6 19. Qxf6+ Ke8 20. Qf7# {All of White’s pieces join the attack.}`,
    summary: 'A 400-year-old lesson: when Black grabs pawns in the opening, open lines toward the king punish it.',
  },
};

export const ruyLopez: Opening = {
  id: 'ruy-lopez',
  name: 'Ruy Lopez',
  side: 'w',
  eco: 'C60–C99',
  stage: 3,
  tagline: 'The Spanish torture: slow, deep pressure on e5.',
  character: 'Strategic, rich, long-term',
  overview: [
    'Named after a 16th-century Spanish priest, the Ruy Lopez (or Spanish Game) is the most deeply studied opening in chess. White’s bishop attacks the knight that defends e5, building long-term pressure rather than an immediate threat.',
    'Black usually asks the bishop a question with …a6, and the bishop retreats to a4 and then b3, where it aims at f7 from a safe distance. The resulting positions are rich in plans for both sides.',
  ],
  whenToPlay: 'When you are ready for strategic, manoeuvring chess. It rewards understanding over memorization.',
  goals: {
    white: ['Keep pressure on e5 and play d4 with c3 support.', 'Keep the light-squared bishop on the a2–g8 diagonal.', 'Regroup with Nbd2–f1–g3 and play on the kingside.'],
    black: ['Hold e5 firmly, often with …d6.', 'Gain queenside space with …b5 and …c5.', 'Equalise by trading White’s strong bishop or striking with …d5.'],
  },
  plans: [
    'Build the centre with c3, h3 and d4, then manoeuvre Nbd2–f1–g3.',
    'Keep the bishop on c2 or b3 aiming at the black king.',
    'In closed centres, attack where your pawns point: White on the kingside.',
  ],
  mainLine: {
    name: 'Closed Ruy Lopez, Chigorin',
    line: `1. e4 {Claims the centre and frees the f1 bishop.}
    e5 {Black stakes an equal claim in the centre.}
    2. Nf3 {Develops with an attack on e5.}
    Nc6 {Defends e5 and develops.}
    3. Bb5 {The Spanish bishop pins nothing yet but pressures the knight defending e5.}
    a6 {The Morphy Defence: Black asks the bishop to decide.}
    4. Ba4 {Keeps the pin-like pressure. Taking on c6 is the Exchange Variation.}
    Nf6 {Develops and attacks e4.}
    5. O-O {White can ignore the attack on e4: if …Nxe4, Re1 and d4 win it back.}
    Be7 {The solid Closed Spanish. Black prepares to castle.}
    6. Re1 {Now e4 is really defended, so the threat Bxc6 and Nxe5 is real.}
    b5 {Black drives the bishop away to stop that threat.}
    7. Bb3 {The bishop settles on the a2–g8 diagonal, eyeing f7.}
    d6 {Firmly supports e5 and opens the c8 bishop.}
    8. c3 {Prepares d4 and gives the bishop a retreat square on c2.}
    O-O {Black castles, finishing kingside development.}
    9. h3 {Prevents …Bg4, which would pin the knight and increase pressure on d4.}
    Na5 {The Chigorin idea: trade or drive away the strong bishop.}
    10. Bc2 {The bishop keeps aiming at the kingside from a safe square.}
    c5 {Black gains queenside space and fights for d4.}
    11. d4 {White finally strikes in the centre.}
    Qc7 {Black holds e5 and connects the pieces. A classical, balanced battle.}`,
  },
  variations: [
    {
      id: 'berlin',
      name: 'Berlin Defence (3…Nf6)',
      from: 5,
      line: `3... Nf6 {Black counterattacks e4 immediately.}
      4. O-O Nxe4 5. d4 Nd6 6. Bxc6 dxc6 7. dxe5 Nf5 8. Qxd8+ Kxd8 {The famous Berlin endgame: queens are off early, Black has the bishop pair, White has the better pawns.}`,
      summary: 'A solid drawing weapon at the top level. Black accepts a slightly passive endgame.',
    },
    {
      id: 'exchange',
      name: 'Exchange Variation (4.Bxc6)',
      from: 6,
      line: `4. Bxc6 {White gives up the bishop to damage Black’s pawns.}
      dxc6 5. O-O f6 {Protects e5 calmly.}
      6. d4 exd4 7. Nxd4 {White has a healthy kingside pawn majority for the endgame. Black has the bishop pair.}`,
      summary: 'White aims for an endgame where Black’s doubled c-pawns matter.',
    },
    {
      id: 'marshall',
      name: 'Marshall Attack (8…d5)',
      from: 13,
      line: `7... O-O 8. c3 d5 {Frank Marshall’s gambit: a pawn for a kingside attack.}
      9. exd5 Nxd5 10. Nxe5 Nxe5 11. Rxe5 c6 12. d4 Bd6 13. Re1 Qh4 14. g3 Qh3 {Black’s queen sits next to White’s king. White must defend accurately.}`,
      summary: 'Black sacrifices a pawn for a long-lasting attack. Very theoretical.',
    },
  ],
  traps: [
    {
      id: 'noahs-ark',
      name: 'Noah’s Ark Trap',
      side: 'them',
      line: `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 d6 5. d4 b5 6. Bb3 Nxd4 7. Nxd4 exd4 8. Qxd4 {Looks like White wins a pawn…}
      c5 9. Qd5 Be6 10. Qc6+ Bd7 11. Qd5 c4 {…but the b3 bishop is trapped by Black’s pawns.}`,
      summary: 'With the bishop on b3, beware the pawn chain …c5–c4. After 8.Qxd4?? the bishop is lost.',
    },
  ],
  mistakes: [
    {
      title: 'Winning e5 too early in the Exchange Variation',
      line: `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Bxc6 dxc6 5. Nxe5 Qd4 6. Nf3 Qxe4+ 7. Qe2 Qxe2+ 8. Kxe2`,
      explanation: 'After 4.Bxc6 dxc6 Black is not yet threatening e4, so the pawn on e5 looks free, but 5…Qd4 forks the knight and the e4 pawn and Black wins the pawn back with the bishop pair. Castle first (5.O-O).',
    },
  ],
  quiz: [
    {
      q: 'Why does White play 3.Bb5 in the Ruy Lopez?',
      line: '1. e4 e5 2. Nf3 Nc6 3. Bb5',
      options: [
        { text: 'To pressure the knight that defends e5.', correct: true, why: 'Yes. The threat is not immediate, but White builds long-term pressure on e5.' },
        { text: 'To win the c6 knight by force.', why: 'Bxc6 just trades. The point is the pressure on e5’s defender.' },
        { text: 'To stop Black from castling.', why: 'Black can still castle. The bishop targets the e5 defender.' },
      ],
    },
    {
      q: 'Why is 9.h3 useful?',
      line: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3',
      options: [
        { text: 'It stops …Bg4 pinning the knight before d4.', correct: true, why: 'Right. A pin on f3 would add pressure to d4 and make White’s central plan harder.' },
        { text: 'It starts a pawn storm on the king.', why: 'Not yet. h3 is prophylaxis against …Bg4.' },
        { text: 'It makes room for the queen.', why: 'The queen does not use h3. The move prevents …Bg4.' },
      ],
    },
    {
      q: 'In the Closed Ruy Lopez, where does White usually attack?',
      options: [
        { text: 'On the kingside, with knights on g3 and f5.', correct: true, why: 'Yes. With the centre locked, White’s pieces head for the kingside.' },
        { text: 'On the queenside with a4.', why: 'a4 is a useful lever, but the main attacking zone is the kingside.' },
        { text: 'Down the open d-file.', why: 'The d-file is usually closed in the Closed Spanish.' },
      ],
    },
  ],
};

export const scotch: Opening = {
  id: 'scotch',
  name: 'Scotch Game',
  side: 'w',
  eco: 'C44–C45',
  stage: 2,
  tagline: 'Open the centre at once and play for space.',
  character: 'Open, active, direct',
  overview: [
    'In the Scotch, White strikes in the centre on move three with d4. After Black takes, White recaptures with the knight and has a free, open game with a pawn on e4 against none in the centre.',
    'It is less theoretical than the Ruy Lopez and easier to understand: White develops quickly and uses the extra central space. Garry Kasparov brought it back to top-level chess in the 1990s.',
  ],
  whenToPlay: 'When you like clear, open positions and want to avoid deep Ruy Lopez and Italian theory.',
  goals: {
    white: ['Trade Black’s e5 pawn for White’s d-pawn and keep e4.', 'Develop quickly and castle.', 'Use the space advantage; push e5 when it gains time.'],
    black: ['Hit back at the centre with …d5 when possible.', 'Develop fast, often with …Bc5 or …Nf6.', 'Make use of open lines for active pieces.'],
  },
  plans: [
    'After Nxc6 bxc6, push e5 to drive the knight away and cramp Black.',
    'Support the centre with c4 and develop the bishop on b2 or d3.',
    'If Black plays …Bc5, meet it with Be3 and c3 to keep d4 secure.',
  ],
  mainLine: {
    name: 'Mieses Variation',
    line: `1. e4 {Takes the centre.}
    e5 {Black answers symmetrically.}
    2. Nf3 {Attacks e5.}
    Nc6 {Defends it.}
    3. d4 {The Scotch: White challenges e5 immediately.}
    exd4 {Black takes, as holding e5 is awkward.}
    4. Nxd4 {The knight recaptures and stands in the centre.}
    Nf6 {Black develops and attacks e4.}
    5. Nxc6 {White trades to set up e5 with tempo.}
    bxc6 {Black recaptures toward the centre.}
    6. e5 {Gains space and kicks the knight.}
    Qe7 {Attacks the e5 pawn and lines up on the e-file against the white king.}
    7. Qe2 {Defends e5 and blocks the e-file pressure.}
    Nd5 {The knight finds a good central square.}
    8. c4 {Drives the knight away and grabs more space.}
    Ba6 {Black pins the c4 pawn against the white queen.}
    9. b3 {Supports c4 so White can unpin with Bb2 or g3 and Bg2.}
    g6 {Black prepares …Bg7 to attack e5. Both sides have clear plans.}`,
  },
  variations: [
    {
      id: 'classical',
      name: 'Classical (4…Bc5)',
      from: 7,
      line: `4... Bc5 {Black attacks the d4 knight right away.}
      5. Be3 {Defends d4 and offers a bishop trade.}
      Qf6 {Adds a second attacker on d4.}
      6. c3 {Supports the knight firmly.}
      Nge7 7. Bc4 O-O 8. O-O {Both sides are developed. White has more central space.}`,
      summary: 'Black targets the d4 knight. White keeps it secure with Be3 and c3.',
    },
    {
      id: 'scotch-gambit',
      name: 'Scotch Gambit (4.Bc4)',
      from: 6,
      line: `4. Bc4 {Instead of recapturing, White develops and aims at f7.}
      Nf6 5. e5 d5 {The right answer: counter-attack the bishop.}
      6. Bb5 Ne4 7. Nxd4 {White regains the pawn with an active game.}`,
      summary: 'White delays recapturing to develop with tempo.',
    },
  ],
  traps: [],
  mistakes: [],
  quiz: [
    {
      q: 'What does White gain after 3.d4 exd4 4.Nxd4?',
      line: '1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4',
      options: [
        { text: 'A central pawn on e4 against none in the centre.', correct: true, why: 'Yes. White’s e4 pawn gives extra space and a free game.' },
        { text: 'A material advantage.', why: 'Material is equal: one pawn each was traded.' },
        { text: 'A safer king.', why: 'Both kings are uncastled. The gain is central space.' },
      ],
    },
    {
      q: 'In the Mieses line, why does Black play …Ba6?',
      line: '1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Ba6',
      options: [
        { text: 'To pin the c4 pawn to the white queen.', correct: true, why: 'Exactly. The c4 pawn cannot advance or capture freely while the queen is behind it on the diagonal.' },
        { text: 'To trap White’s queen.', why: 'The queen is not trapped; …Ba6 pins c4.' },
        { text: 'To prepare queenside castling.', why: 'Black usually castles short. …Ba6 is about the pin.' },
      ],
    },
  ],
  modelGame: {
    title: 'The Opera Game (Paul Morphy, Paris 1858)',
    line: `1. e4 e5 2. Nf3 d6 3. d4 {White strikes in the centre, as in the Scotch.}
    Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 {Every move develops with a threat.}
    Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# {A queen sacrifice finishes it.}`,
    summary: 'Morphy develops with tempo, opens lines and finishes with a queen sacrifice. A model of using a lead in development.',
  },
};

export const vienna: Opening = {
  id: 'vienna',
  name: 'Vienna Game',
  side: 'w',
  eco: 'C25–C29',
  stage: 3,
  tagline: 'A flexible knight move with a hidden f4 punch.',
  character: 'Flexible, aggressive',
  overview: [
    'The Vienna Game starts with 2.Nc3 instead of 2.Nf3. The queen’s knight supports e4 and controls d5, while the f-pawn stays free to advance to f4, like a safer King’s Gambit.',
    'White can choose a calm setup with Bc4 and d3, or the sharp Vienna Gambit with an early f4. Many club players are unprepared for it.',
  ],
  whenToPlay: 'When you want attacking chances with 1.e4 e5 but less risk than the King’s Gambit.',
  goals: {
    white: ['Keep f4 available to attack e5.', 'Control d5 with the knight and bishop.', 'Open the f-file for the rook after castling.'],
    black: ['Strike back with …d5 when possible.', 'Develop quickly and castle.', 'Use the e4 square if White’s centre over-extends.'],
  },
  plans: [
    'Vienna Gambit: f4, and after …d5 recapture fxe5 to gain space.',
    'Quiet setup: Bc4, d3, Nf3 or Nge2, then f4 when ready.',
    'Open the f-file and aim pieces at the black king.',
  ],
  mainLine: {
    name: 'Vienna Gambit',
    line: `1. e4 {Takes the centre.}
    e5 {Black does the same.}
    2. Nc3 {Supports e4 and keeps the f-pawn free.}
    Nf6 {Black develops and attacks e4.}
    3. f4 {The Vienna Gambit. White attacks e5 at once.}
    d5 {The best reply: Black opens the centre.}
    4. fxe5 {White gains space and attacks the f6 knight.}
    Nxe4 {The knight jumps to a strong central post.}
    5. Nf3 {Develops and protects the e5 pawn.}
    Be7 {Black prepares to castle.}
    6. d4 {White builds a big centre.}
    O-O {Black castles before opening the position.}
    7. Bd3 {Attacks the e4 knight and aims at h7.}
    f5 {Black supports the knight with a pawn.}
    8. exf6 {White captures en passant to open the f-file.}
    Bxf6 {The bishop recaptures and eyes d4.}
    9. O-O {Both kings are safe. White has active pieces and the f-file.}`,
  },
  variations: [
    {
      id: 'bc4',
      name: 'Quiet Bc4 setup',
      from: 4,
      line: `3. Bc4 {A calm development aiming at f7.}
      Nc6 4. d3 Bb4 5. Nge2 d5 6. exd5 Nxd5 7. O-O {A quieter game; White can still play f4 later.}`,
      summary: 'A safer setup that keeps f4 in reserve.',
    },
    {
      id: 'mieses',
      name: 'Mieses Variation (3.g3)',
      from: 4,
      line: `3. g3 {White fianchettoes the light-squared bishop.}
      d5 4. exd5 Nxd5 5. Bg2 Nxc3 6. bxc3 Bd6 7. Nf3 {The g2 bishop pressures the long diagonal.}`,
      summary: 'A positional approach with the bishop on g2.',
    },
  ],
  traps: [],
  mistakes: [
    {
      title: 'Grabbing the gambit pawn with …exf4',
      line: `1. e4 e5 2. Nc3 Nf6 3. f4 exf4 4. e5 Ng8 5. Nf3 d6 6. d4 dxe5 7. Qe2`,
      explanation: 'After 3…exf4 4.e5 the knight has to retreat to g8 and White gets a big centre and quick development. Black should answer the gambit with 3…d5.',
    },
  ],
  quiz: [
    {
      q: 'Why does White play 2.Nc3 instead of 2.Nf3 in the Vienna?',
      line: '1. e4 e5 2. Nc3',
      options: [
        { text: 'To keep the f-pawn free to advance to f4.', correct: true, why: 'Yes. With the g1 knight still home, f4 can be played without blocking anything.' },
        { text: 'To prepare queenside castling.', why: 'It can, but the main idea is the f4 advance.' },
        { text: 'Because Nf3 is a weak move.', why: 'Nf3 is excellent. The Vienna simply keeps the f-pawn flexible.' },
      ],
    },
    {
      q: 'What is Black’s best answer to the Vienna Gambit 3.f4?',
      line: '1. e4 e5 2. Nc3 Nf6 3. f4',
      options: [
        { text: '3…d5, opening the centre.', correct: true, why: 'Right. The counter-strike in the centre is the principled reply.' },
        { text: '3…exf4, taking the pawn.', why: 'After 4.e5 the knight is kicked and White gets a strong centre.' },
        { text: '3…h6, preparing …g5.', why: 'Too slow. Black must react in the centre.' },
      ],
    },
  ],
};

export const kingsGambit: Opening = {
  id: 'kings-gambit',
  name: 'King’s Gambit',
  side: 'w',
  eco: 'C30–C39',
  stage: 4,
  tagline: 'Give a pawn, open the f-file, and attack.',
  character: 'Romantic, sharp, risky',
  overview: [
    'The King’s Gambit was the main weapon of the romantic era. White offers the f-pawn to deflect e5 and build a big centre with d4, then uses the half-open f-file to attack f7.',
    'It is risky: the white king is exposed too. Accurate play by Black can hold the extra pawn, but in practical games the initiative is very dangerous.',
  ],
  whenToPlay: 'When you want sharp, attacking games and are willing to take risks. Excellent for training calculation.',
  goals: {
    white: ['Build a centre with d4 after the gambit.', 'Recapture on f4 when possible to regain the pawn.', 'Use the f-file and the c4 bishop against f7.'],
    black: ['Keep the extra pawn with …g5 or return it for development.', 'Strike back in the centre with …d5.', 'Use the weakness of White’s king on the e1–h4 diagonal.'],
  },
  plans: [
    'Play Nf3 to stop …Qh4+, then d4 and Bxf4.',
    'Against …g5, undermine with h4.',
    'Castle and pile up on the f-file.',
  ],
  mainLine: {
    name: 'Kieseritzky Gambit',
    line: `1. e4 {Takes the centre.}
    e5 {Black does the same.}
    2. f4 {The King’s Gambit: White offers a pawn to deflect e5.}
    exf4 {Black accepts.}
    3. Nf3 {Develops and stops …Qh4+.}
    g5 {Black protects the f4 pawn.}
    4. h4 {White strikes at the pawn chain before it becomes solid.}
    g4 {Black gains time on the knight.}
    5. Ne5 {The Kieseritzky. The knight jumps to the centre and eyes f7 and g4.}
    Nf6 {Develops and counterattacks e4.}
    6. d4 {White builds the centre and opens the c1 bishop toward f4.}
    d6 {Kicks the knight.}
    7. Nd3 {The knight attacks the f4 pawn.}
    Nxe4 {Black grabs a central pawn.}
    8. Bxf4 {White regains the gambit pawn with open lines and active pieces.}
    Bg7 {The bishop eyes d4 and b2.}
    9. Nc3 {Challenges the e4 knight. Engines rate Black slightly better here, but the position is sharp and practical chances are high.}`,
  },
  variations: [
    {
      id: 'modern',
      name: 'Modern Defence (3…d5)',
      from: 5,
      line: `3... d5 {Black returns the pawn for quick development.}
      4. exd5 Nf6 5. Bb5+ c6 6. dxc6 Nxc6 7. d4 Bd6 {Black has active pieces for the pawn.}`,
      summary: 'The principled reply: give the pawn back and develop.',
    },
    {
      id: 'declined',
      name: 'King’s Gambit Declined (2…Bc5)',
      from: 3,
      line: `2... Bc5 {Black declines and stops White from castling short for now.}
      3. Nf3 d6 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Bd2 {White gets the centre; Black develops easily.}`,
      summary: 'The bishop on c5 makes castling awkward for White.',
    },
    {
      id: 'falkbeer',
      name: 'Falkbeer Countergambit (2…d5)',
      from: 3,
      line: `2... d5 {A counter-strike in the centre.}
      3. exd5 e4 4. d3 Nf6 5. dxe4 Nxe4 6. Nf3 Bc5 7. Qe2 {Sharp play with chances for both sides.}`,
      summary: 'Black fights fire with fire.',
    },
  ],
  traps: [
    {
      id: 'kg-qh4',
      name: 'The …Qh4+ fork',
      side: 'them',
      line: `1. e4 e5 2. f4 Bc5 3. fxe5 {Natural, but a blunder.}
      Qh4+ 4. g3 Qxe4+ {A fork of the king and the h1 rook.}
      5. Qe2 Qxh1 {Black wins a whole rook.}`,
      summary: 'Against 2…Bc5, do not take on e5. The e1–h4 diagonal is open and …Qh4+ forks.',
    },
  ],
  mistakes: [
    {
      title: 'The Allgaier: a knight sacrifice that is too much',
      line: `1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4 g4 5. Ng5 h6 6. Nxf7 Kxf7`,
      explanation: '5.Ng5 leaves the knight stranded, and after …h6 White must sacrifice it on f7. The attack is not enough for a full piece against good defence. 5.Ne5 is the sound move.',
    },
  ],
  quiz: [
    {
      q: 'Why does White play 3.Nf3 after 2…exf4?',
      line: '1. e4 e5 2. f4 exf4 3. Nf3',
      options: [
        { text: 'It stops …Qh4+ and develops.', correct: true, why: 'Yes. The knight covers h4, so the queen check is no longer possible.' },
        { text: 'It attacks the f4 pawn.', why: 'The knight does not attack f4. It controls h4 and e5.' },
        { text: 'It prepares queenside castling.', why: 'The main idea is to stop …Qh4+.' },
      ],
    },
    {
      q: 'What is the point of 4.h4 after 3…g5?',
      line: '1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4',
      options: [
        { text: 'To undermine the pawn chain that defends f4.', correct: true, why: 'Right. If the g5 pawn is removed, the f4 pawn falls too.' },
        { text: 'To prepare Rh3.', why: 'Rook lifts can happen later, but h4 attacks the chain.' },
        { text: 'To make luft for the king.', why: 'The idea is attacking g5, not king safety.' },
      ],
    },
  ],
  modelGame: {
    title: 'The Immortal Game (Anderssen vs Kieseritzky, London 1851)',
    line: `1. e4 e5 2. f4 exf4 3. Bc4 {The Bishop’s Gambit.}
    Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 {White gives both rooks.}
    Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# {Three minor pieces mate the king.}`,
    summary: 'White sacrifices a bishop, both rooks and the queen. Development and activity beat material.',
  },
};
