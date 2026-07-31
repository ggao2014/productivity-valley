export const GIFT_ICON_NAMES = [
  'ginger_soup',
  'wheat_cake',
  'chestnuts',
  'wood_scrap',
  'osmanthus',
  'orange_peel',
  'trinket',
  'cinnabar',
  'bean_bag',
  'maltose',
  'tea_cake',
  'lotus_paper',
] as const

export type GiftIconName = (typeof GIFT_ICON_NAMES)[number]
