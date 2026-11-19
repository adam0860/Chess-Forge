import type { Opening } from '../types';

export const queensGambit: Opening = {
  id: 'queens-gambit',
  name: 'Queen’s Gambit',
  side: 'w',
  eco: 'D06–D69',
  stage: 2,
  tagline: 'Offer the c-pawn to win the centre.',
  character: 'Classical, strategic',
  overview: [
    'After 1.d4 d5, White offers the c-pawn with 2.c4. It is not a true gambit: if Black takes, White can usually win the pawn back. The real aim is to lure Black’s d5 pawn away from the centre so that White can build with e4.',
    'Black can decline with …e6 (the Queen’s Gambit Declined), …c6 (the Slav), or accept with …dxc4. Each leads to a different kind of game, but White’s plans stay similar: develop, castle, and use the extra central space.',
  ],
  whenToPlay: 'An ideal 1.d4 repertoire. It teaches pawn structures, the minority attack and patient central play.',
  goals: {
    white: ['Pressure d5 with c4, Nc3 and Bg5.', 'Win the battle for e4.', 'Use the half-open c-file after cxd5 or …dxc4.'],
    black: ['Hold d5 or free the position with …c5 or …e5.', 'Solve the problem of the light-squared bishop on c8.', 'Trade pieces to ease a slightly cramped position.'],
  },
  plans: [
    'Pin the f6 knight with Bg5 to weaken Black’s control of d5 and e4.',
    'Develop the rook to c1: the c-file often opens.',
    'In the Exchange structure, push b4–b5 (the minority attack) to create a weakness on c6.',
  ],
  mainLine: {
    name: 'Orthodox Defence',
    line: `1. d4 {Claims the centre; the pawn is already protected by the queen.}
    d5 {Black stops e4 for now.}
    2. c4 {The Queen’s Gambit: White attacks d5 from the side.}
    e6 {Black declines and solidly supports d5.}
    3. Nc3 {A third attacker on d5.}
    Nf6 {Black defends d5 again and develops.}
    4. Bg5 {Pins the knight that defends d5.}
    Be7 {Unpins, so the knight is free again.}
    5. e3 {Supports d4 and opens the f1 bishop.}
    O-O {Black castles early.}
    6. Nf3 {Develops toward the centre and kingside.}
    Nbd7 {Supports the f6 knight and prepares …c5 or …e5.}
    7. Rc1 {The rook prepares for the c-file to open.}
    c6 {Black firmly supports d5 and makes room for the queen.}
    8. Bd3 {White waits for Black to take on c4 so the bishop can recapture in one move.}
    dxc4 {Black gives up the centre to free the position.}
    9. Bxc4 {White has won a tempo: the bishop reached c4 in one move.}
    Nd5 {Capablanca’s freeing manoeuvre: trade pieces to relieve the cramp.}
    10. Bxe7 {White accepts the trade.}
    Qxe7 {The queen recaptures and connects the rooks.}
    11. O-O {White castles.}
    Nxc3 {Another trade.}
    12. Rxc3 {The rook recaptures, staying active on the third rank.}
    e5 {The freeing break. Black’s c8 bishop finally sees daylight. Balanced.}`,
  },
  variations: [
    {
      id: 'qga',
      name: 'Queen’s Gambit Accepted (2…dxc4)',
      from: 3,
      line: `2... dxc4 {Black takes, but does not try to keep the pawn.}
      3. e3 {Opens the bishop to recapture on c4.}
      Nf6 4. Bxc4 e6 5. Nf3 c5 {Black strikes at d4.}
      6. O-O a6 {White has a free game; Black gets an isolated d-pawn to target later.}`,
      summary: 'Black returns the pawn and challenges d4 with …c5.',
    },
    {
      id: 'slav',
      name: 'Slav Defence (2…c6)',
      from: 3,
      line: `2... c6 {Supports d5 without blocking the c8 bishop.}
      3. Nf3 Nf6 4. Nc3 dxc4 5. a4 {Stops …b5 so the pawn cannot be held.}
      Bf5 6. e3 e6 7. Bxc4 Bb4 8. O-O {A solid, balanced game.}`,
      summary: 'Black keeps the light-squared bishop active.',
    },
    {
      id: 'exchange',
      name: 'Exchange Variation (4.cxd5)',
      from: 6,
      line: `4. cxd5 {White releases the tension to fix the pawn structure.}
      exd5 5. Bg5 c6 6. e3 Be7 7. Bd3 {White will often play b4–b5, the minority attack, to create a weakness on c6.}`,
      summary: 'Clear plans: White attacks with fewer pawns on the queenside.',
    },
  ],
  traps: [
    {
      id: 'elephant',
      name: 'Elephant Trap',
      side: 'them',
      line: `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Nbd7 5. cxd5 exd5 6. Nxd5 {The d5 pawn looks free because the f6 knight is pinned…}
      Nxd5 7. Bxd8 Bb4+ {…but the knight was not really pinned.}
      8. Qd2 Bxd2+ 9. Kxd2 Kxd8 {Black has won a piece.}`,
      summary: 'After …Nbd7 the f6 knight is not pinned to the queen in a way that matters. Do not grab d5.',
    },
    {
      id: 'qga-b5',
      name: 'Holding c4 with …b5',
      side: 'you',
      line: `1. d4 d5 2. c4 dxc4 3. e3 b5 {Black tries to keep the extra pawn.}
      4. a4 c6 5. axb5 cxb5 6. Qf3 {The long diagonal is open: the a8 rook and b5 are attacked. White wins material.}`,
      summary: 'If Black clings to c4 with …b5, a4 and Qf3 break the pawn chain.',
    },
    {
      id: 'lasker',
      name: 'Lasker Trap (Albin Countergambit)',
      side: 'them',
      line: `1. d4 d5 2. c4 e5 3. dxe5 d4 4. e3 Bb4+ 5. Bd2 dxe3 6. Bxb4 exf2+ 7. Ke2 fxg1=N+ {An under-promotion with check!}
      8. Ke1 Qh4+ 9. Kd2 Nc6 {Black has a raging attack.}`,
      summary: 'Against the Albin Countergambit, 4.e3? walks into a famous trap. Play 4.Nf3 instead.',
    },
  ],
  mistakes: [
    {
      title: 'Playing e4 too early',
      line: `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. e4 dxe4 5. Nxe4 Nxe4`,
      explanation: 'White would love to play e4, but only when it is well supported. Here 4.e4? dxe4 already wins a pawn, and 5.Nxe4?? Nxe4 loses a whole piece because nothing recaptures on e4.',
    },
  ],
  quiz: [
    {
      q: 'Is the Queen’s Gambit a real gambit?',
      options: [
        { text: 'Not really: White can usually win the c4 pawn back.', correct: true, why: 'Right. After …dxc4, moves like e3 and Bxc4 regain it, and holding it with …b5 fails to a4.' },
        { text: 'Yes: White gives up a pawn for good.', why: 'Black cannot normally keep the pawn without ruining the position.' },
        { text: 'Yes: White gives up the queen.', why: 'The name is historical. Only a pawn is offered.' },
      ],
    },
    {
      q: 'Why does White play 8.Bd3 before Black takes on c4?',
      line: '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Rc1 c6 8. Bd3',
      options: [
        { text: 'So that after …dxc4 the bishop recaptures in one move.', correct: true, why: 'Yes. It is a fight for a tempo: whoever waits longer gains time.' },
        { text: 'To attack h7 immediately.', why: 'The bishop does aim at h7, but the move-order point is the tempo battle over c4.' },
        { text: 'To protect the c4 pawn forever.', why: 'Black will take on c4 anyway; White is just making the recapture efficient.' },
      ],
    },
    {
      q: 'What is the minority attack?',
      options: [
        { text: 'Pushing two queenside pawns against three to create a weakness.', correct: true, why: 'Correct. White plays b4–b5 to force a weak pawn on c6 or an isolated d5 pawn.' },
        { text: 'Attacking the king with only minor pieces.', why: 'That is not it. The minority attack is a pawn plan.' },
        { text: 'Sacrificing a pawn to open the h-file.', why: 'That is a kingside attack idea, not the minority attack.' },
      ],
    },
  ],
};

