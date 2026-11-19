import type { Opening } from '../types';

export const najdorf: Opening = {
  id: 'najdorf',
  name: 'Sicilian Najdorf',
  side: 'b',
  eco: 'B90–B99',
  stage: 4,
  tagline: 'The most fighting answer to 1.e4.',
  character: 'Sharp, dynamic, unbalanced',
  overview: [
    'The Sicilian Defence (1…c5) fights for d4 from the flank and creates an unbalanced position from move one. After White opens the centre with d4, Black trades a wing pawn for a central one and gets the half-open c-file.',
    'The Najdorf adds the subtle 5…a6. It stops Nb5 and Bb5, prepares …b5 and keeps Black’s options open for …e5 or …e6. It was the favourite weapon of Fischer and Kasparov.',
  ],
  whenToPlay: 'When you want to play for a win with Black and enjoy sharp, concrete positions.',
  goals: {
    white: ['Use the extra central space and lead in development.', 'Attack the black king, often after castling queenside.', 'Exploit the d5 square if Black plays …e5.'],
    black: ['Counterattack on the queenside with …b5–b4.', 'Use the half-open c-file against c3 and c2.', 'Control d5 so the backward d6 pawn is not a weakness.'],
  },
  plans: [
    'Against the English Attack (Be3, f3, g4), race with …b5–b4 and …Nbd7.',
    'Keep a firm grip on d5 with …Be6 and …Nf6.',
    'Use the c-file with …Rc8 and sometimes the exchange sacrifice …Rxc3.',
  ],
  mainLine: {
    name: 'English Attack',
    line: `1. e4 {White takes the centre.}
    c5 {The Sicilian: Black fights for d4 from the flank and unbalances the game.}
    2. Nf3 {Prepares d4.}
    d6 {Controls e5 and prepares …Nf6 without allowing e5.}
    3. d4 {White opens the centre.}
    cxd4 {Black trades a flank pawn for a central one.}
    4. Nxd4 {White has a lead in development and space.}
    Nf6 {Attacks e4, forcing White to defend it.}
    5. Nc3 {Defends e4 naturally.}
    a6 {The Najdorf move: controls b5 and prepares …b5 and …e5.}
    6. Be3 {The English Attack: White plans f3, Qd2, g4 and long castling.}
    e5 {Black gains central space and kicks the d4 knight.}
    7. Nb3 {The knight retreats, keeping an eye on d4 and a5.}
    Be6 {Controls d5 and prepares …d5 one day.}
    8. f3 {Protects e4 and prepares g4.}
    Be7 {Black develops toward castling.}
    9. Qd2 {Connects for long castling.}
    O-O {Black castles short.}
    10. O-O-O {Opposite-side castling: both sides will attack.}
    Nbd7 {Supports …Nb6 and …d5 ideas.}
    11. g4 {White launches the kingside pawn storm.}
    b5 {Black starts the queenside counterattack.}
    12. g5 {Kicks the f6 knight.}
    b4 {Black kicks the c3 knight. Every tempo counts.}`,
  },
  variations: [
    {
      id: 'bg5',
      name: 'Main Line 6.Bg5',
      from: 10,
      line: `6. Bg5 {Pins the knight and prepares f4.}
      e6 7. f4 Be7 8. Qf3 Qc7 9. O-O-O Nbd7 {Black is solid; White prepares g4–g5.}`,
      summary: 'The classical attacking system. Very sharp.',
    },
    {
      id: 'be2',
      name: 'Opočenský (6.Be2)',
      from: 10,
      line: `6. Be2 {A quieter approach.}
      e5 7. Nb3 Be7 8. O-O O-O 9. Be3 Be6 {A positional game around d5.}`,
      summary: 'White plays quietly; Black equalises comfortably with …e5.',
    },
    {
      id: 'alapin',
      name: 'Alapin (2.c3)',
      from: 2,
      line: `2. c3 {White prepares d4 with a pawn recapture.}
      Nf6 {Attacks e4 at once.}
      3. e5 Nd5 4. d4 cxd4 5. Nf3 Nc6 6. cxd4 d6 {Black challenges the e5 pawn.}`,
      summary: 'A common anti-Sicilian. Hit e4 immediately with …Nf6.',
    },
    {
      id: 'moscow',
      name: 'Moscow Variation (3.Bb5+)',
      from: 4,
      line: `3. Bb5+ {A check to avoid the main lines.}
      Bd7 4. Bxd7+ Qxd7 5. O-O Nc6 6. c3 Nf6 {Simple development; Black is fine.}`,
      summary: 'White trades bishops early. Develop and castle.',
    },
  ],
  traps: [],
  mistakes: [
    {
      title: 'Forgetting that the c3 knight defends e4',
      line: `1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 Nxe4 6. Nxe4`,
      explanation: 'The e4 pawn looks loose, but the c3 knight guards it. Taking just loses a piece for a pawn.',
    },
  ],
  quiz: [
    {
      q: 'What is the main purpose of 5…a6 in the Najdorf?',
      line: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6',
      options: [
        { text: 'It controls b5 and prepares …b5 and …e5.', correct: true, why: 'Yes. It keeps White’s pieces off b5 and supports Black’s queenside expansion.' },
        { text: 'It prepares queenside castling.', why: 'Black usually castles short in the Najdorf.' },
        { text: 'It attacks White’s knight.', why: 'a6 attacks nothing; it is a flexible prophylactic move.' },
      ],
    },
    {
      q: 'With opposite-side castling, what matters most?',
      line: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O',
      options: [
        { text: 'Speed: whose pawn storm arrives first.', correct: true, why: 'Exactly. Both sides attack the opposing king, so every tempo counts.' },
        { text: 'Keeping all pieces on the board.', why: 'Piece count matters less than attacking speed here.' },
        { text: 'Trading queens early.', why: 'That kills both attacks. In the race, tempo is king.' },
      ],
    },
    {
      q: 'Why does Black play …Be6 in the English Attack?',
      line: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6',
      options: [
        { text: 'To control d5, the hole created by …e5.', correct: true, why: 'Right. After …e5 the d5 square is weak; the bishop guards it.' },
        { text: 'To attack the b3 knight.', why: 'The bishop on e6 eyes b3 only distantly; its job is d5.' },
        { text: 'To prepare …f5.', why: 'Not here. The bishop controls d5.' },
      ],
    },
  ],
};

