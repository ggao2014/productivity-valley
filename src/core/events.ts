import type { DialogueTone, NpcProgress } from './types'

export interface RelationshipEvent {
  id: string
  npcId: string
  track: 'friendship' | 'romance'
  threshold: number
  title: string
  summary: string
  tone: DialogueTone
  lines: readonly string[]
}

const EVENT_ILLUSTRATIONS: Record<
  string,
  Record<RelationshipEvent['track'], string>
> = {
  shendu: {
    friendship: 'art/events/shendu-friendship-v1.webp',
    romance: 'art/events/shendu-romance-v1.webp',
  },
  guwan: {
    friendship: 'art/events/guwan-friendship-v1.webp',
    romance: 'art/events/guwan-romance-v1.webp',
  },
  taotao: {
    friendship: 'art/events/taotao-friendship-v1.webp',
    romance: 'art/events/taotao-romance-v1.webp',
  },
}

export const RELATIONSHIP_EVENTS: readonly RelationshipEvent[] = [
  {
    id: 'shendu-f1-riverbank',
    npcId: 'shendu',
    track: 'friendship',
    threshold: 20,
    title: '河岸停一停',
    summary: '沈渡第一次主动叫你留下歇脚。',
    tone: 'warm',
    lines: [
      '河水走得很慢，沈渡把竹篙横放在岸边。',
      '“不急着赶路的话，就在这里坐一会儿。”',
    ],
  },
  {
    id: 'shendu-f2-old-rope',
    npcId: 'shendu',
    track: 'friendship',
    threshold: 50,
    title: '旧绳结',
    summary: '他教你打一个不会松开的船结。',
    tone: 'neutral',
    lines: [
      '沈渡把一截旧船绳递给你，耐心放慢每一个动作。',
      '“记住最后这一绕。风再大，也不会散。”',
    ],
  },
  {
    id: 'shendu-f3-return-lamp',
    npcId: 'shendu',
    track: 'friendship',
    threshold: 90,
    title: '归来的灯',
    summary: '河对岸第一次为你留了一盏灯。',
    tone: 'warm',
    lines: [
      '天色暗下来时，渡口仍亮着一盏小灯。',
      '沈渡只说：“知道你会回来，就没熄。”',
    ],
  },
  {
    id: 'shendu-r1-shared-boat',
    npcId: 'shendu',
    track: 'romance',
    threshold: 30,
    title: '同一条船',
    summary: '你们第一次把喜欢说得很轻。',
    tone: 'shy',
    lines: [
      '小船在水面轻轻晃了一下，他没有移开目光。',
      '“以后过河，你不用再等别人。”',
    ],
  },
  {
    id: 'shendu-r2-rain-sleeve',
    npcId: 'shendu',
    track: 'romance',
    threshold: 70,
    title: '雨落衣袖',
    summary: '一场小雨让距离变得很近。',
    tone: 'shy',
    lines: [
      '雨来得突然，沈渡把半边蓑衣偏向你。',
      '他的袖口全湿了，却只问：“你冷不冷？”',
    ],
  },
  {
    id: 'shendu-r3-homeward',
    npcId: 'shendu',
    track: 'romance',
    threshold: 120,
    title: '回家的水路',
    summary: '渡口和小屋之间有了“回家”的名字。',
    tone: 'warm',
    lines: [
      '船靠岸后，他仍握着缆绳，没有立刻松手。',
      '“这条水路走惯了。以后，终点就是你那里。”',
    ],
  },
  {
    id: 'guwan-f1-half-umbrella',
    npcId: 'guwan',
    track: 'friendship',
    threshold: 20,
    title: '半边伞',
    summary: '顾晚嘴上嫌弃，伞却偏向了你。',
    tone: 'warm',
    lines: [
      '雨点敲在伞面上，顾晚往旁边让了一步。',
      '“别想多。我只是不想听你一路打喷嚏。”',
    ],
  },
  {
    id: 'guwan-f2-dry-firewood',
    npcId: 'guwan',
    track: 'friendship',
    threshold: 50,
    title: '干燥的柴',
    summary: '他悄悄替你收好了雨前的柴。',
    tone: 'neutral',
    lines: [
      '屋檐下多出一捆扎得整齐的干柴。',
      '顾晚抱臂站着：“顺手而已，不许道谢。”',
    ],
  },
  {
    id: 'guwan-f3-kept-seat',
    npcId: 'guwan',
    track: 'friendship',
    threshold: 90,
    title: '留着的位置',
    summary: '热闹里有一个位置始终没人坐。',
    tone: 'shy',
    lines: [
      '茶桌旁空着一张凳子，顾晚谁也不让坐。',
      '你来后，他敲了敲桌面：“磨蹭。茶都凉了。”',
    ],
  },
  {
    id: 'guwan-r1-taken-seriously',
    npcId: 'guwan',
    track: 'romance',
    threshold: 30,
    title: '我会当真',
    summary: '你的表白被他认真收进心里。',
    tone: 'shy',
    lines: [
      '顾晚沉默了很久，耳尖却一点点红起来。',
      '“这种话说出口，我可就不会当没听见。”',
    ],
  },
  {
    id: 'guwan-r2-closer-side',
    npcId: 'guwan',
    track: 'romance',
    threshold: 70,
    title: '伞下近一点',
    summary: '这一次，他没有假装只是避雨。',
    tone: 'shy',
    lines: [
      '伞明明够大，顾晚却又往你身边靠了一点。',
      '“路滑。只是怕你摔了连累我。”',
    ],
  },
  {
    id: 'guwan-r3-spare-key',
    npcId: 'guwan',
    track: 'romance',
    threshold: 120,
    title: '备用钥匙',
    summary: '他把一枚钥匙握进你的掌心。',
    tone: 'warm',
    lines: [
      '钥匙还带着他掌心的温度。',
      '顾晚别开脸：“丢了我可不给你配第二把。”',
    ],
  },
  {
    id: 'taotao-f1-crooked-rabbit',
    npcId: 'taotao',
    track: 'friendship',
    threshold: 20,
    title: '歪耳朵兔子',
    summary: '桃桃把第一只不完美的糖兔送给你。',
    tone: 'warm',
    lines: [
      '糖兔的一只耳朵歪了，桃桃却笑得很开心。',
      '“它跟别人不一样，所以第一只就给你！”',
    ],
  },
  {
    id: 'taotao-f2-sugar-thread',
    npcId: 'taotao',
    track: 'friendship',
    threshold: 50,
    title: '一根糖丝',
    summary: '你们一起学会把急躁慢慢绕圆。',
    tone: 'neutral',
    lines: [
      '糖丝断了三次，桃桃仍把铜勺重新举起来。',
      '“慢一点就好。事情和糖画都是这样。”',
    ],
  },
  {
    id: 'taotao-f3-wall-of-rabbits',
    npcId: 'taotao',
    track: 'friendship',
    threshold: 90,
    title: '一墙兔子',
    summary: '她画下了你们一起度过的许多天。',
    tone: 'warm',
    lines: [
      '墙上的每只兔子都抱着不同的小物件。',
      '桃桃指给你看：“这一只，是我们第一次聊天那天。”',
    ],
  },
  {
    id: 'taotao-r1-best-rabbit',
    npcId: 'taotao',
    track: 'romance',
    threshold: 30,
    title: '最好看的那只',
    summary: '她把最舍不得送人的糖画递给你。',
    tone: 'shy',
    lines: [
      '桃桃把糖兔藏在身后，犹豫了好一会儿。',
      '“最好看的给最喜欢的人。就是、就是这个意思。”',
    ],
  },
  {
    id: 'taotao-r2-sweet-half',
    npcId: 'taotao',
    track: 'romance',
    threshold: 70,
    title: '甜的一半',
    summary: '一块糖被认真分成了相等的两半。',
    tone: 'warm',
    lines: [
      '桃桃对着光比了很久，终于把糖掰成两半。',
      '“你的这一半也要甜。不能比我的少。”',
    ],
  },
  {
    id: 'taotao-r3-window-rabbit',
    npcId: 'taotao',
    track: 'romance',
    threshold: 120,
    title: '窗边的兔子',
    summary: '她开始想象把每日的小事都搬进来。',
    tone: 'shy',
    lines: [
      '桃桃在纸上画了一扇窗，窗边挤着两只兔子。',
      '“以后每天醒来，都能先跟你说早呀。”',
    ],
  },
] as const

export function eventsForNpc(npcId: string): readonly RelationshipEvent[] {
  return RELATIONSHIP_EVENTS.filter((event) => event.npcId === npcId)
}

export function eligibleEventIds(
  npcId: string,
  progress: NpcProgress,
): string[] {
  return eventsForNpc(npcId)
    .filter((event) =>
      event.track === 'friendship'
        ? progress.friendshipPoints >= event.threshold
        : progress.romanceUnlocked &&
          progress.romancePoints >= event.threshold,
    )
    .map((event) => event.id)
}

export function eventById(id: string): RelationshipEvent | undefined {
  return RELATIONSHIP_EVENTS.find((event) => event.id === id)
}

export function illustrationForEvent(
  event: RelationshipEvent,
): string | undefined {
  return EVENT_ILLUSTRATIONS[event.npcId]?.[event.track]
}
