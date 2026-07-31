import type {
  DialogueKind,
  DialogueState,
  DialogueTone,
  Difficulty,
  GameState,
  Task,
  FriendshipStage,
  RoomType,
} from './types'
import { friendshipStage, hasRoomType } from './economy'

export interface DialogueCondition {
  livingAtHome?: boolean
  room?: RoomType
  minFriendship?: FriendshipStage
  time?: 'morning' | 'evening'
}

export interface DialogueEntry {
  text: string
  tone: DialogueTone
  condition?: DialogueCondition
}

type CharacterDialogue = Partial<Record<DialogueKind, DialogueEntry[]>>

const CORE_DIALOGUE: Record<string, CharacterDialogue> = {
  shendu: {
    chat: [
      {
        text: '竹篙我放门边了，出门拿着方便。',
        tone: 'warm',
        condition: { livingAtHome: true },
      },
      { text: '河水今天不急，摆渡应该挺顺。你忙完了吗？', tone: 'neutral' },
      { text: '先喝口水吧，剩下的活等会儿再做。', tone: 'warm' },
      { text: '你要过河吗？顺路的话我送你。', tone: 'warm' },
      {
        text: '昨晚门闩有点松，我顺手修好了。你不用惦记。',
        tone: 'neutral',
      },
      {
        text: '你晚上回来得晚，我会把门口的灯开着。',
        tone: 'shy',
      },
      {
        text: '早上雾大，过河要等一会儿。',
        tone: 'neutral',
        condition: { time: 'morning' },
      },
      {
        text: '起得早的话，先喝点热水。空着肚子别赶路。',
        tone: 'worried',
      },
      {
        text: '天快黑了。剩下的路，明天走也来得及。',
        tone: 'worried',
        condition: { time: 'evening' },
      },
      {
        text: '今晚风小。要不要在门口坐一会儿？',
        tone: 'warm',
      },
      {
        text: '书房的窗正对着河。累了，抬头就能看见水。',
        tone: 'warm',
        condition: { room: 'study' },
      },
      {
        text: '厨房有姜吗？凉天煮一点，手脚会暖。',
        tone: 'neutral',
        condition: { room: 'kitchen' },
      },
      {
        text: '储藏间那捆旧绳别扔。我能把松掉的椅脚绑牢。',
        tone: 'neutral',
      },
      {
        text: '卧室窗边有雨声吗？太响的话，我去压一压瓦。',
        tone: 'worried',
      },
      {
        text: '客房收拾好了，临时来人也有地方住。',
        tone: 'warm',
      },
      {
        text: '你最近做完了不少事，休息半天也不耽误。',
        tone: 'warm',
        condition: { minFriendship: 1 },
      },
      {
        text: '有事就叫我。隔着河也听不见，但我会常来看。',
        tone: 'warm',
      },
      {
        text: '我不太会说话。不过你来找我，我都在。',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '河边那块石头晒暖了，坐着正好。', tone: 'neutral' },
      { text: '今天的风有稻草味。上游大概在收粮。', tone: 'neutral' },
      { text: '鞋底全是泥，进屋前在石阶上刮一刮。', tone: 'warm' },
      { text: '你眉头皱得太久了。先松一松，事情跑不了。', tone: 'worried' },
      { text: '竹篙裂了一道，我拿麻绳缠过了，还能用。', tone: 'neutral' },
      { text: '河水太急就别下水，等水位降了再走。', tone: 'worried' },
      { text: '我带了两个饭团。原本就打算吃两个，你别多想。', tone: 'shy' },
      { text: '这几天水位涨得快，河边的东西记得收高一点。', tone: 'neutral' },
      { text: '忙完这一件，就认真歇一会儿。我会提醒你。', tone: 'warm' },
      { text: '你今天做得够多了。剩下的交给明天的你。', tone: 'warm' },
    ],
    heart: [
      { text: '我不太会说好听的话。不过，你来时，我总能认出来。', tone: 'shy' },
      { text: '有些事我没说，不代表我没放在心上。', tone: 'neutral' },
    ],
    romance: [
      { text: '我明白了。以后有事，我们一起商量。', tone: 'shy' },
    ],
    giftLiked: [
      { text: '是给我的？我会好好收着。', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '谢谢。你记得我，我就很高兴。', tone: 'warm' },
    ],
    giftDisliked: [
      { text: '我收下。不过下次，不必费心挑这种。', tone: 'neutral' },
    ],
    tea: [
      { text: '茶还热。你今天遇到什么事了？', tone: 'warm' },
    ],
    invite: [
      { text: '那我住下。门边给竹篙留个地方就好。', tone: 'shy' },
    ],
  },
  guwan: {
    chat: [
      {
        text: '厨房倒是收拾得挺像样。别误会，我只是随口一说。',
        tone: 'warm',
        condition: { room: 'kitchen' },
      },
      { text: '又来找我？先说好，我可没在等。', tone: 'annoyed' },
      { text: '今天倒没淋雨。你这运气，偶尔也靠得住。', tone: 'neutral' },
      { text: '有话就说。你磨蹭的时候，比雨声还吵。', tone: 'warm' },
      {
        text: '伞放门后了。下次出去记得拿，别又装作不怕雨。',
        tone: 'annoyed',
        condition: { livingAtHome: true },
      },
      {
        text: '你把我的位置留得挺好。只是挺好，没别的意思。',
        tone: 'shy',
      },
      {
        text: '这么早就醒？早饭吃了吗？',
        tone: 'annoyed',
        condition: { time: 'morning' },
      },
      {
        text: '晨露重，石阶滑。走慢点，我不想扶第二次。',
        tone: 'worried',
      },
      {
        text: '都这个时辰了还不睡？剩下的明天再想。',
        tone: 'worried',
        condition: { time: 'evening' },
      },
      {
        text: '晚上风凉。过来一点——伞挡风也勉强有用。',
        tone: 'shy',
      },
      {
        text: '书房那几本书放反了。我没动，等你自己发现。',
        tone: 'annoyed',
        condition: { room: 'study' },
      },
      {
        text: '厨房的刀倒是磨得不错。总算有件事不用我操心。',
        tone: 'warm',
      },
      {
        text: '储藏间别什么都往里塞。找不到东西时又要问我。',
        tone: 'annoyed',
      },
      {
        text: '卧室窗缝漏风。今晚先拿布堵上，明天我来修。',
        tone: 'worried',
      },
      {
        text: '客房留一把伞吧。客人嘴硬的时候未必会说需要。',
        tone: 'neutral',
      },
      {
        text: '你做事还算靠谱。别得意，我只是陈述事实。',
        tone: 'warm',
        condition: { minFriendship: 1 },
      },
      {
        text: '有麻烦先告诉我。等我自己看出来，你会更倒霉。',
        tone: 'worried',
      },
      {
        text: '别人问起来，就说我碰巧总在你身边。记住，是碰巧。',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '云压得这么低，半个时辰后准下雨。敢不敢赌？', tone: 'neutral' },
      { text: '你今天看起来还行。嗯，比昨天少皱一点。', tone: 'warm' },
      { text: '别把每句话都往心里放。尤其是我说得太重的时候。', tone: 'worried' },
      { text: '我没有跟着你。我只是刚好也往这边走。', tone: 'annoyed' },
      { text: '那块石头我已经挪开了。不是帮你，只是它碍路。', tone: 'annoyed' },
      { text: '你偶尔也可以说“不想做”。天不会因此塌下来。', tone: 'worried' },
      { text: '伞骨松了一根，我修好前你别拿去逞强。', tone: 'neutral' },
      { text: '你笑什么？我今天又没有特意来找你。', tone: 'shy' },
      { text: '做得不错就承认做得不错，谦虚过头也很烦。', tone: 'warm' },
      { text: '先喝口水。你再说“不渴”，我就直接递到手里。', tone: 'annoyed' },
    ],
    heart: [
      { text: '我只是记性好。才不是特意记得你的事。', tone: 'shy' },
      { text: '下雨就跟我一起走，别又忘带伞。', tone: 'shy' },
    ],
    romance: [
      { text: '……这种话别随便说。说了，我可会当真。', tone: 'shy' },
    ],
    giftLiked: [
      { text: '眼光还行。勉强算你很会挑。', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '收下了。下次别乱花钱。', tone: 'neutral' },
    ],
    giftDisliked: [
      { text: '你故意的吧？……算了，我还是收着。', tone: 'annoyed' },
    ],
    tea: [
      { text: '茶淡了点。不过有人陪着，勉强能喝。', tone: 'warm' },
    ],
    invite: [
      { text: '终于想起来留我？钥匙拿来。', tone: 'shy' },
    ],
  },
  taotao: {
    chat: [
      {
        text: '早呀！我刚去看了菜地，豆角又长高了一截。',
        tone: 'warm',
        condition: { time: 'morning' },
      },
      { text: '你来得正好！我刚画出一只歪耳朵兔子。', tone: 'warm' },
      { text: '今天做完什么了？说来听听。', tone: 'warm' },
      { text: '累了就坐会儿。我刚烧好一壶水。', tone: 'neutral' },
      {
        text: '我把铜勺挂在厨房啦！每天看见它，就知道真的住下了。',
        tone: 'warm',
        condition: { livingAtHome: true },
      },
      {
        text: '昨晚我画了好多兔子，挑最好看的一只贴你门边。',
        tone: 'shy',
      },
      {
        text: '早上凉快，熬糖不容易糊锅。',
        tone: 'warm',
      },
      {
        text: '你吃早饭了吗？没吃的话，先分你一块不太甜的。',
        tone: 'worried',
      },
      {
        text: '天快黑了，我得把晒在外面的糖纸收回来。',
        tone: 'warm',
        condition: { time: 'evening' },
      },
      {
        text: '今天已经很努力啦。夜里不许偷偷把明天也做完。',
        tone: 'annoyed',
      },
      {
        text: '书房可以放一本兔子图册吗？我保证不把书页粘上糖。',
        tone: 'shy',
        condition: { room: 'study' },
      },
      {
        text: '厨房火候真稳！下次我能借一点小火熬糖吗？',
        tone: 'warm',
        condition: { room: 'kitchen' },
      },
      {
        text: '储藏间有个空罐子！拿来装糖签一定刚刚好。',
        tone: 'warm',
      },
      {
        text: '卧室窗上挂只小糖兔会化掉……那我画纸兔子吧！',
        tone: 'neutral',
      },
      {
        text: '客房床头放个水壶吧，来人晚上口渴不用找。',
        tone: 'warm',
      },
      {
        text: '我已经记住你喜欢什么样的兔子啦。耳朵要稍微歪一点。',
        tone: 'warm',
        condition: { minFriendship: 1 },
      },
      {
        text: '你今天心情不好就直说，不用装高兴。',
        tone: 'worried',
      },
      {
        text: '以后每个季节画一只兔子，贴在厨房墙上好不好？',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '刚才那只麻雀差点偷走我的糖签！它眼光真好。', tone: 'warm' },
      { text: '这一锅糖熬坏了，我明天再做。浪费是有点心疼。', tone: 'neutral' },
      { text: '我学会画小乌龟了！虽然大家都说它像一块饼。', tone: 'warm' },
      { text: '你是不是又忘了休息？我都看见你揉眼睛啦。', tone: 'annoyed' },
      { text: '我今天画的第一只兔子有三只耳朵。就当它听得更清楚！', tone: 'warm' },
      { text: '铜勺敲一下是清脆的，敲两下就是叫你来吃糖。', tone: 'neutral' },
      { text: '做坏了也能吃，就是样子不好看。', tone: 'warm' },
      { text: '风把糖纸吹跑了三张，我只追回两张。', tone: 'warm' },
      { text: '你看起来没睡好。要不要先去躺一会儿？', tone: 'worried' },
      { text: '做完一件就是一件，别总说不算。', tone: 'annoyed' },
    ],
    heart: [
      { text: '我一高兴就想画兔子。最近画得特别多，你猜为什么？', tone: 'shy' },
      { text: '你不说话也没关系。我分你半块糖。', tone: 'warm' },
    ],
    romance: [
      { text: '那、那这只最好看的兔子给你。以后也都给你。', tone: 'shy' },
    ],
    giftLiked: [
      { text: '哇！你怎么知道我正想要这个？', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '谢谢你！我也得想想回礼了。', tone: 'warm' },
    ],
    giftDisliked: [
      { text: '唔，我可能不太会用这个……但还是谢谢你。', tone: 'worried' },
    ],
    tea: [
      { text: '喝茶吗？我拿了两块麦芽糖。', tone: 'warm' },
    ],
    invite: [
      { text: '真的？那我把铜勺和兔子们都搬来！', tone: 'warm' },
    ],
  },
}