export const french: Opening = {
  id: 'french',
  name: 'French Defence',
  side: 'b',
  eco: 'C00–C19',
  stage: 3,
  tagline: 'Solid pawns, counterattack on the centre.',
  character: 'Solid, strategic, counter-punching',
  overview: [
    'With 1…e6 and 2…d5 Black challenges e4 at once. If White pushes e5, the centre locks and Black attacks the white pawn chain at its base with …c5 and sometimes …f6.',
    'The French is famously solid. Its main problem is the light-squared bishop on c8, which is blocked by Black’s own e6 pawn. Good French players know when to trade it or free it.',
  ],
  whenToPlay: 'When you like solid structures and counterattacking chances, and do not mind a slightly cramped position.',
  goals: {
    white: ['Gain space with e5 and attack on the kingside.', 'Keep the d4–e5 pawn chain secure.', 'Exploit Black’s passive c8 bishop.'],
    black: ['Attack the base of White’s pawn chain with …c5.', 'Use …f6 to break the head of the chain.', 'Solve the c8 bishop problem with …b6 and …Ba6 or …Bd7–b5.'],
  },
  plans: [
    'Strike at d4 with …c5, …Nc6 and …Qb6.',
    'Undermine e5 with …f6 once pieces are developed.',
    'Trade the bad bishop when possible.',
  ],
  mainLine: {
    name: 'Classical, Steinitz Variation',
    line: `1. e4 {White takes the centre.}
    e6 {The French: Black prepares …d5.}
    2. d4 {White builds a full centre.}
    d5 {Black challenges e4 at once.}
    3. Nc3 {Defends e4.}
    Nf6 {Attacks e4 again.}
    4. e5 {White pushes, gaining space and kicking the knight.}
    Nfd7 {The knight retreats, ready to attack e5 with …c5 and …f6.}
    5. f4 {White reinforces the e5 pawn with another pawn.}
    c5 {Black hits the base of White’s chain.}
    6. Nf3 {Supports d4 and e5.}
    Nc6 {More pressure on d4.}
    7. Be3 {Defends d4 a third time.}
    cxd4 {Black opens the c-file.}
    8. Nxd4 {White recaptures with the knight.}
    Bc5 {Black develops with pressure on the pinned-looking d4 knight.}
    9. Qd2 {White prepares long castling.}
    O-O {Black castles short.}
    10. O-O-O {Another opposite-castling battle.}
    a6 {Black prepares …b5 and a queenside attack. Rich, double-edged play.}`,
  },
  variations: [
    {
      id: 'advance',
      name: 'Advance Variation (3.e5)',
      from: 4,
      line: `3. e5 {White gains space immediately.}
      c5 {Black attacks the base of the chain at once.}
      4. c3 Nc6 5. Nf3 Qb6 {Black piles up on d4 and eyes b2.}
      6. a3 c4 {Black locks the queenside and fights for the b3 square.}
      7. Nbd2 Na5 {The knight heads for b3.}`,
      summary: 'The classic battle over d4. Pressure the base of the chain.',
    },
    {
      id: 'exchange',
      name: 'Exchange Variation (3.exd5)',
      from: 4,
      line: `3. exd5 {White trades in the centre.}
      exd5 {Now Black’s c8 bishop is free.}
      4. Bd3 Nc6 5. c3 Bd6 {Symmetrical and calm; Black has no problems.}`,
      summary: 'Symmetrical and easy for Black to play.',
    },
    {
      id: 'tarrasch',
      name: 'Tarrasch (3.Nd2)',
      from: 4,
      line: `3. Nd2 {Defends e4 while avoiding the pin …Bb4.}
      c5 4. exd5 Qxd5 5. Ngf3 cxd4 6. Bc4 Qd6 7. O-O Nf6 {The centre is open and Black develops easily. White has a small lead in development.}`,
      summary: 'Black opens the centre with …c5 and gets active pieces.',
    },
    {
      id: 'winawer',
      name: 'Winawer (3…Bb4)',
      from: 5,
      line: `3... Bb4 {Pins the knight that defends e4.}
      4. e5 c5 5. a3 Bxc3+ 6. bxc3 Ne7 {Black has damaged White’s pawns; White has the bishop pair.}`,
      summary: 'Sharp and unbalanced. Doubled pawns for the bishop pair.',
    },
  ],
  traps: [
    {
      id: 'advance-qb6',
      name: 'The …Nxd4 blunder in the Advance',
      side: 'them',
      line: `1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. Bd3 cxd4 7. cxd4 Nxd4 {The d4 pawn looks free…}
      8. Nxd4 Qxd4 9. Bb5+ {…but the bishop check uncovers an attack by the d1 queen on Black’s queen. Black loses the queen.}`,
      summary: 'In the Advance, d4 is often poisoned: a bishop check uncovers the white queen.',
    },
  ],
  mistakes: [],
  quiz: [
    {
      q: 'What is the classic problem piece in the French Defence?',
      options: [
        { text: 'The light-squared bishop on c8.', correct: true, why: 'Yes. The e6 pawn blocks it, so it often stays passive.' },
        { text: 'The king’s knight.', why: 'The knight is fine; it goes to f6 or e7.' },
        { text: 'The queen.', why: 'The queen is active on b6 or g5 in many lines.' },
      ],
    },
    {
      q: 'After 3.e5, where should Black attack?',
      line: '1. e4 e6 2. d4 d5 3. e5',
      options: [
        { text: 'The base of the chain, d4, with …c5.', correct: true, why: 'Correct. Attack a pawn chain at its base.' },
        { text: 'The head of the chain with …g5.', why: 'Black uses …f6 against the head, but …c5 is the first and main lever.' },
        { text: 'The white king with …h5.', why: 'Too slow; strike the centre first.' },
      ],
    },
  ],
};

