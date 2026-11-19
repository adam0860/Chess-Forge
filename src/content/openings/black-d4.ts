import type { Opening } from '../types';

export const kingsIndian: Opening = {
  id: 'kings-indian',
  name: 'King’s Indian Defence',
  side: 'b',
  eco: 'E60–E99',
  stage: 4,
  tagline: 'Give White the centre, then storm the king.',
  character: 'Dynamic, attacking, double-edged',
  overview: [
    'In the King’s Indian, Black fianchettoes the king’s bishop and lets White build a big centre with c4, d4 and e4. Then Black strikes with …e5 and, once the centre locks, launches a kingside pawn storm with …f5, …f4 and …g5.',
    'It was the favourite of Fischer and Kasparov. The games are sharp races: White attacks on the queenside, Black goes for mate on the kingside.',
  ],
  whenToPlay: 'When you want to play for a win against 1.d4 and enjoy attacking chess.',
  goals: {
    white: ['Use the space advantage, especially on the queenside with c5.', 'Keep the centre stable.', 'Break through before Black’s kingside attack arrives.'],
    black: ['Strike at the centre with …e5.', 'After d5, attack with …f5–f4 and …g5–g4.', 'Use the g7 bishop and knights for a mating attack.'],
  },
  plans: [
    'Mar del Plata: …Ne7, …Nd7 (or …Ne8), …f5, …f4, …g5, …Rf6–h6.',
    'If White does not close the centre, keep the tension and use the g7 bishop.',
    'Know the race: count tempi on both wings.',
  ],
  mainLine: {
    name: 'Classical, Mar del Plata',
    line: `1. d4 {White takes the centre.}
    Nf6 {Flexible development.}
    2. c4 {White grabs more space.}
    g6 {Black prepares the fianchetto.}
    3. Nc3 {White develops and prepares e4.}
    Bg7 {The King’s Indian bishop.}
    4. e4 {White builds a huge centre.}
    d6 {Black controls e5 and prepares …e5.}
    5. Nf3 {Classical development.}
    O-O {Black castles.}
    6. Be2 {White prepares to castle.}
    e5 {The key break: Black challenges d4.}
    7. O-O {White castles.}
    Nc6 {Black adds pressure to d4.}
    8. d5 {White closes the centre and gains space.}
    Ne7 {The knight heads for the kingside to support …f5.}
    9. Ne1 {The knight heads for d3 to support c5.}
    Nd7 {Clears the f-pawn for …f5.}
    10. Be3 {Develops and supports the queenside push c4–c5.}
    f5 {Black starts the kingside attack.}
    11. f3 {White supports e4.}
    f4 {Black gains space and locks the e3 bishop’s retreat.}
    12. Bf2 {The bishop retreats.}
    g5 {The pawn storm rolls on. A classic race begins.}`,
  },
  variations: [
    {
      id: 'saemisch',
      name: 'Sämisch (5.f3)',
      from: 8,
      line: `5. f3 {White supports e4 and prepares Be3, Qd2 and g4.}
      O-O 6. Be3 e5 7. d5 Nh5 {The knight prepares …f5.}
      8. Qd2 f5 {Black counterattacks in the centre and kingside.}`,
      summary: 'White builds a fortress; Black hits back with …e5 and …f5.',
    },
    {
      id: 'four-pawns',
      name: 'Four Pawns Attack (5.f4)',
      from: 8,
      line: `5. f4 {White builds a massive centre.}
      O-O 6. Nf3 c5 {Black strikes at the over-extended centre at once.}
      7. d5 e6 8. Be2 exd5 9. cxd5 {A Benoni structure with sharp play.}`,
      summary: 'Attack the big centre immediately with …c5.',
    },
    {
      id: 'fianchetto',
      name: 'Fianchetto Variation (3.Nf3 and g3)',
      from: 4,
      line: `3. Nf3 Bg7 4. g3 O-O 5. Bg2 d6 6. O-O Nbd7 7. Nc3 e5 {A quieter game; the g2 bishop blunts Black’s attack.}`,
      summary: 'White fianchettoes too. Black plays …e5 calmly.',
    },
  ],
  traps: [],
  mistakes: [
    {
      title: 'Retreating the knight passively after d5',
      line: `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Nb8 9. Nb5 Na6`,
      explanation: 'After 8.d5 the knight must find a useful square. Going back to b8 or a6 is passive. The correct route is …Ne7, heading for g6 and supporting …f5.',
    },
  ],
  quiz: [
    {
      q: 'After 8.d5, why does Black play …Ne7?',
      line: '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7',
      options: [
        { text: 'The knight heads to the kingside to support …f5.', correct: true, why: 'Yes. With the centre closed, Black attacks on the kingside.' },
        { text: 'To defend the c7 pawn.', why: 'c7 is not under attack. The knight goes to g6 or supports …f5.' },
        { text: 'To trade knights on d5.', why: 'The d5 pawn is protected. The knight heads for the kingside.' },
      ],
    },
    {
      q: 'In closed King’s Indian centres, where does each side attack?',
      options: [
        { text: 'White on the queenside, Black on the kingside.', correct: true, why: 'Right. Each side attacks where its pawns point.' },
        { text: 'Both on the kingside.', why: 'White’s pawns point to the queenside (c4–c5).' },
        { text: 'Both in the centre.', why: 'The centre is locked; play moves to the wings.' },
      ],
    },
  ],
};