export function dialogueEntriesFor(
  npcId: string,
  kind: DialogueKind,
): readonly DialogueEntry[] {
  return CORE_DIALOGUE[npcId]?.[kind] ?? []
}

const GENERIC_DIALOGUE: Record<DialogueKind, DialogueEntry> = {
  chat: { text: '你们聊了聊今天各自做的事。', tone: 'neutral' },
  heart: { text: '你们说了一些平时不会提的事。', tone: 'warm' },
  romance: { text: '对方听完后答应了。', tone: 'shy' },
  giftLiked: { text: '对方很喜欢这份礼物。', tone: 'warm' },
  giftNeutral: { text: '对方收下了礼物。', tone: 'neutral' },
  giftDisliked: { text: '对方收下礼物，但似乎不太喜欢。', tone: 'worried' },
  tea: { text: '你们喝完茶，又聊了一会儿。', tone: 'warm' },
  invite: { text: '对方答应入住。', tone: 'warm' },
}

function conditionMatches(
  state: GameState,
  npcId: string,
  condition: DialogueCondition | undefined,
  now: Date,
): boolean {
  if (!condition) return true
  const progress = state.npc[npcId]
  if (!progress) return false
  if (
    condition.livingAtHome !== undefined &&
    progress.livingAtHome !== condition.livingAtHome
  ) {
    return false
  }
  if (condition.room && !hasRoomType(state.rooms, condition.room)) return false
  if (
    condition.minFriendship !== undefined &&
    friendshipStage(progress.friendshipPoints) < condition.minFriendship
  ) {
    return false
  }
  const hour = now.getHours()
  if (condition.time === 'morning' && (hour < 5 || hour >= 12)) return false
  if (condition.time === 'evening' && (hour < 18 || hour >= 24)) return false
  return true
}