export const caroKann: Opening = {
  id: 'caro-kann',
  name: 'Caro-Kann Defence',
  side: 'b',
  eco: 'B10–B19',
  stage: 2,
  tagline: 'Rock-solid, with the bishop outside the chain.',
  character: 'Solid, positional',
  overview: [
    'The Caro-Kann (1…c6 and 2…d5) challenges e4 like the French, but the c6 pawn supports d5 without blocking the light-squared bishop. Black can develop it to f5 or g4 before playing …e6.',
    'Black gets a very healthy pawn structure and rarely loses quickly. The trade-off is a little less activity in the early middlegame.',
  ],
  whenToPlay: 'When you want a reliable, solid defence against 1.e4 with clear plans.',
  goals: {
    white: ['Use extra space and quicker development.', 'Kick the f5 bishop with h4 and h5 to gain space.', 'Attack after castling queenside.'],
    black: ['Develop the c8 bishop before …e6.', 'Keep a sound structure and aim for a good endgame.', 'Break with …c5 or …e5 at the right time.'],
  },
  plans: [
    'Bishop to f5 or g4, then …e6, …Nd7, …Ngf6.',
    'Meet h4–h5 by retreating the bishop to h7 and keeping a solid wall.',
    'Free the game with …c5 once developed.',
  ],
  mainLine: {
    name: 'Classical Variation',
    line: `1. e4 {White takes the centre.}
    c6 {The Caro-Kann: prepares …d5 with the c-pawn’s support.}
    2. d4 {White builds a full centre.}
    d5 {Black challenges e4.}
    3. Nc3 {Defends e4.}
    dxe4 {Black releases the tension.}
    4. Nxe4 {The knight recaptures in the centre.}
    Bf5 {The Classical: the bishop develops outside the pawn chain with tempo.}
    5. Ng3 {The knight attacks the bishop.}
    Bg6 {The bishop retreats but stays on the diagonal.}
    6. h4 {White threatens h5 to trap or kick the bishop.}
    h6 {Black gives the bishop a retreat on h7.}
    7. Nf3 {Develops with an eye on e5.}
    Nd7 {Controls e5 so the knight cannot jump there.}
    8. h5 {White gains space on the kingside.}
    Bh7 {The bishop keeps the b1–h7 diagonal.}
    9. Bd3 {Offers a trade of light-squared bishops.}
    Bxd3 {Black accepts.}
    10. Qxd3 {The queen recaptures and prepares long castling.}
    e6 {Now that the bishop is out, Black builds the solid pawn wall.}
    11. Bd2 {Prepares queenside castling.}
    Ngf6 {Black develops the last minor piece.}
    12. O-O-O {White castles long.}
    Be7 {Black will castle short or long. A solid position with a healthy structure.}`,
  },
  variations: [
    {
      id: 'advance',
      name: 'Advance Variation (3.e5)',
      from: 4,
      line: `3. e5 {White gains space.}
      Bf5 {The bishop develops before …e6.}
      4. Nf3 e6 5. Be2 c5 {Black strikes at d4 just like in the French, but with the bishop outside.}
      6. Be3 {White supports d4.}`,
      summary: 'Bishop out first, then …e6 and …c5.',
    },
    {
      id: 'exchange',
      name: 'Exchange Variation (3.exd5)',
      from: 4,
      line: `3. exd5 cxd5 4. Bd3 Nc6 5. c3 Nf6 6. Bf4 Bg4 {Black develops actively; the structure is symmetrical.}`,
      summary: 'Symmetrical. Develop the bishop to g4 or f5.',
    },
    {
      id: 'two-knights',
      name: 'Two Knights (2.Nc3)',
      from: 2,
      line: `2. Nc3 d5 3. Nf3 Bg4 {Pins the knight.}
      4. h3 Bxf3 5. Qxf3 e6 {Black gives up the bishop pair for a solid position.}`,
      summary: 'Pin the knight and play solidly.',
    },
  ],
  traps: [
    {
      id: 'smothered-nd6',
      name: 'The Nd6 smothered mate',
      side: 'them',
      line: `1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 5. Qe2 {A sneaky move: the queen pins the e7 pawn to the king.}
      Ngf6 6. Nd6# {The e7 pawn cannot capture because it is pinned. Smothered mate.}`,
      summary: 'After 4…Nd7 5.Qe2, never play …Ngf6. The e7 pawn is pinned and Nd6 is mate.',
    },
  ],
  mistakes: [],
  quiz: [
    {
      q: 'What is the main advantage of the Caro-Kann over the French?',
      options: [
        { text: 'The c8 bishop can develop before …e6.', correct: true, why: 'Yes. The c6 pawn supports d5 without blocking the bishop.' },
        { text: 'Black gets a faster attack.', why: 'The Caro-Kann is solid rather than fast.' },
        { text: 'It always leads to a draw.', why: 'Not at all. It is solid, but full of play.' },
      ],
    },
    {
      q: 'White played 6.h4. Why does Black reply 6…h6?',
      line: '1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4',
      options: [
        { text: 'To give the g6 bishop a retreat square on h7.', correct: true, why: 'Right. Otherwise h5 would trap or chase the bishop with nowhere good to go.' },
        { text: 'To attack the g3 knight.', why: 'h6 does not attack g3; it secures h7 for the bishop.' },
        { text: 'To prepare …g5.', why: 'Not the idea. It gives the bishop a retreat.' },
      ],
    },
  ],
};