export const london: Opening = {
  id: 'london',
  name: 'London System',
  side: 'w',
  eco: 'D02, A46',
  stage: 1,
  tagline: 'One reliable setup against almost anything.',
  character: 'Solid, system-based',
  overview: [
    'The London System is a setup more than a sequence of moves. White plays d4, Bf4, e3, c3, Nf3, Nbd2 and Bd3 against almost any Black reply, building a solid pyramid of pawns with active pieces in front.',
    'Because the plans repeat, you can spend your time understanding middlegames instead of memorizing lines. A classic attacking plan is Ne5 supported by f4, followed by a kingside attack.',
  ],
  whenToPlay: 'An excellent first 1.d4 opening for busy players. Low theory, solid structure, clear plans.',
  goals: {
    white: ['Develop the dark-squared bishop to f4 before playing e3.', 'Build the pyramid d4–e3–c3.', 'Post a knight on e5 and attack the kingside.'],
    black: ['Challenge the centre with …c5.', 'Target b2 with …Qb6 when the bishop leaves c1.', 'Trade off the strong f4 bishop with …Bd6 or …Nh5.'],
  },
  plans: [
    'Ne5 and f4 (a Stonewall-like grip), then Rf3–h3 or Qf3–h3 to attack.',
    'If Black offers …Bd6, keep your bishop with Bg3 so a trade fixes Black’s pawns.',
    'Meet …Qb6 with Qb3 or Qc2 to cover b2.',
  ],
  mainLine: {
    name: 'Main setup',
    line: `1. d4 {Takes the centre.}
    d5 {Black mirrors.}
    2. Bf4 {The signature move: the bishop develops before e3 locks it in.}
    Nf6 {Black develops.}
    3. e3 {Supports d4 and opens the f1 bishop.}
    c5 {The most active reply: Black challenges d4.}
    4. c3 {Completes the pyramid and keeps d4 solid.}
    Nc6 {Adds pressure to d4.}
    5. Nd2 {Develops toward f3 or e5 later, keeping c3 supported.}
    e6 {Solid; it opens the f8 bishop.}
    6. Ngf3 {Covers e5 and d4.}
    Bd6 {Black offers to trade off the London bishop.}
    7. Bg3 {White keeps the bishop. If …Bxg3, hxg3 opens the h-file for the rook.}
    O-O {Black castles.}
    8. Bd3 {The bishop aims at h7, the target of many London attacks.}
    b6 {Black prepares …Bb7.}
    9. Ne5 {The knight lands on its dream square.}
    Bb7 {Black completes development.}
    10. f4 {Supports the knight. White will attack with Qf3–h3 or Rf3–h3.}`,
  },
  variations: [
    {
      id: 'qb6',
      name: 'Early …Qb6',
      from: 7,
      line: `4... Qb6 {Attacks b2, which the bishop left behind.}
      5. Qb3 {The simplest answer: offer a queen trade.}
      c4 {Black gains space and avoids the trade.}
      6. Qc2 g6 {Prepares …Bf5; the g6 pawn will defend the bishop against Qxf5.}
      7. Nd2 Bf5 8. Qc1 Nc6 9. h3 {White keeps the queen on the c1–h6 diagonal and will break with b3 or e4.}`,
      summary: 'Black targets b2. White covers it with the queen.',
    },
    {
      id: 'kid',
      name: 'King’s Indian setup',
      from: 5,
      line: `3... g6 {Black fianchettoes the bishop.}
      4. Nf3 Bg7 5. Be2 O-O 6. O-O c5 7. c3 {The same calm setup. White can later play h3 and Nbd2.}`,
      summary: 'Same pieces, same squares. The London adapts easily.',
    },
  ],
  traps: [],
  mistakes: [
    {
      title: 'Letting the bishop get trapped by …Nh5 and …g5',
      line: `1. d4 Nf6 2. Bf4 d5 3. e3 c5 4. Nf3 Nc6 5. Nbd2 Nh5 6. Bg5 h6 7. Bh4 g5 8. Bg3 Nxg3`,
      explanation: 'Black’s knight jump to h5 chases the bishop and wins the bishop pair. Prepare a retreat square with h3 or answer …Nh5 with Be5.',
    },
  ],
  quiz: [
    {
      q: 'Why does White play Bf4 before e3?',
      line: '1. d4 d5 2. Bf4',
      options: [
        { text: 'So the bishop is not locked behind the e3 pawn.', correct: true, why: 'Exactly. After e3 the c1–h6 diagonal would be blocked.' },
        { text: 'To attack Black’s c7 pawn at once.', why: 'Bxc7 can be a threat later, but the idea is to develop the bishop outside the pawn chain.' },
        { text: 'To prepare queenside castling.', why: 'Castling short is normal in the London.' },
      ],
    },
    {
      q: 'What should White play when Black offers …Bd6?',
      line: '1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. c3 Nc6 5. Nd2 e6 6. Ngf3 Bd6',
      options: [
        { text: 'Bg3, so a trade opens the h-file for White.', correct: true, why: 'Right. If Black takes on g3, hxg3 gives White’s rook the h-file.' },
        { text: 'Bxd6, trading immediately.', why: 'This gives up White’s best piece and helps Black develop the queen.' },
        { text: 'Ignore it; the bishop is safe.', why: 'After …Bxf4 exf4 White’s structure is damaged.' },
      ],
    },
  ],
};