export const qgd: Opening = {
  id: 'qgd',
  name: 'Queen’s Gambit Declined',
  side: 'b',
  eco: 'D30–D69',
  stage: 2,
  tagline: 'Hold d5, develop, and equalise.',
  character: 'Solid, classical',
  overview: [
    'The Queen’s Gambit Declined (2…e6) is one of the most trusted defences in chess. Black supports d5 with a pawn, develops calmly and castles, accepting a slightly cramped position in exchange for a rock-solid structure.',
    'Black’s main task is freeing the position, either with …c5 or …e5, or by trading pieces as in the Tartakower and Lasker variations.',
  ],
  whenToPlay: 'When you want a reliable classical defence to 1.d4 that teaches strategic fundamentals.',
  goals: {
    white: ['Pressure d5 and use the extra space.', 'Play the minority attack in the Exchange Variation.', 'Exploit Black’s passive c8 bishop.'],
    black: ['Keep d5 solid.', 'Free the position with …c5 or …e5, or by trading pieces.', 'Develop the c8 bishop, often via …b6 and …Bb7 or …Be6.'],
  },
  plans: [
    'Tartakower: …h6, …b6, …Bb7 and later …c5.',
    'Lasker: …h6 and …Ne4 to trade pieces.',
    'Against the Exchange, prepare …Ne4 or …Bf5 counterplay.',
  ],
  mainLine: {
    name: 'Tartakower Variation',
    line: `1. d4 {White takes the centre.}
    d5 {Black stops e4.}
    2. c4 {The Queen’s Gambit.}
    e6 {Declined: Black supports d5 with a pawn.}
    3. Nc3 {More pressure on d5.}
    Nf6 {Black defends d5.}
    4. Bg5 {Pins the knight.}
    Be7 {Breaks the pin.}
    5. e3 {Supports d4.}
    O-O {Black castles.}
    6. Nf3 {Develops.}
    h6 {Asks the bishop to decide.}
    7. Bh4 {Keeps the pin.}
    b6 {The Tartakower: the c8 bishop will go to b7.}
    8. cxd5 {White clarifies the centre.}
    Nxd5 {Black recaptures with the knight to trade pieces.}
    9. Bxe7 {White trades bishops.}
    Qxe7 {The queen recaptures.}
    10. Nxd5 {Another trade.}
    exd5 {Now Black’s c8 bishop has a free diagonal.}
    11. Rc1 {White targets the c-file.}
    Be6 {Black develops and supports …c5. A solid, equal position.}`,
  },
  variations: [
    {
      id: 'exchange',
      name: 'Exchange Variation (4.cxd5)',
      from: 6,
      line: `4. cxd5 exd5 5. Bg5 c6 6. e3 Be7 7. Bd3 Nbd7 8. Qc2 O-O 9. Nge2 Re8 {Black prepares …Nf8 and kingside defence.}`,
      summary: 'Expect the minority attack; prepare kingside counterplay.',
    },
    {
      id: 'lasker',
      name: 'Lasker Defence (7…Ne4)',
      from: 13,
      line: `7... Ne4 {The knight forces trades.}
      8. Bxe7 Qxe7 9. Rc1 c6 10. Bd3 Nxc3 11. Rxc3 dxc4 12. Bxc4 Nd7 {Black frees the game; …e5 comes next.}`,
      summary: 'Trade pieces to free the position.',
    },
    {
      id: 'bf4',
      name: 'Bf4 System',
      from: 6,
      line: `4. Nf3 Be7 5. Bf4 {White puts the bishop on a more active square.}
      O-O 6. e3 c5 {Black strikes at d4 at once.}
      7. dxc5 Bxc5 {Open, active play.}`,
      summary: 'Meet Bf4 with an early …c5.',
    },
  ],
  traps: [
    {
      id: 'elephant',
      name: 'Elephant Trap',
      side: 'you',
      line: `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Nbd7 {Sets the trap.}
      5. cxd5 exd5 6. Nxd5 {White grabs a pawn…}
      Nxd5 7. Bxd8 Bb4+ {…and Black wins the queen back with interest.}
      8. Qd2 Bxd2+ 9. Kxd2 Kxd8 {Black is a piece up.}`,
      summary: 'After 4…Nbd7, Nxd5 fails: the knight was not really pinned.',
    },
  ],
  mistakes: [],
  quiz: [
    {
      q: 'What is the main strategic problem in the QGD for Black?',
      options: [
        { text: 'Freeing the c8 bishop and the slightly cramped position.', correct: true, why: 'Yes. The e6 pawn blocks the bishop, so Black plans …b6, …Be6 or …e5.' },
        { text: 'King safety.', why: 'Black castles early and the king is usually safe.' },
        { text: 'A weak d5 pawn from move one.', why: 'd5 is well supported; the c8 bishop is the issue.' },
      ],
    },
    {
      q: 'In the Tartakower, why does Black play …b6?',
      line: '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 b6',
      options: [
        { text: 'To develop the c8 bishop on b7.', correct: true, why: 'Right. It solves the bad-bishop problem.' },
        { text: 'To attack the c4 pawn.', why: '…b6 does not attack c4. It prepares …Bb7.' },
        { text: 'To prepare queenside castling.', why: 'Black is already castled short.' },
      ],
    },
  ],
};