export const petrov: Opening = {
  id: 'petrov',
  name: 'Petrov’s Defence',
  side: 'b',
  eco: 'C42–C43',
  stage: 3,
  tagline: 'Counterattack e4 instead of defending e5.',
  character: 'Solid, symmetrical, precise',
  overview: [
    'In the Petrov (or Russian Game), Black answers 2.Nf3 not by defending e5 but by counterattacking e4 with 2…Nf6. The positions are often symmetrical and very solid.',
    'There is one important rule: after 3.Nxe5, Black must kick the knight with 3…d6 before taking on e4. Copying White’s move with 3…Nxe4? runs into a nasty queen trick.',
  ],
  whenToPlay: 'When you want a reliable, hard-to-crack defence to 1.e4 e5.',
  goals: {
    white: ['Use the extra tempo in a symmetrical position.', 'Gain space with c4 and pressure the e4 knight.', 'Exploit any loose piece in the early skirmish.'],
    black: ['Equalise with accurate development.', 'Keep the knight on e4 active as long as it is useful.', 'Avoid symmetry traps on the e-file.'],
  },
  plans: [
    'After 3.Nxe5 d6 4.Nf3 Nxe4, develop with …d5, …Nc6, …Be7 and castle.',
    'Support the e4 knight with …d5 and …Bf5.',
    'Trade into an equal endgame if White over-presses.',
  ],
  mainLine: {
    name: 'Classical Main Line',
    line: `1. e4 {White takes the centre.}
    e5 {Black does the same.}
    2. Nf3 {Attacks e5.}
    Nf6 {The Petrov: counterattack e4 instead of defending e5.}
    3. Nxe5 {White takes first.}
    d6 {The key move: kick the knight before taking on e4.}
    4. Nf3 {The knight retreats.}
    Nxe4 {Now Black regains the pawn safely.}
    5. d4 {White takes central space.}
    d5 {Black supports the e4 knight.}
    6. Bd3 {Develops with pressure on e4.}
    Nc6 {Black develops and eyes d4.}
    7. O-O {White castles.}
    Be7 {Black prepares to castle.}
    8. c4 {White attacks d5, the support of the e4 knight.}
    Nb4 {The knight hits the d3 bishop.}
    9. Be2 {The bishop retreats, keeping it.}
    O-O {Black castles.}
    10. Nc3 {Develops and challenges the e4 knight.}
    Bf5 {Supports e4.}
    11. a3 {Kicks the b4 knight.}
    Nxc3 {Black trades knights.}
    12. bxc3 {White recaptures toward the centre.}
    Nc6 {The knight returns. A solid, roughly equal position.}`,
  },
  variations: [
    {
      id: 'nc3',
      name: 'Nimzowitsch Attack (5.Nc3)',
      from: 8,
      line: `5. Nc3 {Offers a knight trade that doubles White’s pawns but opens lines.}
      Nxc3 6. dxc3 Be7 7. Be3 Nc6 8. Qd2 Be6 9. O-O-O {White castles long and attacks.}`,
      summary: 'White castles long for an attack. Stay solid.',
    },
    {
      id: 'steinitz',
      name: 'Steinitz (3.d4)',
      from: 4,
      line: `3. d4 {White opens the centre instead of taking on e5.}
      Nxe4 4. Bd3 d5 5. Nxe5 Nd7 6. Nxd7 Bxd7 7. O-O Bd6 {Symmetrical and balanced.}`,
      summary: 'Open, symmetrical play. Develop and castle.',
    },
  ],
  traps: [
    {
      id: 'petrov-copycat',
      name: 'The copycat blunder',
      side: 'them',
      line: `1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nxe4 {Copying White looks natural…}
      4. Qe2 {…but now the e-file is a problem.}
      Nf6 5. Nc6+ {A discovered check! The queen on d8 is lost.}`,
      summary: 'After 3.Nxe5, play 3…d6 first. Taking on e4 at once allows Qe2 and a discovered attack.',
    },
  ],
  mistakes: [
    {
      title: 'Taking on e4 too early (3…Nxe4)',
      line: `1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nxe4 4. Qe2 Qe7 5. Qxe4 d6 6. d4 dxe5 7. dxe5`,
      explanation: 'Even with best defence, 3…Nxe4 4.Qe2 leaves Black a pawn down. The rule is simple: kick the knight with 3…d6 first.',
    },
  ],
  quiz: [
    {
      q: 'After 3.Nxe5, what should Black play?',
      line: '1. e4 e5 2. Nf3 Nf6 3. Nxe5',
      options: [
        { text: '3…d6, kicking the knight first.', correct: true, why: 'Yes. Only after the knight retreats is …Nxe4 safe.' },
        { text: '3…Nxe4, copying White.', why: 'This allows 4.Qe2 with nasty tricks on the e-file.' },
        { text: '3…Qe7, attacking the knight.', why: 'Possible but clumsy; it blocks the bishop. 3…d6 is the main move.' },
      ],
    },
    {
      q: 'What is the spirit of 2…Nf6 in the Petrov?',
      line: '1. e4 e5 2. Nf3 Nf6',
      options: [
        { text: 'Counterattack e4 instead of defending e5.', correct: true, why: 'Right. Black answers a threat with a threat.' },
        { text: 'Defend e5 with the knight.', why: 'The knight on f6 does not defend e5.' },
        { text: 'Prepare …Ng4.', why: 'Not the main idea. Black hits e4.' },
      ],
    },
  ],
};