export const catalan: Opening = {
  id: 'catalan',
  name: 'Catalan',
  side: 'w',
  eco: 'E00–E09',
  stage: 4,
  tagline: 'A bishop on g2 that pressures the whole board.',
  character: 'Positional, long-term pressure',
  overview: [
    'The Catalan combines the Queen’s Gambit with a kingside fianchetto. The bishop on g2 points down the long diagonal at b7 and a8, so even when Black wins the c4 pawn, White’s pressure makes it hard to keep.',
    'It is a favourite of world champions because White’s advantage is quiet but lasting: Black often struggles to develop the queenside.',
  ],
  whenToPlay: 'When you enjoy slow pressure and long endgame-like middlegames.',
  goals: {
    white: ['Use the g2 bishop to press on the long diagonal.', 'Regain the c4 pawn when Black takes it.', 'Exploit queenside weaknesses in the endgame.'],
    black: ['Take on c4 and try to hold it, or play …c5 to free the game.', 'Develop the c8 bishop, often to b7.', 'Neutralise the g2 bishop.'],
  },
  plans: [
    'After …dxc4, regain the pawn with Qc2 or Qa4+, then Qxc4.',
    'Put rooks on c1 and d1 to pressure the open files.',
    'Play for e4 to gain central space when Black is passive.',
  ],
  mainLine: {
    name: 'Open Catalan, 9.Qc2',
    line: `1. d4 {Takes the centre.}
    Nf6 {Flexible development.}
    2. c4 {Grabs more central space.}
    e6 {Prepares …d5 and opens the f8 bishop.}
    3. g3 {The Catalan: the bishop will go to g2.}
    d5 {Black stakes a claim in the centre.}
    4. Bg2 {The long diagonal bishop.}
    Be7 {Solid development.}
    5. Nf3 {Develops and prepares to castle.}
    O-O {Black castles.}
    6. O-O {White castles.}
    dxc4 {Black takes the pawn, opening the g2 bishop’s diagonal further.}
    7. Qc2 {Prepares to win the pawn back with Qxc4.}
    a6 {Black prepares …b5 to hold c4.}
    8. Qxc4 {White regains the pawn before …b5 comes.}
    b5 {Gains space with tempo.}
    9. Qc2 {The queen retreats but keeps watching the c-file and e4.}
    Bb7 {Black opposes the g2 bishop on the long diagonal.}
    10. Bd2 {Prepares Ba5 or Rc1, covering the queenside.}
    Be4 {Black harasses the queen.}
    11. Qc1 {The queen stays on the c-file. White has lasting queenside pressure.}`,
  },
  variations: [
    {
      id: 'closed',
      name: 'Closed Catalan (6…c6)',
      from: 11,
      line: `6... c6 {Black supports d5 and keeps the position closed.}
      7. Qc2 Nbd7 8. Nbd2 b6 9. e4 Bb7 {White has gained central space; Black is solid but passive.}`,
      summary: 'A slow manoeuvring game where White aims for e4.',
    },
    {
      id: 'bogo',
      name: 'Bogo-Catalan (4…Bb4+)',
      from: 7,
      line: `4... Bb4+ {A check to disrupt White’s setup.}
      5. Bd2 Be7 {The bishop retreats now that White’s bishop is on d2.}
      6. Nf3 O-O 7. O-O {A normal Catalan where White’s bishop on d2 is slightly less useful.}`,
      summary: 'Black uses a check to change the bishop placement.',
    },
  ],
  traps: [],
  mistakes: [],
  quiz: [
    {
      q: 'What is the main role of the g2 bishop in the Catalan?',
      line: '1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2',
      options: [
        { text: 'Pressure along the long diagonal toward b7 and a8.', correct: true, why: 'Yes. It makes Black’s queenside development difficult.' },
        { text: 'Defend the white king only.', why: 'It does help king safety, but its main job is long-diagonal pressure.' },
        { text: 'Prepare h4–h5.', why: 'The Catalan is not about a pawn storm.' },
      ],
    },
    {
      q: 'Black has taken on c4. How does White usually regain the pawn?',
      line: '1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 Be7 5. Nf3 O-O 6. O-O dxc4',
      options: [
        { text: 'With the queen: Qc2 and Qxc4.', correct: true, why: 'Right. The queen recaptures before Black can support the pawn with …b5.' },
        { text: 'With e4 and Bxc4.', why: 'The g2 bishop cannot reach c4 easily. The queen does the job.' },
        { text: 'White gives up the pawn for good.', why: 'White normally wins it back.' },
      ],
    },
  ],
};

