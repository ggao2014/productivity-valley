export interface NpcDef {
  id: string
  name: string
  blurb: string
  prop: string
  voice: string
  starter: boolean
  color: string
  inviteLine: string
  leaveLine: string
}

export const NPC_DEFS: NpcDef[] = [
  {
    id: 'shendu',
    name: '沈渡',
    blurb: '话少，人很好',
    prop: '竹篙',
    voice: '话少',
    starter: true,
    color: '#6b7c6a',
    inviteLine: '那我住下咯',
    leaveLine: '先出去走走',
  },
  {
    id: 'qinghe',
    name: '青禾',
    blurb: '做事干脆，不绕弯',
    prop: '稻穗',
    voice: '干脆',
    starter: true,
    color: '#7a9b4a',
    inviteLine: '行，我来啦',
    leaveLine: '先撤，回头见',
  },
  {
    id: 'guwan',
    name: '顾晚',
    blurb: '嘴硬心软，会撑伞',
    prop: '油纸伞',
    voice: '爱吐槽',
    starter: true,
    color: '#8b5a4a',
    inviteLine: '哈，终于留我？',
    leaveLine: '去去去，自己撑伞',
  },
  {
    id: 'jiangxiaoman',
    name: '姜小满',
    blurb: '爱做饭，爱打翻面粉',
    prop: '围裙',
    voice: '热情',
    starter: true,
    color: '#c48a5a',
    inviteLine: '真的吗？！耶！',
    leaveLine: '我会想厨房的',
  },
  {
    id: 'chenshi',
    name: '陈拾',
    blurb: '爱聊天，讲义气',
    prop: '钱袋',
    voice: '话多',
    starter: true,
    color: '#b0893a',
    inviteLine: '成！我搬过来',
    leaveLine: '有好玩的再喊我',
  },
  {
    id: 'taotao',
    name: '桃桃',
    blurb: '爱画糖画小兔子',
    prop: '铜勺',
    voice: '开心果',
    starter: true,
    color: '#d47a8a',
    inviteLine: '好呀好呀！',
    leaveLine: '我去外面画糖啦',
  },
  {
    id: 'linchu',
    name: '林初',
    blurb: '小木匠，手有点笨',
    prop: '刨花',
    voice: '认真',
    starter: false,
    color: '#8a7355',
    inviteLine: '我可以修东西！',
    leaveLine: '我扫干净再走…',
  },
  {
    id: 'baizhi',
    name: '白芷',
    blurb: '认药超准，怕吵',
    prop: '药篓',
    voice: '轻轻的',
    starter: false,
    color: '#6a8f7a',
    inviteLine: '安静就好',
    leaveLine: '山上见',
  },
  {
    id: 'suweiming',
    name: '苏未名',
    blurb: '爱写故事，爱迟到',
    prop: '毛笔',
    voice: '爱比喻',
    starter: false,
    color: '#5a6a8b',
    inviteLine: '好，记下这一页',
    leaveLine: '故事未完，拜',
  },
  {
    id: 'yueqingshan',
    name: '岳青衫',
    blurb: '爱早起，其实怕打雷',
    prop: '木剑',
    voice: '正经',
    starter: false,
    color: '#3d6b5a',
    inviteLine: '我会轻声一点',
    leaveLine: '先告辞',
  },
  {
    id: 'wenjiu',
    name: '温九',
    blurb: '记性很好，话不多',
    prop: '钥匙',
    voice: '稳',
    starter: false,
    color: '#3a4a6a',
    inviteLine: '钥匙我帮你收着',
    leaveLine: '门我带上',
  },
  {
    id: 'hedeng',
    name: '河灯',
    blurb: '爱放小河灯',
    prop: '小灯',
    voice: '软软的',
    starter: false,
    color: '#6a7a9a',
    inviteLine: '灯放窗台好了',
    leaveLine: '路上见',
  },
]

export function getNpc(id: string): NpcDef {
  const npc = NPC_DEFS.find((n) => n.id === id)
  if (!npc) throw new Error(`Unknown NPC: ${id}`)
  return npc
}