export const pirc: Opening = {
  id: 'pirc',
  name: 'Pirc Defence',
  side: 'b',
  eco: 'B07–B09',
  stage: 4,
  tagline: 'Let White build a centre, then attack it.',
  character: 'Hypermodern, counterattacking',
  overview: [
    'The Pirc is a hypermodern defence. Black lets White build a broad centre with e4 and d4, then attacks it with the fianchettoed bishop on g7 and pawn breaks like …c5 or …e5.',
    'It is flexible and leads to rich middlegames, but Black must react precisely: if White’s centre advances without resistance, Black can be squeezed.',
  ],
  whenToPlay: 'When you like counterattacking chess and want to avoid main-line theory.',
  goals: {
    white: ['Build a big centre and gain space.', 'Attack with Be3, Qd2, Bh6 and h4–h5.', 'Push e5 to cramp Black.'],
    black: ['Fianchetto the bishop to g7 and hit the centre.', 'Break with …c5, …e5 or …b5.', 'Counterattack before White’s attack lands.'],
  },
  plans: [
    'Against the 150 Attack (Be3, Qd2), expand with …c6 and …b5.',
    'Against the Austrian (f4), strike with …c5.',
    'Keep the g7 bishop; trade it only when it helps.',
  ],
  mainLine: {
    name: '150 Attack, …c6 and …b5',
    line: `1. e4 {White takes the centre.}
    d6 {The Pirc: Black controls e5 quietly.}
    2. d4 {White builds a full centre.}
    Nf6 {Attacks e4.}
    3. Nc3 {Defends e4.}
    g6 {Black prepares …Bg7, aiming at d4.}
    4. Be3 {The 150 Attack: Be3, Qd2, Bh6.}
    Bg7 {The fianchettoed bishop eyes the centre.}
    5. Qd2 {Prepares Bh6 to trade Black’s best piece.}
    c6 {Black prepares …b5 and queenside play.}
    6. f3 {Supports e4 and prepares g4.}
    b5 {Black gains queenside space and may push …b4.}
    7. Nge2 {Develops; the knight can go to c1 or g3.}
    Nbd7 {Black develops and supports …e5 or …c5.}
    8. Bh6 {White offers to trade the g7 bishop.}
    Bxh6 {Black accepts.}
    9. Qxh6 {The queen arrives on h6.}
    Bb7 {Black develops and keeps the king flexible. Both sides have play.}`,
  },
  variations: [
    {
      id: 'austrian',
      name: 'Austrian Attack (4.f4)',
      from: 6,
      line: `4. f4 {White builds a huge centre.}
      Bg7 5. Nf3 O-O 6. Bd3 Na6 {The knight heads for c5 or b4.}
      7. O-O c5 {Black strikes at the centre at once.}`,
      summary: 'White’s most aggressive try. Black must hit back with …c5.',
    },
    {
      id: 'classical',
      name: 'Classical (4.Nf3)',
      from: 6,
      line: `4. Nf3 Bg7 5. Be2 O-O 6. O-O c6 7. a4 {White stops …b5. Black will play …Nbd7 and …e5.}`,
      summary: 'A calm system. Black prepares …e5.',
    },
  ],
  traps: [],
  mistakes: [
    {
      title: 'Castling into the attack',
      line: `1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 O-O 6. Bh6 c6 7. Bxg7 Kxg7 8. h4`,
      explanation: 'Castling short early against the 150 Attack lets White trade the g7 bishop and push h4–h5 with a fast attack. Delay castling and start queenside play first.',
    },
  ],
  quiz: [
    {
      q: 'Why does White play Bh6 against the Pirc?',
      line: '1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6',
      options: [
        { text: 'To trade off Black’s strong g7 bishop.', correct: true, why: 'Yes. Without that bishop, Black’s king and dark squares are weaker.' },
        { text: 'To win a pawn on h7.', why: 'h7 is not attacked. The idea is the bishop trade.' },
        { text: 'To stop Black from castling queenside.', why: 'The idea is to remove the g7 bishop.' },
      ],
    },
    {
      q: 'What does “hypermodern” mean in the Pirc?',
      options: [
        { text: 'Black lets White occupy the centre, then attacks it.', correct: true, why: 'Exactly. The centre is targeted with pieces and pawn breaks.' },
        { text: 'Black never moves the d-pawn.', why: 'Black plays …d6 on move one.' },
        { text: 'Black aims for a quick king attack.', why: 'The Pirc is a counterattacking defence.' },
      ],
    },
  ],
};

