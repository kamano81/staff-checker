export const TEAM_LEADERS = {
  'TL Norr': ['Entré A', 'Entré B', 'Hiss C', 'Entré D', 'Entré Z', 'Entré Y', 'Hiss X', 'Entré V'],
  'TL Söder': ['Hiss I', 'Entré K', 'Entré L', 'Entré M', 'Entré N', 'Entré O', 'Entré P', 'Hiss Q', 'Plan 5'],
  'TL Ass Öst': ['Entré F', 'Entré G'],
  'TL Ass Väst': ['Entré S', 'Entré T'],
  'TL Ass Söder': ['Hiss I', 'Entré K', 'Entré L', 'Entré M', 'Entré N', 'Entré O', 'Entré P', 'Hiss Q', 'Plan 5'],
  'TL Plan 6': ['Plan 6'],
  'TL Rond': ['Torgvärd', 'Franks trappa', 'Däckarvakt', 'Rökgång Plan 7', 'Övriga positioner'],
}

export const STANDALONE_POSITIONS = ['Personalentrén', 'Samband', 'Låssmed']

export const TL_NAMES = Object.keys(TEAM_LEADERS)

export const ALL_POSITIONS = [...new Set([...Object.values(TEAM_LEADERS).flat(), ...STANDALONE_POSITIONS])]

export function getTLForPosition(position) {
  for (const [tl, positions] of Object.entries(TEAM_LEADERS)) {
    if (positions.includes(position)) return tl
  }
  return ''
}

export function getPositionsForTL(tl) {
  return TEAM_LEADERS[tl] ?? []
}
