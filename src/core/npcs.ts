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
    blurb: '老摆渡人的孙子，近年开始替年迈的爷爷摆渡',
    prop: '竹篙',
    voice: '寡言',
    starter: true,
    color: '#6b7c6a',
    inviteLine: '好',
    leaveLine: '渡口见',
  },
  {
    id: 'qinghe',
    name: '青禾',
    blurb: '租田种粮，也卖粮种',
    prop: '稻穗',
    voice: '风风火火、爱指挥',
    starter: true,
    color: '#7a9b4a',
    inviteLine: '放着我来',
    leaveLine: '以后有事还叫我，别生分了',
  },
  {
    id: 'guwan',
    name: '顾晚',
    blurb: '替人量田画图',
    prop: '油纸伞',
    voice: '尖锐、好胜',
    starter: true,
    color: '#8b5a4a',
    inviteLine: '行，我住哪屋？',
    leaveLine: '别难过，有缘再见',
  },
  {
    id: 'jiangxiaoman',
    name: '姜小满',
    blurb: '办席掌勺，也爱腌菜',
    prop: '围裙',
    voice: '热闹、爱操心',
    starter: true,
    color: '#c48a5a',
    inviteLine: '行啊！锅放哪？',
    leaveLine: '厨房里的菜，再过两天就别吃了',
  },
  {
    id: 'chenshi',
    name: '陈拾',
    blurb: '货郎，啥都倒腾',
    prop: '钱袋',
    voice: '油滑、会来事',
    starter: true,
    color: '#b0893a',
    inviteLine: '成嘞！都听你的',
    leaveLine: '后会有期',
  },
  {
    id: 'taotao',
    name: '桃桃',
    blurb: '走村赶集的糖画匠',
    prop: '铜勺',
    voice: '爽快、要强',
    starter: true,
    color: '#d47a8a',
    inviteLine: '好！小车我放院里啦',
    leaveLine: '…再见',
  },
  {
    id: 'linchu',
    name: '林初',
    blurb: '木匠',
    prop: '刨花',
    voice: '较真，憨直',
    starter: false,
    color: '#8a7355',
    inviteLine: '真的吗？我..我这就去收拾',
    leaveLine: '凿子给你留下了',
  },
  {
    id: 'baizhi',
    name: '白芷',
    blurb: '采药晒药，收集标本',
    prop: '药篓',
    voice: '轻盈、好奇',
    starter: false,
    color: '#6a8f7a',
    inviteLine: '好呀！你家好漂亮呀',
    leaveLine: '那我走啦',
  },
  {
    id: 'suweiming',
    name: '苏未名',
    blurb: '代写书信，也爱写故事',
    prop: '毛笔',
    voice: '戏多的古风小生',
    starter: false,
    color: '#5a6a8b',
    inviteLine: '小生这厢有礼了',
    leaveLine: '后会有期了',
  },
  {
    id: 'yueqingshan',
    name: '岳青衫',
    blurb: '巡山护路，也教基本防身',
    prop: '木剑',
    voice: '板正、好面子',
    starter: false,
    color: '#3d6b5a',
    inviteLine: '好。',
    leaveLine: '那就后会有期',
  },
  {
    id: 'wenjiu',
    name: '温九',
    blurb: '在镇上做账房先生',
    prop: '钥匙',
    voice: '爱管人、冷面吐槽',
    starter: false,
    color: '#3a4a6a',
    inviteLine: '好。家门钥匙我去多配一把',
    leaveLine: '钥匙放书房了。账两清了',
  },
  {
    id: 'hedeng',
    name: '河灯',
    blurb: '灯匠',
    prop: '小灯',
    voice: '跳脱、凭感觉办事',
    starter: false,
    color: '#6a7a9a',
    inviteLine: '好啊好啊！天啊，我好期待',
    leaveLine: '我回去啦',
  },
]

export function getNpc(id: string): NpcDef {
  const npc = NPC_DEFS.find((n) => n.id === id)
  if (!npc) throw new Error(`Unknown NPC: ${id}`)
  return npc
}