export const nimzo: Opening = {
  id: 'nimzo-indian',
  name: 'Nimzo-Indian Defence',
  side: 'b',
  eco: 'E20–E59',
  stage: 3,
  tagline: 'Pin the knight and fight for e4.',
  character: 'Strategic, flexible',
  overview: [
    'The Nimzo-Indian (3…Bb4) pins White’s c3 knight to stop e4. Black is often happy to trade the bishop for the knight, doubling White’s pawns on the c-file.',
    'It is one of the most respected defences in chess, played by nearly every world champion. Black gets flexible play and clear strategic targets.',
  ],
  whenToPlay: 'When you want a principled, strategic defence to 1.d4.',
  goals: {
    white: ['Use the bishop pair after …Bxc3.', 'Build a strong centre with e3, Bd3 and Ne2 or Nf3.', 'Avoid the doubled-pawn weaknesses becoming targets.'],
    black: ['Control e4 with the pin, …b6, …Bb7 or …d5.', 'Give up the bishop for the knight when it damages White’s pawns.', 'Blockade and target the doubled c-pawns.'],
  },
  plans: [
    'Take on c3 and attack the c4 pawn with …Na5, …Ba6 and …Rc8.',
    'Play …c5 and …d5 to fight for the centre.',
    'Close the position where the knights beat White’s bishops.',
  ],
  mainLine: {
    name: 'Rubinstein (4.e3)',
    line: `1. d4 {White takes the centre.}
    Nf6 {Flexible development.}
    2. c4 {More space.}
    e6 {Opens the f8 bishop.}
    3. Nc3 {White prepares e4.}
    Bb4 {The Nimzo-Indian: the pin stops e4.}
    4. e3 {The Rubinstein: solid and flexible.}
    O-O {Black castles.}
    5. Bd3 {Develops toward the kingside.}
    d5 {Black stakes a claim in the centre.}
    6. Nf3 {Develops.}
    c5 {Black hits d4.}
    7. O-O {White castles.}
    Nc6 {More pressure on d4.}
    8. a3 {White asks the bishop to decide.}
    Bxc3 {Black gives up the bishop pair and doubles White’s pawns.}
    9. bxc3 {White recaptures toward the centre.}
    dxc4 {Black wins a tempo on the d3 bishop.}
    10. Bxc4 {The bishop recaptures.}
    Qc7 {Black prepares …e5 to fight for the centre. Balanced.}`,
  },
  variations: [
    {
      id: 'classical',
      name: 'Classical (4.Qc2)',
      from: 6,
      line: `4. Qc2 {The queen recaptures on c3 to avoid doubled pawns.}
      O-O 5. a3 Bxc3+ 6. Qxc3 b6 7. Bg5 Bb7 {Black fights for e4 with the bishop.}`,
      summary: 'White keeps the structure; Black fights for the light squares.',
    },
    {
      id: 'saemisch',
      name: 'Sämisch (4.a3)',
      from: 6,
      line: `4. a3 Bxc3+ 5. bxc3 c5 6. e3 Nc6 7. Bd3 O-O 8. Ne2 b6 {Black targets the c4 pawn.}`,
      summary: 'White accepts doubled pawns at once. Black attacks c4.',
    },
    {
      id: 'kasparov',
      name: 'Kasparov Variation (4.Nf3)',
      from: 6,
      line: `4. Nf3 c5 5. g3 cxd4 6. Nxd4 O-O 7. Bg2 d5 {Open, active play.}`,
      summary: 'A fianchetto system. Black strikes with …c5 and …d5.',
    },
  ],
  traps: [],
  mistakes: [
    {
      title: 'Trading the bishop when it does not damage the pawns',
      line: `1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Qc2 O-O 5. a3 Bxc3+ 6. Qxc3 Ne4 7. Qc2 f5 8. e3`,
      explanation: 'Against 4.Qc2 the bishop trade gives White the bishop pair without doubled pawns. Black must have a clear plan, such as …b6 and …Bb7, to fight for e4.',
    },
  ],
  quiz: [
    {
      q: 'What does 3…Bb4 achieve in the Nimzo-Indian?',
      line: '1. d4 Nf6 2. c4 e6 3. Nc3 Bb4',
      options: [
        { text: 'It pins the knight and stops e4.', correct: true, why: 'Yes. The c3 knight defends e4, and the pin weakens that control.' },
        { text: 'It wins the c3 knight by force.', why: 'Nothing is won; the bishop pins the knight.' },
        { text: 'It prepares queenside castling.', why: 'Black usually castles short.' },
      ],
    },
    {
      q: 'Why is 4.Qc2 popular for White?',
      line: '1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Qc2',
      options: [
        { text: 'After …Bxc3, the queen recaptures and avoids doubled pawns.', correct: true, why: 'Right. White keeps a healthy structure and the bishop pair.' },
        { text: 'It attacks the bishop on b4.', why: 'The queen on c2 does not attack b4.' },
        { text: 'It prepares long castling.', why: 'White usually castles short.' },
      ],
    },
  ],
};