export const scandinavian: Opening = {
  id: 'scandinavian',
  name: 'Scandinavian Defence',
  side: 'b',
  eco: 'B01',
  stage: 1,
  tagline: 'Challenge e4 on move one.',
  character: 'Direct, simple, solid',
  overview: [
    'The Scandinavian (1…d5) hits e4 immediately. After 2.exd5 Qxd5 the queen comes out early, which normally breaks an opening rule, but here Black has a plan: after 3.Nc3 the queen goes to a5 or d6, where it is safe and active.',
    'Black gets a simple, solid structure similar to the Caro-Kann with very little theory to learn.',
  ],
  whenToPlay: 'A great first defence to 1.e4: easy to learn and hard for White to avoid.',
  goals: {
    white: ['Gain time by attacking the black queen.', 'Use the lead in development and space.', 'Push d4 and develop quickly.'],
    black: ['Put the queen on a safe square (a5 or d6).', 'Develop the c8 bishop to f5 or g4 before …e6.', 'Build a solid c6–e6 structure.'],
  },
  plans: [
    'Queen to a5, then …Nf6, …Bf5, …c6 and …e6.',
    'Use the …c6 pawn to give the queen a retreat and support the centre.',
    'Castle short or long depending on White’s setup.',
  ],
  mainLine: {
    name: 'Main Line, 3…Qa5',
    line: `1. e4 {White takes the centre.}
    d5 {The Scandinavian: Black challenges e4 at once.}
    2. exd5 {White takes.}
    Qxd5 {Black recaptures with the queen.}
    3. Nc3 {White develops with tempo on the queen.}
    Qa5 {The queen moves to a safe, active square where it pins the c3 knight.}
    4. d4 {White builds the centre.}
    Nf6 {Black develops.}
    5. Nf3 {White develops.}
    Bf5 {The bishop comes out before …e6 locks it in.}
    6. Bd2 {Unpins the knight and may threaten Nd5 tricks.}
    c6 {Gives the queen a retreat on c7 or d8 and controls d5.}
    7. Bc4 {Develops the bishop actively.}
    e6 {The solid Caro-Kann-like structure.}
    8. Qe2 {Prepares long castling or d5 breaks.}
    Bb4 {Black develops and pins the c3 knight.}
    9. O-O-O {White castles long.}
    Nbd7 {Black completes development. A solid position.}`,
  },
  variations: [
    {
      id: 'qd6',
      name: 'Modern Main Line (3…Qd6)',
      from: 5,
      line: `3... Qd6 {The queen stands in the centre, controlling e5 and b4.}
      4. d4 Nf6 5. Nf3 a6 {Prevents Nb5 and Bb5.}
      6. g3 Bg4 7. Bg2 Nc6 {Black develops actively.}`,
      summary: 'A modern, active setup.',
    },
    {
      id: 'nf6',
      name: 'Modern Variation (2…Nf6)',
      from: 3,
      line: `2... Nf6 {Black recaptures with the knight instead of the queen.}
      3. d4 Nxd5 4. Nf3 g6 5. Be2 Bg7 6. O-O O-O 7. c4 Nb6 {A Grünfeld-like position.}`,
      summary: 'Recapture with the knight and fianchetto.',
    },
  ],
  traps: [],
  mistakes: [
    {
      title: 'Leaving the queen on d5',
      line: `1. e4 d5 2. exd5 Qxd5 3. Nc3 Nf6 4. Nxd5`,
      explanation: 'After 3.Nc3 the queen is attacked. Developing a piece instead of moving the queen simply loses her.',
    },
  ],
  quiz: [
    {
      q: 'Why is 3…Qa5 a good square for the queen?',
      line: '1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5',
      options: [
        { text: 'It is hard to attack and it pins the c3 knight.', correct: true, why: 'Yes. White cannot gain more time against the queen easily.' },
        { text: 'It attacks White’s king.', why: 'The pin is on the c3 knight, not the king.' },
        { text: 'It protects the d5 square.', why: 'From a5 the queen does not control d5.' },
      ],
    },
    {
      q: 'Why does Black play …Bf5 before …e6?',
      line: '1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6 5. Nf3 Bf5',
      options: [
        { text: 'So the bishop is not trapped behind the e6 pawn.', correct: true, why: 'Exactly, the same idea as in the Caro-Kann.' },
        { text: 'To attack the c2 pawn.', why: 'It does eye c2, but the main point is getting the bishop out first.' },
        { text: 'To prepare …Bxc3.', why: 'This bishop cannot capture on c3. It develops before …e6.' },
      ],
    },
  ],
};