export function dialogueFor(
  state: GameState,
  npcId: string,
  kind: DialogueKind,
  index = 0,
  now = new Date(),
): DialogueState {
  const entries = CORE_DIALOGUE[npcId]?.[kind]
  if (!entries?.length) {
    return {
      entryId: `generic-${kind}`,
      npcId,
      kind,
      ...GENERIC_DIALOGUE[kind],
    }
  }
  const eligible = entries
    .map((entry, sourceIndex) => ({ entry, sourceIndex }))
    .filter(({ entry }) => conditionMatches(state, npcId, entry.condition, now))
    .sort(
      (a, b) =>
        Number(Boolean(b.entry.condition)) - Number(Boolean(a.entry.condition)),
    )
  const seen = new Set(state.npc[npcId]?.seenDialogueIds ?? [])
  const unread = eligible.find(
    ({ sourceIndex }) => !seen.has(`${npcId}-${kind}-${sourceIndex}`),
  )
  const selected = unread ?? eligible[index % eligible.length]
  return {
    entryId: `${npcId}-${kind}-${selected.sourceIndex}`,
    npcId,
    kind,
    text: selected.entry.text,
    tone: selected.entry.tone,
  }
}

const COMPLETION_REACTIONS: Record<
  string,
  Record<Difficulty, readonly string[]>
