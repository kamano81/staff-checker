import { getTLForPosition } from './teams'

function p(name, position, { tl, roll } = {}) {
  const r = roll ?? 'personal'
  const isTL = r === 'tl' || r === 'tl-ass'
  return {
    id: `demo-${name.replace(/\s/g, '-')}`,
    name,
    roll: r,
    passStart: isTL ? '17:00' : '17:15',
    passEnd:   isTL ? '21:30' : '21:15',
    radio: '',
    kort: '',
    position,
    teamleader: tl ?? getTLForPosition(position),
    checkedIn: false,
    checkedInAt: null,
    checkedOut: false,
    checkedOutAt: null,
  }
}

export const TEST_PEOPLE = [
  // TLs (7)
  p('Anna Lindqvist',  'Entré A',   { roll: 'tl' }),
  p('Erik Söderström', 'Hiss I',    { roll: 'tl' }),
  p('Maria Björk',     'Entré F',   { roll: 'tl-ass' }),
  p('Lars Engström',   'Entré S',   { roll: 'tl-ass' }),
  p('Therese Wallin',  'Hiss I',    { tl: 'TL Ass Söder', roll: 'tl-ass' }),
  p('Johan Magnusson', 'Torgvärd',  { roll: 'tl' }),
  p('Sara Hedlund',    'Plan 6',    { roll: 'tl' }),

  // TL Norr (20)
  p('Cecilia Hansson',   'Entré A'),
  p('Maja Lindberg',     'Entré A'),
  p('Richard Fransson',  'Entré A'),
  p('Björn Karlsson',    'Entré B'),
  p('Stefan Åkerlund',   'Entré B'),
  p('Emil Nygren',       'Entré B'),
  p('Karin Gustafsson',  'Hiss C'),
  p('Rebecka Nordin',    'Hiss C'),
  p('Peter Olsson',      'Entré D'),
  p('Viktor Palmqvist',  'Entré D'),
  p('Yvonne Lindmark',   'Entré D'),
  p('Linda Persson',     'Entré Z'),
  p('Nora Björnsson',    'Entré Z'),
  p('Anders Nilsson',    'Entré Y'),
  p('Frida Björklund',   'Entré Y'),
  p('Lina Carlsson',     'Entré Y'),
  p('Helena Eriksson',   'Hiss X'),
  p('Oskar Holm',        'Hiss X'),
  p('Fredrik Johansson', 'Entré V'),
  p('Ida Westergård',    'Entré V'),

  // TL Söder (16)
  p('Mikael Bergström',  'Hiss I'),
  p('Ulrika Söderberg',  'Hiss I'),
  p('Magnus Larsson',    'Entré K'),
  p('Anton Eklund',      'Entré K'),
  p('Annika Svensson',   'Entré L'),
  p('Emma Lindqvist',    'Entré L'),
  p('Daniel Pettersson', 'Entré M'),
  p('Louise Bergman',    'Entré M'),
  p('Susanne Jonsson',   'Entré N'),
  p('Gustav Holmberg',   'Entré N'),
  p('Robert Bengtsson',  'Entré O'),
  p('Monica Sandqvist',  'Entré O'),
  p('Katarina Sandberg', 'Entré P'),
  p('Thomas Mellberg',   'Hiss Q'),
  p('Ingrid Lind',       'Plan 5'),
  p('Simon Åberg',       'Plan 5'),

  // TL Ass Söder (6)
  p('Kristina Lundqvist', 'Entré K', { tl: 'TL Ass Söder' }),
  p('Niklas Wikström',    'Entré L', { tl: 'TL Ass Söder' }),
  p('Camilla Isaksson',   'Hiss Q',  { tl: 'TL Ass Söder' }),
  p('Christoffer Melin',  'Entré M', { tl: 'TL Ass Söder' }),
  p('Jessica Norgren',    'Entré N', { tl: 'TL Ass Söder' }),
  p('Pontus Ljungqvist',  'Hiss I',  { tl: 'TL Ass Söder' }),

  // TL Ass Öst (7)
  p('Sofia Lundgren',   'Entré F'),
  p('Patrik Ekström',   'Entré F'),
  p('David Thorsson',   'Entré F'),
  p('Jenny Strömberg',  'Entré G'),
  p('Hanna Sandström',  'Entré G'),
  p('Hugo Lindgren',    'Entré G'),
  p('Filip Ohlsson',    'Entré G'),

  // TL Ass Väst (7)
  p('Andreas Nyström',    'Entré S'),
  p('Malin Blomqvist',    'Entré S'),
  p('Erik Lundberg',      'Entré S'),
  p('Gunnar Sjöberg',     'Entré T'),
  p('Alexander Lindström','Entré T'),
  p('Sara Jansson',       'Entré T'),
  p('Petter Ålund',       'Entré T'),

  // TL Plan 6 (10)
  p('Marcus Mattsson',   'Plan 6'),
  p('Johanna Berglund',  'Plan 6'),
  p('Viktor Henriksson', 'Plan 6'),
  p('Isabella Strand',   'Plan 6'),
  p('Filip Magnusson',   'Plan 6'),
  p('Klara Eriksson',    'Plan 6'),
  p('Oscar Lindén',      'Plan 6'),
  p('Sofia Persson',     'Plan 6'),
  p('Carl Wahlström',    'Plan 6'),
  p('Elin Björklund',    'Plan 6'),

  // TL Rond (20)
  p('Elisabet Fransson', 'Torgvärd'),
  p('Rasmus Ström',      'Torgvärd'),
  p('Charlotte Lindahl', 'Torgvärd'),
  p('Henrik Dahlin',     'Torgvärd'),
  p('Jonas Dahl',        'Franks trappa'),
  p('Rebecca Arvidsson', 'Franks trappa'),
  p('Ida Granström',     'Franks trappa'),
  p('Tobias Renberg',    'Franks trappa'),
  p('Marcus Björk',      'Däckarvakt'),
  p('Emma Söderström',   'Däckarvakt'),
  p('Lena Martinsson',   'Däckarvakt'),
  p('Andreas Carlsson',  'Däckarvakt'),
  p('Julia Eriksson',    'Rökgång Plan 7'),
  p('Nina Hedström',     'Rökgång Plan 7'),
  p('Martin Öqvist',     'Rökgång Plan 7'),
  p('Sofie Dahlgren',    'Rökgång Plan 7'),
  p('Amanda Lövgren',    'Övriga positioner'),
  p('Robert Öberg',      'Övriga positioner'),
  p('Markus Hagström',   'Övriga positioner'),
  p('Petra Lindqvist',   'Övriga positioner'),

  // Fristående — ingen TL (7)
  p('Maria Pettersson',    'Personalentrén'),
  p('Tobias Lindgren',     'Personalentrén'),
  p('Sandra Bergqvist',    'Personalentrén'),
  p('Karl Svensson',       'Samband'),
  p('Anna-Karin Holmgren', 'Samband'),
  p('Birgitta Johansson',  'Låssmed'),
  p('Sven Eriksson',       'Låssmed'),
]