export const english: Opening = {
  id: 'english',
  name: 'English Opening',
  side: 'w',
  eco: 'A10–A39',
  stage: 3,
  tagline: 'Control d5 from the flank and stay flexible.',
  character: 'Flexible, positional',
  overview: [
    'The English begins with 1.c4. White controls d5 from the side and keeps every option open: the game can become a reversed Sicilian, transpose to a Queen’s Gambit, or stay in English-specific structures.',
    'A typical setup is Nc3, g3, Bg2 and Nf3, with the g2 bishop and c4 pawn working together against the light squares in the centre.',
  ],
  whenToPlay: 'When you like flexible positions and want to choose the structure yourself.',
  goals: {
    white: ['Control d5 with c4, Nc3 and Bg2.', 'Fianchetto the king’s bishop.', 'Expand on the queenside with a3, b4 and b5.'],
    black: ['Grab central space with …e5 or …d5.', 'Develop freely and strike at the c4 pawn.', 'Keep White’s queenside expansion in check.'],
  },
  plans: [
    'The Botvinnik plan: e4 plus Nge2 to clamp down on d5.',
    'Queenside expansion with a3, Rb1 and b4–b5.',
    'Treat it as a Sicilian with an extra tempo: White is the Sicilian player.',
  ],
  mainLine: {
    name: 'Four Knights, reversed Sicilian',
    line: `1. c4 {Controls d5 from the flank.}
    e5 {Black takes central space; this is a Sicilian with colours reversed.}
    2. Nc3 {Adds control of d5.}
    Nf6 {Black develops.}
    3. Nf3 {Attacks e5 and develops.}
    Nc6 {Defends e5.}
    4. g3 {Prepares the fianchetto.}
    d5 {Black strikes in the centre, just as White does in an Open Sicilian.}
    5. cxd5 {White trades the flank pawn for Black’s central pawn.}
    Nxd5 {The knight recaptures in the centre.}
    6. Bg2 {The bishop pressures the d5 knight along the long diagonal.}
    Nb6 {The knight retreats to safety.}
    7. O-O {White castles.}
    Be7 {Black prepares to castle.}
    8. d3 {Solid support of the centre; e4 and c5 are kept under watch.}
    O-O {Black castles.}
    9. a3 {Prepares b4, gaining queenside space.}`,
  },
  variations: [
    {
      id: 'symmetrical',
      name: 'Symmetrical (1…c5)',
      from: 1,
      line: `1... c5 {Black copies White’s flank approach.}
      2. Nc3 Nc6 3. g3 g6 4. Bg2 Bg7 5. Nf3 Nf6 6. O-O O-O 7. d4 {White breaks the symmetry in the centre.}
      cxd4 8. Nxd4 {An open centre with active pieces.}`,
      summary: 'Black mirrors; White breaks the symmetry with d4.',
    },
    {
      id: 'bb4',
      name: 'Bremen (2…Bb4)',
      from: 3,
      line: `2... Bb4 {Black pins the knight and may double White’s pawns.}
      3. g3 Bxc3 4. bxc3 d6 5. Bg2 {White has the bishop pair and a strong centre in return for doubled pawns.}`,
      summary: 'Bishop pair versus structure.',
    },
  ],
  traps: [],
  mistakes: [
    {
      title: 'Allowing the fork trick with …Bc5',
      line: `1. c4 e5 2. Nc3 Nf6 3. Nf3 Nc6 4. g3 Bc5 5. Nxe5 Nxe5 6. d4 Bb4 7. dxe5 Ne4 8. Qd4`,
      explanation: 'With the bishop on c5, White can take on e5 and fork with d4, winning the centre. Black’s 4…Bc5 is a common mistake; 4…d5 is the principled move.',
    },
  ],
  quiz: [
    {
      q: 'What kind of position often arises after 1.c4 e5?',
      line: '1. c4 e5',
      options: [
        { text: 'A Sicilian Defence with colours reversed.', correct: true, why: 'Yes. White plays Black’s Sicilian ideas with an extra tempo.' },
        { text: 'A French Defence.', why: 'The French arises after 1.e4 e6.' },
        { text: 'A King’s Gambit.', why: 'There is no f4 gambit here.' },
      ],
    },
    {
      q: 'Why does White play a3 in the main line?',
      line: '1. c4 e5 2. Nc3 Nf6 3. Nf3 Nc6 4. g3 d5 5. cxd5 Nxd5 6. Bg2 Nb6 7. O-O Be7 8. d3 O-O 9. a3',
      options: [
        { text: 'To prepare b4 and queenside expansion.', correct: true, why: 'Right. a3 supports b4 without allowing …Bb4 or …Nb4.' },
        { text: 'To give the king air.', why: 'The king is on g1. a3 is a queenside move.' },
        { text: 'To stop …e4.', why: 'a3 has nothing to do with e4.' },
      ],
    },
  ],
};