> = {
  shendu: {
    small: ['做完就好。先歇一会儿。', '完成了。下一件不用急着开始。'],
    medium: ['这件事不轻，你还是做完了。', '忙了挺久吧？先吃点东西。'],
    large: ['这么难也做到了。今晚可以安心些。', '这事确实难，你处理得很好。'],
  },
  guwan: {
    small: ['还不错。至少没拖到明天。', '做完了？那就别偷偷挑自己的毛病。'],
    medium: ['哼，这次确实值得夸一句。', '动作挺快。看来我不用替你着急了。'],
    large: ['……真做完了。好吧，我很佩服。', '这么大的事都扛下来了，厉害。只说一次。'],
  },
  taotao: {
    small: ['完成啦！给你画一只小兔子！', '做完一件啦，记得歇会儿！'],
    medium: ['哇，这件事值得一整块糖！', '你做到了！我要画只举旗子的兔子！'],
    large: ['太厉害了！今天要画最大的一只兔子！', '这么难都完成了，晚上得加个菜！'],
  },
}

export function completionReactionFor(
  state: GameState,
  task: Task,
): { npcId: string; text: string } {
  const available = ['shendu', 'guwan', 'taotao'].filter(
    (npcId) => state.npc[npcId]?.met,
  )
  const fallback = available.length > 0 ? available : ['shendu']
  const completedCount = state.tasks.filter((item) => item.done).length
  const npcId = fallback[completedCount % fallback.length]
  const lines = COMPLETION_REACTIONS[npcId][task.difficulty]
  return { npcId, text: lines[completedCount % lines.length] }
}