export const slav: Opening = {
  id: 'slav',
  name: 'Slav Defence',
  side: 'b',
  eco: 'D10–D19',
  stage: 3,
  tagline: 'Support d5 and keep the bishop free.',
  character: 'Solid, active',
  overview: [
    'The Slav (2…c6) supports d5 with the c-pawn, leaving the c8 bishop free to develop to f5 or g4. It combines the solidity of the Queen’s Gambit Declined with more active piece play.',
    'In the main line Black takes on c4 and develops the bishop to f5 before White can stop it, reaching a sound and comfortable middlegame.',
  ],
  whenToPlay: 'When you want a solid, low-risk defence to 1.d4 with active pieces.',
  goals: {
    white: ['Win back the c4 pawn and push e4.', 'Use the extra central space.', 'Prevent Black’s bishop from becoming too active.'],
    black: ['Develop the c8 bishop outside the pawn chain.', 'Keep a sound pawn structure.', 'Equalise and look for counterplay with …c5 or …e5.'],
  },
  plans: [
    'After …dxc4, develop with …Bf5, …e6, …Bb4 and castle.',
    'Meet e4 with a bishop retreat and …c5 or …e5 breaks.',
    'In the Exchange Slav, copy White’s development and stay alert.',
  ],
  mainLine: {
    name: 'Main Line, 5.a4 Bf5',
    line: `1. d4 {White takes the centre.}
    d5 {Black stops e4.}
    2. c4 {The Queen’s Gambit.}
    c6 {The Slav: support d5 without blocking the c8 bishop.}
    3. Nf3 {Develops.}
    Nf6 {Develops and defends d5.}
    4. Nc3 {Pressure on d5.}
    dxc4 {Black takes the pawn, planning …b5 if allowed.}
    5. a4 {Stops …b5 so the pawn cannot be held.}
    Bf5 {The bishop develops outside the chain.}
    6. e3 {Prepares Bxc4.}
    e6 {Solid; the f8 bishop is free.}
    7. Bxc4 {White regains the pawn.}
    Bb4 {Black pins the knight and stops e4.}
    8. O-O {White castles.}
    O-O {Black castles.}
    9. Qe2 {Prepares e4.}
    Nbd7 {Black develops and prepares …e5.}
    10. e4 {White grabs the centre.}
    Bg6 {The bishop retreats, still eyeing e4.}
    11. Bd3 {Supports e4.}
    Bh5 {Pins the f3 knight.}
    12. e5 {White gains space.}
    Nd5 {The knight finds a fine central square. A balanced, rich position.}`,
  },
  variations: [
    {
      id: 'exchange',
      name: 'Exchange Slav (3.cxd5)',
      from: 4,
      line: `3. cxd5 cxd5 4. Nc3 Nf6 5. Bf4 Nc6 6. e3 Bf5 {Symmetrical; Black copies and is fine.}`,
      summary: 'Symmetrical and solid. Watch for tactics on the open c-file.',
    },
    {
      id: 'e3',
      name: 'Quiet 4.e3',
      from: 6,
      line: `4. e3 Bf5 {Black develops the bishop before White can stop it.}
      5. Nc3 e6 6. Nh4 Bg6 7. Nxg6 hxg6 {White gets the bishop pair; Black gets the open h-file.}`,
      summary: 'Develop the bishop at once.',
    },
    {
      id: 'meran',
      name: 'Semi-Slav Meran (4…e6)',
      from: 7,
      line: `4... e6 {The Semi-Slav: a solid wall, the bishop stays home for now.}
      5. e3 Nbd7 6. Bd3 dxc4 7. Bxc4 b5 8. Bd3 Bb7 {Black gains queenside space and develops the bishop to b7.}`,
      summary: 'A rich, dynamic alternative.',
    },
  ],
  traps: [],
  mistakes: [
    {
      title: 'Locking the bishop in with an early …e6',
      line: `1. d4 d5 2. c4 c6 3. Nf3 e6 4. Nc3 Nf6 5. e3 Nbd7 6. Bd3`,
      explanation: 'Playing …e6 before …Bf5 turns the Slav into a Semi-Slav, where the c8 bishop is locked in. That is playable, but it gives up the Slav’s main idea.',
    },
  ],
  quiz: [
    {
      q: 'What is the key idea of 2…c6 in the Slav?',
      line: '1. d4 d5 2. c4 c6',
      options: [
        { text: 'Support d5 while keeping the c8 bishop free.', correct: true, why: 'Exactly. Unlike …e6, it does not block the bishop.' },
        { text: 'Prepare …Qa5.', why: 'Not the main idea.' },
        { text: 'Attack the c4 pawn.', why: 'c6 supports d5; it does not attack c4.' },
      ],
    },
    {
      q: 'Why does White play 5.a4?',
      line: '1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4',
      options: [
        { text: 'To stop …b5, so Black cannot keep the c4 pawn.', correct: true, why: 'Right. After a4, …b5 is met by axb5.' },
        { text: 'To prepare Ra3.', why: 'Rook lifts are not the point. It stops …b5.' },
        { text: 'To attack the black king.', why: 'It is a queenside move against …b5.' },
      ],
    },
  ],
};