export const reti: Opening = {
  id: 'reti',
  name: 'Réti Opening',
  side: 'w',
  eco: 'A04–A09',
  stage: 4,
  tagline: 'Attack the centre from a distance.',
  character: 'Hypermodern, flexible',
  overview: [
    'Richard Réti was a hypermodern: he believed you could control the centre with pieces from a distance rather than occupy it with pawns. 1.Nf3 and 2.c4 attack d5 without committing the central pawns.',
    'White usually fianchettoes one or both bishops and waits for the right moment to strike. The Réti often transposes to the English, the Catalan or the Queen’s Gambit.',
  ],
  whenToPlay: 'When you enjoy flexible, positional chess and want to avoid opponents’ preparation.',
  goals: {
    white: ['Undermine Black’s d5 pawn with c4.', 'Fianchetto the bishops to control the long diagonals.', 'Strike in the centre with d4 or e4 only when ready.'],
    black: ['Occupy the centre with pawns.', 'Avoid over-extending; the central pawns can become targets.', 'Develop smoothly and castle.'],
  },
  plans: [
    'Double fianchetto with b3, Bb2, g3 and Bg2.',
    'Pressure d5 with c4 and cxd5 at a good moment.',
    'If Black pushes …d4, undermine it with e3 or b4.',
  ],
  mainLine: {
    name: 'Réti, double fianchetto',
    line: `1. Nf3 {Develops and controls d4 and e5 without committing a pawn.}
    d5 {Black occupies the centre.}
    2. c4 {Attacks d5 from the flank.}
    e6 {Black supports d5 solidly.}
    3. g3 {Prepares the bishop fianchetto.}
    Nf6 {Black develops.}
    4. Bg2 {The bishop aims at d5 and b7.}
    Be7 {Black prepares to castle.}
    5. O-O {White castles.}
    O-O {Black castles.}
    6. b3 {Preparing the second fianchetto.}
    c5 {Black grabs more central space.}
    7. Bb2 {Both bishops now rake the centre.}
    Nc6 {Develops and controls d4.}
    8. e3 {Keeps …d4 under control.}
    b6 {Black prepares his own fianchetto.}
    9. Nc3 {Adds pressure on d5.}
    Bb7 {Black develops the last minor piece.}
    10. cxd5 {White releases the tension at the right moment.}
    Nxd5 {Black recaptures with the knight. Balanced and rich.}`,
  },
  variations: [
    {
      id: 'd4',
      name: 'Advance (2…d4)',
      from: 3,
      line: `2... d4 {Black gains space and cramps White.}
      3. e3 {Undermines the d4 pawn immediately.}
      Nc6 4. exd4 Nxd4 5. Nxd4 Qxd4 6. Nc3 {White will gain time on the queen.}`,
      summary: 'Black grabs space; White undermines it.',
    },
    {
      id: 'dxc4',
      name: 'Réti Accepted (2…dxc4)',
      from: 3,
      line: `2... dxc4 {Black takes the pawn.}
      3. Na3 {The knight heads for c4 to regain it.}
      c5 4. Nxc4 Nc6 5. g3 {White regains the pawn with a pleasant position.}`,
      summary: 'White regains the pawn with Na3 and Nxc4.',
    },
  ],
  traps: [],
  mistakes: [
    {
      title: 'Holding the c4 pawn with …b5',
      line: `1. Nf3 d5 2. c4 dxc4 3. e3 b5 4. a4 c6 5. axb5 cxb5 6. b3 cxb3 7. Bxb5+`,
      explanation: 'Trying to keep the pawn with …b5 leaves Black’s queenside full of holes. White regains material with a big lead in development.',
    },
  ],
  quiz: [
    {
      q: 'What does “hypermodern” mean in the Réti?',
      options: [
        { text: 'Controlling the centre with pieces from a distance.', correct: true, why: 'Yes. The Réti attacks central squares with knights, bishops and flank pawns.' },
        { text: 'Attacking the king in the first ten moves.', why: 'The Réti is a positional opening.' },
        { text: 'Never moving central pawns.', why: 'White often plays d4 or e4 later, just at the right moment.' },
      ],
    },
    {
      q: 'How does White answer 2…d4?',
      line: '1. Nf3 d5 2. c4 d4',
      options: [
        { text: 'With e3, undermining the pawn.', correct: true, why: 'Right. Attacking the base of Black’s space advantage is the principled reply.' },
        { text: 'With d3, building a wall.', why: 'Possible, but e3 or b4 challenge the pawn more directly.' },
        { text: 'By ignoring it completely.', why: 'The d4 pawn cramps White if left alone.' },
      ],
    },
  ],
};
