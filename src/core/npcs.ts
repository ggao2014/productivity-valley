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
    blurb: '话少，却总在渡口等人；送人上路时才会多说一句。',
    prop: '竹篙 · 短蓑衣',
    voice: '短句、留白多',
    starter: true,
    color: '#6b7c6a',
    inviteLine: '……蓑衣可以挂进去吗。',
    leaveLine: '渡口风还在。你忙你的。',
  },
  {
    id: 'qinghe',
    name: '青禾',
    blurb: '直球务实，讨厌弯弯绕；答应的事隔夜必办。',
    prop: '稻穗发饰',
    voice: '大声、干脆',
    starter: true,
    color: '#7a9b4a',
    inviteLine: '行。那明日炊火我来。',
    leaveLine: '行。田埂见。',
  },
  {
    id: 'guwan',
    name: '顾晚',
    blurb: '毒舌护短；嘴上嫌麻烦，雨天已经把伞撑过来了。',
    prop: '油纸伞',
    voice: '损你两句再关心',
    starter: true,
    color: '#8b5a4a',
    inviteLine: '哈，终于肯留？伞我可只带一把。',
    leaveLine: '去去去，伞我还得自己撑。',
  },
  {
    id: 'jiangxiaoman',
    name: '姜小满',
    blurb: '厨房冒失鬼；口味偏甜，面粉像会自己打架。',
    prop: '歪系围裙',
    voice: '咋咋呼呼又柔软',
    starter: true,
    color: '#c48a5a',
    inviteLine: '真的吗？！我保证少打翻两次！',
    leaveLine: '厨房……我会想的。',
  },
  {
    id: 'chenshi',
    name: '陈拾',
    blurb: '碎嘴义气的捡漏摊主；八卦灵通，护友要命。',
    prop: '补丁马褂',
    voice: '连珠炮、爱起外号',
    starter: true,
    color: '#b0893a',
    inviteLine: '成！摊子我挪窗边，保准热闹。',
    leaveLine: '行吧行吧，有好货还喊你。',
  },
  {
    id: 'taotao',
    name: '桃桃',
    blurb: '乐天糖画匠；见谁都想画一只小兔送礼。',
    prop: '铜勺 · 糖丝',
    voice: '笑语多、叠词',
    starter: true,
    color: '#d47a8a',
    inviteLine: '好呀好呀！我给窗画一只小兔！',
    leaveLine: '那我先去街口画糖啦～',
  },
  {
    id: 'linchu',
    name: '林初',
    blurb: '手笨心诚的小木匠；搞砸了也会刨完最后一刀。',
    prop: '刨花 · 尺矩',
    voice: '道歉很快、认真解释',
    starter: false,
    color: '#8a7355',
    inviteLine: '我、我可以修门槛！不收费！',
    leaveLine: '刨花我会扫干净的……',
  },
  {
    id: 'baizhi',
    name: '白芷',
    blurb: '冷静采药人；怕吵，能把草认到叶子背面。',
    prop: '药篓',
    voice: '轻声、精确',
    starter: false,
    color: '#6a8f7a',
    inviteLine: '……安静就好。我可以住角落。',
    leaveLine: '山里见。草还在。',
  },
  {
    id: 'suweiming',
    name: '苏未名',
    blurb: '把身边人写进话本的浪漫不着调；常迟到。',
    prop: '毛笔 · 纸卷',
    voice: '半文半白、爱比喻',
    starter: false,
    color: '#5a6a8b',
    inviteLine: '也好。这间房，写进下一回。',
    leaveLine: '故事未完。山路见。',
  },
  {
    id: 'yueqingshan',
    name: '岳青衫',
    blurb: '纪律怪早起习武；其实怕打雷，雷声里会找人待着。',
    prop: '青布劲衣 · 木剑',
    voice: '规矩、不自觉放软',
    starter: false,
    color: '#3d6b5a',
    inviteLine: '……晨练会尽量轻声。',
    leaveLine: '规矩还在。山门见。',
  },
  {
    id: 'wenjiu',
    name: '温九',
    blurb: '旧宅式沉稳；记性好到可怕，温柔里带着不计较的锋利。',
    prop: '钥匙串',
    voice: '慢条斯理、一针见血',
    starter: false,
    color: '#3a4a6a',
    inviteLine: '钥匙我收着。别弄丢自己。',
    leaveLine: '门我替你带上。',
  },
  {
    id: 'hedeng',
    name: '河灯',
    blurb: '感伤却不沉溺；爱放河灯，相信小事也能照路。',
    prop: '小河灯',
    voice: '轻、像在说给水听',
    starter: false,
    color: '#6a7a9a',
    inviteLine: '那今晚的灯，放在窗台好了。',
    leaveLine: '水还流着。灯还会遇。',
  },
]

export function getNpc(id: string): NpcDef {
  const npc = NPC_DEFS.find((n) => n.id === id)
  if (!npc) throw new Error(`Unknown NPC: ${id}`)
  return npc
}
