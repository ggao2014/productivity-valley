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
        text: '门边给竹篙留的位置刚刚好。回来时，一眼就能看见灯。',
        tone: 'warm',
        condition: { livingAtHome: true },
      },
      { text: '水面今天很静。你呢，忙完了吗？', tone: 'neutral' },
      { text: '别急着赶下一件。先在这儿站一会儿。', tone: 'warm' },
      { text: '风从那边来。要是顺路，我送你一程。', tone: 'warm' },
      {
        text: '昨晚门闩有点松，我顺手修好了。你不用惦记。',
        tone: 'neutral',
      },
      {
        text: '屋里有人留灯，走夜路时会觉得近很多。',
        tone: 'shy',
      },
      {
        text: '晨雾还没散。河面像一张没写过的纸。',
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
        text: '客房收拾得很干净。有人来时，不会觉得是过客。',
        tone: 'warm',
      },
      {
        text: '你已经走过不少路了。偶尔回头看，也不算停下。',
        tone: 'warm',
        condition: { minFriendship: 1 },
      },
      {
        text: '有事就叫我。隔着河也听不见，但我会常来看。',
        tone: 'warm',
      },
      {
        text: '我不太擅长告别。所以你回来，我会一直在。',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '河边那块石头晒暖了，坐着正好。', tone: 'neutral' },
      { text: '今天的风有稻草味。上游大概在收粮。', tone: 'neutral' },
      { text: '鞋底沾了泥也没关系。路走过，总会留下点什么。', tone: 'warm' },
      { text: '你眉头皱得太久了。先松一松，事情跑不了。', tone: 'worried' },
      { text: '竹篙上的旧裂纹还撑得住。旧东西也有旧东西的办法。', tone: 'neutral' },
      { text: '水急的时候别硬撑，绕一点路不算退。', tone: 'worried' },
      { text: '我带了两个饭团。原本就打算吃两个，你别多想。', tone: 'shy' },
      { text: '云影走得快，河水却记得它们来过。', tone: 'neutral' },
      { text: '忙完这一件，就认真歇一会儿。我会提醒你。', tone: 'warm' },
      { text: '你今天做得够多了。剩下的交给明天的你。', tone: 'warm' },
    ],
    heart: [
      { text: '我不太会说好听的话。不过，你来时，我总能认出来。', tone: 'shy' },
      { text: '有些话像水底的石头。看不见，但一直都在。', tone: 'neutral' },
    ],
    romance: [
      { text: '我听明白了。以后，你不用一个人等船。', tone: 'shy' },
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
      { text: '茶还热。今天的事，慢慢说。', tone: 'warm' },
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
        text: '这么早就醒？太阳都还没准备好见你。',
        tone: 'annoyed',
        condition: { time: 'morning' },
      },
      {
        text: '晨露重，石阶滑。走慢点，我不想扶第二次。',
        tone: 'worried',
      },
      {
        text: '都这个时辰了，还在想事情？脑子也得关门。',
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
      { text: '伞可以分你一半。再多就没有了。', tone: 'shy' },
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
        text: '早呀！晨光最适合画透明的糖翅膀。',
        tone: 'warm',
        condition: { time: 'morning' },
      },
      { text: '你来得正好！我刚画出一只歪耳朵兔子。', tone: 'warm' },
      { text: '今天做完了什么？说来听听，我给你画个糖。', tone: 'warm' },
      { text: '累了就坐下。糖丝要慢慢绕，日子也是。', tone: 'neutral' },
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
        text: '早上的糖最听话，凉得慢，还会透一点金光。',
        tone: 'warm',
      },
      {
        text: '你吃早饭了吗？没吃的话，先分你一块不太甜的。',
        tone: 'worried',
      },
      {
        text: '晚霞像刚熬好的糖浆！再等一会儿就会凝住。',
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
        text: '客房床头放颗糖，远道来的人醒来就不会太陌生。',
        tone: 'warm',
      },
      {
        text: '我已经记住你喜欢什么样的兔子啦。耳朵要稍微歪一点。',
        tone: 'warm',
        condition: { minFriendship: 1 },
      },
      {
        text: '你不开心的时候不用笑。我可以先替你开心一会儿。',
        tone: 'worried',
      },
      {
        text: '以后每个季节我都画一只兔子。我们会有好长一排。',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '刚才那只麻雀差点偷走我的糖签！它眼光真好。', tone: 'warm' },
      { text: '糖丝断了可以重新绕，今天没做好也可以明天再来。', tone: 'neutral' },
      { text: '我学会画小乌龟了！虽然大家都说它像一块饼。', tone: 'warm' },
      { text: '你是不是又忘了休息？我都看见你揉眼睛啦。', tone: 'annoyed' },
      { text: '我今天画的第一只兔子有三只耳朵。就当它听得更清楚！', tone: 'warm' },
      { text: '铜勺敲一下是清脆的，敲两下就是叫你来吃糖。', tone: 'neutral' },
      { text: '别怕做坏呀。最丑的那块糖也可以留给我吃。', tone: 'warm' },
      { text: '风把糖纸吹跑了三张，我追回两张。另一张去旅行啦。', tone: 'warm' },
      { text: '你今天的眼睛有点暗。先借你一只亮晶晶的兔子。', tone: 'worried' },
      { text: '完成一小件也要算数！不许把自己的努力偷偷擦掉。', tone: 'annoyed' },
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
      { text: '茶配糖，今天就会甜一点。', tone: 'warm' },
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
  chat: { text: '你们在小路边聊了一会儿。', tone: 'neutral' },
  heart: { text: '有些话说出口以后，你们更亲近了。', tone: 'warm' },
  romance: { text: '对方认真听完，轻轻点了点头。', tone: 'shy' },
  giftLiked: { text: '这份礼物正合心意。', tone: 'warm' },
  giftNeutral: { text: '礼物被认真收下了。', tone: 'neutral' },
  giftDisliked: { text: '对方收下礼物，神情有些为难。', tone: 'worried' },
  tea: { text: '一壶茶见了底，时间过得很快。', tone: 'warm' },
  invite: { text: '对方答应留下来。', tone: 'warm' },
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
    small: ['做完就好。先歇一会儿。', '水慢慢走，事情也一件件来。'],
    medium: ['这件事不轻。你还是稳稳做完了。', '今天走了挺远，别忘了看看风景。'],
    large: ['这么难也做到了。今晚可以安心些。', '我看见了。你比自己想的更有韧劲。'],
  },
  guwan: {
    small: ['还不错。至少没拖到明天。', '做完了？那就别偷偷挑自己的毛病。'],
    medium: ['哼，这次确实值得夸一句。', '动作挺快。看来我不用替你着急了。'],
    large: ['……真做完了。好吧，我很佩服。', '这么大的事都扛下来了，厉害。只说一次。'],
  },
  taotao: {
    small: ['完成啦！给你画一只小兔子！', '又点亮一小格，今天真不错！'],
    medium: ['哇，这件事值得一整块糖！', '你做到了！我要画只举旗子的兔子！'],
    large: ['太厉害了！今天要画最大的一只兔子！', '这么难都完成了，山谷都亮起来啦！'],
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
