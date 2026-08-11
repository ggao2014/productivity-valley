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
        text: '对了，如果下雨麻烦帮我收一下蓑衣',
        tone: 'neutral',
        condition: { livingAtHome: true },
      },
      {
        text: '上午水位还行，能过河',
        tone: 'neutral',
        condition: { time: 'morning' },
      },
      {
        text: '收船了',
        tone: 'neutral',
        condition: { time: 'evening' },
      },
      {
        text: '借张纸',
        tone: 'neutral',
        condition: { room: 'study' },
      },
      {
        text: '姜还有吗？',
        tone: 'warm',
        condition: { room: 'kitchen' },
      },
      {
        text: '早',
        tone: 'worried',
        condition: { minFriendship: 1 },
      },
      {
        text: '别掉河里了',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '今天风挺大', tone: 'neutral' },
      { text: '羊不让上船', tone: 'annoyed' },
      { text: '牛不让上船', tone: 'annoyed' },
      { text: '渡河五文钱', tone: 'neutral' },
      { text: '对，渡河还是五文钱', tone: 'neutral' },
      { text: '那破桥什么时候能修一下', tone: 'warm' },
      { text: '小心点，昨天青禾就从这儿掉河里了', tone: 'neutral' },
      { text: '桃桃那天非得推车上船，懒得搭理她', tone: 'warm' },
      { text: '林初终于来修栈桥了', tone: 'shy' },
      { text: '摆渡能赚几个钱？填饱肚子罢了', tone: 'neutral' },
      { text: '以前跟船队走过几年，还是大船稳当', tone: 'warm' },
      { text: '船底有块板得换了', tone: 'worried' },
      { text: '去镇上走走不？', tone: 'neutral' },
      { text: '唉唉别站在船头', tone: 'annoyed' },
      { text: '别碰那个！', tone: 'worried' },
      { text: '今天出不了船，要下雨', tone: 'neutral' },
      { text: '今天出不了船。唉加钱也没用，风太大了', tone: 'neutral' },
      { text: '老头最近咳得厉害', tone: 'worried' },
      { text: '老头挺好，谢谢关心', tone: 'neutral' },
      { text: '坐', tone: 'warm' },
      { text: '等送走老头我就不在这儿划船了', tone: 'annoyed' },
    ],
    heart: [
      {
        text: '那狗娃又半夜带着一帮娃子去凫水，给我逮个正着',
        tone: 'worried',
      },
      { text: '水烧好了，泡了脚再睡吧', tone: 'warm' },
    ],
    romance: [
      {
        text: '早。我..我家的屋顶漏水了。不知道你还有没有空房间？',
        tone: 'shy',
      },
    ],
    giftLiked: [
      { text: '好东西，谢谢！', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '放那吧，谢谢', tone: 'neutral' },
    ],
    giftDisliked: [
      { text: '这个？……船上放不下，你留着吧。', tone: 'neutral' },
    ],
    tea: [
      { text: '尝尝这个，镇上新买的', tone: 'warm' },
    ],
    invite: [
      { text: '好。', tone: 'warm' },
    ],
  },
  qinghe: {
    chat: [
      {
        text: '谁把我锄头拿走了？？',
        tone: 'annoyed',
        condition: { livingAtHome: true },
      },
      {
        text: '走，趁着凉快多干点活',
        tone: 'warm',
        condition: { time: 'morning' },
      },
      {
        text: '唉哟这天是要下雨，我刚拿出来晒的粮哟',
        tone: 'worried',
        condition: { time: 'evening' },
      },
      {
        text: '给我给我，小满切得也太埋汰了',
        tone: 'warm',
        condition: { room: 'kitchen' },
      },
      {
        text: '哦对了，我把你那旧箱子撇了。忒占地方',
        tone: 'annoyed',
        condition: { room: 'storage' },
      },
      {
        text: '前年老张头偷偷切我的水渠，我跟他打了好久。今年我天天瞅着，看他还咋偷！',
        tone: 'annoyed',
        condition: { minFriendship: 1 },
      },
      {
        text: '你看，杂草的叶子是这样的。别记错了',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      {
        text: '老张头把豆角种在东边那块地，都没翻翻土，我看他能收上来个啥！',
        tone: 'annoyed',
      },
      { text: '这豆子，真喜人。你看看多胖乎', tone: 'warm' },
      {
        text: '这活可拖不得。过了这季，我不想歇着也得歇着了。',
        tone: 'neutral',
      },
      { text: '咋咋呼呼啥，不就是个菜虫', tone: 'annoyed' },
      { text: '别傻站着，帮把手', tone: 'warm' },
      {
        text: '唉哟我的苗苗哟，怎么焦黄焦黄的了',
        tone: 'worried',
      },
      { text: '快放下快放下，你不会弄', tone: 'annoyed' },
      { text: '再不下雨连个种都留不下了', tone: 'annoyed' },
      { text: '早啊！我去给爹娘送点馍馍', tone: 'annoyed' },
      { text: '沈渡说午后涨水？我得赶快去通沟', tone: 'warm' },
      {
        text: '顾晚那张嘴真能叨叨，叨叨得我脑壳疼',
        tone: 'neutral',
      },
      {
        text: '今天去镇上切了块豆腐，让小满做个豆腐煲',
        tone: 'warm',
      },
      { text: '今年的麦芽长得不赖。一会儿告诉桃桃去', tone: 'warm' },
      {
        text: '陈拾的破菜种，又黑又瘪，能种出个啥？',
        tone: 'annoyed',
      },
      {
        text: '哈哈哈锄头不是这么抡的，你快一边玩去吧',
        tone: 'warm',
      },
      { text: '磨磨唧唧磨磨唧唧，边儿去，我来弄', tone: 'annoyed' },
      { text: '今天日头毒，你快回屋喝水吧', tone: 'warm' },
      { text: '别踩了我的苗！', tone: 'annoyed' },
      { text: '明天不下地了，得去给我娘帮帮厨', tone: 'neutral' },
      { text: '哎呀哎呀听我说完', tone: 'annoyed' },
      { text: '来来来，你认字不？帮我看看这个', tone: 'warm' },
    ],
    heart: [
      {
        text: '老张头倒是精得很呢，荒地自己不开，要抢我养好的地',
        tone: 'worried',
      },
      {
        text: '其实你干活也挺利索的，我就是闲不住',
        tone: 'neutral',
      },
    ],
    romance: [
      { text: '我也稀罕你', tone: 'shy' },
    ],
    giftLiked: [
      { text: '这个好！给，咱俩分着吃', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '先给我。早晚能用上', tone: 'neutral' },
    ],
    giftDisliked: [
      { text: '啥破玩意', tone: 'annoyed' },
    ],
    tea: [
      { text: '晾晾喝，天越热越不能急', tone: 'warm' },
    ],
    invite: [
      {
        text: '嘿嘿。以后家里菜圃给你归置得齐齐整整的',
        tone: 'warm',
      },
    ],
  },
  guwan: {
    chat: [
      {
        text: '你那脏手也不洗洗再来翻我的书！',
        tone: 'annoyed',
        condition: { livingAtHome: true },
      },
      {
        text: '催催催，没看见雾这么大，我能量个啥',
        tone: 'annoyed',
        condition: { time: 'morning' },
      },
      {
        text: '晚上吃啥？',
        tone: 'neutral',
        condition: { time: 'evening' },
      },
      {
        text: '窗边潮，放柜子里',
        tone: 'neutral',
        condition: { room: 'study' },
      },
      {
        text: '厨房后墙的排水沟浅了两指，会长霉的',
        tone: 'worried',
        condition: { room: 'kitchen' },
      },
      {
        text: '村头那两家又在那扯皮，下回再不给他们量了',
        tone: 'worried',
        condition: { minFriendship: 1 },
      },
      {
        text: '（展开包袱）这是标尺，这是墨线，这半个馍馍是早上吃剩下的',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '谁把界桩给偷走了？？', tone: 'annoyed' },
      {
        text: '我就是个照章办事的，我有啥办法。整得左右不是人',
        tone: 'neutral',
      },
      {
        text: '也不知道吃坏了啥，这两天净闹肚子',
        tone: 'annoyed',
      },
      { text: '哟呵，阁下今天容光焕发啊！', tone: 'warm' },
      { text: '去去去，别捣乱', tone: 'annoyed' },
      { text: '吃了吗您？', tone: 'neutral' },
      {
        text: '这把伞还是我姐姐搬出去之前做的，这么多年了还是好好的',
        tone: 'warm',
      },
      { text: '昨天睡得好吗？', tone: 'neutral' },
      {
        text: '不聊了，青禾又来找我掰扯水渠的事，溜了溜了',
        tone: 'warm',
      },
      {
        text: '今天瞅见沈渡了吗？我寻思去镇上一趟',
        tone: 'warm',
      },
      {
        text: '早啊！打牌？今天不去了，陈拾叫我喝酒',
        tone: 'warm',
      },
      { text: '你说桃桃最近怎么心事重重的？', tone: 'warm' },
      { text: '我当然也会做伞。给你做一把？', tone: 'neutral' },
      {
        text: '你猜怎么着，今天早上出门就碰见两只喜鹊，肯定要走运了',
        tone: 'warm',
      },
      { text: '啊别乱动！墨还没干！', tone: 'worried' },
      { text: '呸呸呸，这咸菜怎么长毛了', tone: 'annoyed' },
      {
        text: '别别别，请我吃饭也不能改田界，溜了溜了',
        tone: 'annoyed',
      },
      { text: '看我发现了个圆石头，真圆！', tone: 'neutral' },
      { text: '攒够钱我高低也要买块好墨', tone: 'warm' },
      {
        text: '别提了，昨天去南山测绘，走错三次！脚底都打泡了',
        tone: 'neutral',
      },
      {
        text: '脸再往右转一点，对对，马上就画好了',
        tone: 'warm',
      },
    ],
    heart: [
      { text: '我很爱挑刺儿吗？...对不起啊', tone: 'worried' },
      { text: '我这人最不爱欠人情', tone: 'neutral' },
    ],
    romance: [
      { text: '我听见了', tone: 'shy' },
    ],
    giftLiked: [
      {
        text: '哪儿来的栗子？别别别，别拿走，我喜欢我喜欢',
        tone: 'warm',
      },
    ],
    giftNeutral: [
      { text: '还行，放这儿吧。', tone: 'neutral' },
    ],
    giftDisliked: [
      { text: '这黏糊糊的玩意儿，你自己留着吃吧', tone: 'annoyed' },
    ],
    tea: [
      { text: '好茶', tone: 'warm' },
    ],
    invite: [
      { text: '行。我得要一间向阳的房', tone: 'warm' },
    ],
  },
  jiangxiaoman: {
    chat: [
      {
        text: '调料罐别乱挪！红盖子那个尤其别碰',
        tone: 'warm',
        condition: { livingAtHome: true },
      },
      {
        text: '起来起来！面都醒好啦',
        tone: 'warm',
        condition: { time: 'morning' },
      },
      {
        text: '终于收摊啦！',
        tone: 'worried',
        condition: { time: 'evening' },
      },
      {
        text: '这灶火太贼了，左边旺右边温',
        tone: 'warm',
        condition: { room: 'kitchen' },
      },
      {
        text: '哎呀是谁把我的坛子搁地上了？',
        tone: 'neutral',
        condition: { room: 'storage' },
      },
      {
        text: '小时候我家卖面，谁来了都喊我“小掌柜”',
        tone: 'neutral',
        condition: { minFriendship: 1 },
      },
      {
        text: '腌菜呢最怕心急啦，每一步都要慢慢来',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '今儿个有大席，来帮把手', tone: 'warm' },
      { text: '坏了坏了，盐放多了', tone: 'annoyed' },
      { text: '丑菜切了做咸菜，香喷喷', tone: 'warm' },
      { text: '这账算是要不回来了，得了，白忙活', tone: 'annoyed' },
      { text: '坐这儿吧。吃辣不？葱要吗？', tone: 'neutral' },
      {
        text: '哈哈哈你这一手面粉，别抹脸了，越抹越花',
        tone: 'warm',
      },
      { text: '来啦来啦，你先坐', tone: 'annoyed' },
      { text: '火别那么急，锅都糊了', tone: 'neutral' },
      { text: '青禾的韭菜又鲜亮味儿又足', tone: 'warm' },
      {
        text: '再不借锅给桃桃了，你看这把手，还是黏糊糊的',
        tone: 'warm',
      },
      { text: '陈拾又替我瞎接活！我都忙不过来了', tone: 'annoyed' },
      { text: '白芷闻香料比我还准，厉害了', tone: 'warm' },
      {
        text: '你尝尝这面头子。我跟我哥小时候就爱吃这个',
        tone: 'warm',
      },
      { text: '我才不要开大酒楼，累都累死了', tone: 'warm' },
      { text: '咸了加点醋就行，还有救', tone: 'annoyed' },
      {
        text: '今天是什么日子，怎么生意这么好。都没空喝口水',
        tone: 'worried',
      },
      { text: '吃了没？', tone: 'neutral' },
      { text: '火火火！看火！', tone: 'worried' },
      { text: '这酱成了！不愧是我', tone: 'warm' },
      { text: '等秋菜一来，我先腌上三坛', tone: 'warm' },
      { text: '今天想吃啥？', tone: 'annoyed' },
    ],
    heart: [
      { text: '一天忙到晚，啥时候是个头啊', tone: 'worried' },
      {
        text: '我跟你说，最近有个老汉天天来吃，边吃还边挑刺。我都服了',
        tone: 'annoyed',
      },
    ],
    romance: [
      { text: '好啦，我也喜欢你', tone: 'shy' },
    ],
    giftLiked: [
      { text: '好甜哦！等会儿给你做桂花糕', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '给我的？先搁这儿吧', tone: 'neutral' },
    ],
    giftDisliked: [
      { text: '这啥呀……你自己留着吃吧', tone: 'annoyed' },
    ],
    tea: [
      { text: '正好这锅糕要出炉了，边吃边喝', tone: 'warm' },
    ],
    invite: [
      { text: '行啊！锅放哪？', tone: 'warm' },
    ],
  },
  chenshi: {
    chat: [
      {
        text: '前阵子进了时兴的绢花，给你留了一个玩儿',
        tone: 'warm',
        condition: { livingAtHome: true },
      },
      {
        text: '不跟那勤快的抢，咱睡足了再出摊',
        tone: 'neutral',
        condition: { time: 'morning' },
      },
      {
        text: '天不早了，我先回屋了',
        tone: 'neutral',
        condition: { time: 'evening' },
      },
      {
        text: '这个别扔，我还有用。这个也别扔！',
        tone: 'neutral',
        condition: { room: 'storage' },
      },
      {
        text: '得买个新账本了',
        tone: 'neutral',
        condition: { room: 'study' },
      },
      {
        text: '早上好啊！',
        tone: 'neutral',
        condition: { minFriendship: 1 },
      },
      {
        text: '告诉你个秘密..',
        tone: 'worried',
        condition: { minFriendship: 3 },
      },
      {
        text: '您瞧这铜扣，岁数比我都大，真正的古董货',
        tone: 'warm',
      },
      { text: '这么便宜？保准有说法。', tone: 'neutral' },
      {
        text: '壶是补过两回，没补过可就不是这价儿了',
        tone: 'warm',
      },
      { text: '诶诶小心别摔了！这是全瓷的', tone: 'worried' },
      { text: '嘿嘿，谈钱伤感情', tone: 'annoyed' },
      { text: '一起赶集去不？', tone: 'warm' },
      {
        text: '早啊。我？我去找沈渡，上次赊了他船钱',
        tone: 'warm',
      },
      {
        text: '这是青禾托我买的家伙式儿，一会儿给她送去',
        tone: 'warm',
      },
      {
        text: '不是我吹，这十里八乡没有我不熟的',
        tone: 'worried',
      },
      { text: '小本买卖，哪有啥利润呢', tone: 'annoyed' },
      {
        text: '你来的正好！我一会儿就进货去，想要啥？',
        tone: 'shy',
      },
      { text: '这木料林初准喜欢', tone: 'neutral' },
      {
        text: '我跟你说，你可得保证不告诉其他人',
        tone: 'worried',
      },
      { text: '嗨，我们跑生意的就靠一张嘴', tone: 'neutral' },
      { text: '都是朋友，行个方便', tone: 'annoyed' },
      { text: '吃了么您？', tone: 'neutral' },
      { text: '走哇，喝酒去', tone: 'warm' },
      { text: '最近在哪发财呢？', tone: 'warm' },
      {
        text: '那事儿我也不清楚，不能说不能说。除非你保证不说出去是我告诉你的',
        tone: 'shy',
      },
      { text: '包在我陈拾身上', tone: 'warm' },
      { text: '乡里乡亲，赊个账怕啥的', tone: 'neutral' },
    ],
    heart: [
      {
        text: '嗨，我也不是从小就爱说笑话，那不是为了吆喝生意吗',
        tone: 'worried',
      },
      { text: '交给我吧，你放心', tone: 'neutral' },
    ],
    romance: [
      {
        text: '我本来备了三套漂亮话。算了，我喜欢您。货真价实',
        tone: 'shy',
      },
    ],
    giftLiked: [
      { text: '好东西！够意思', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '得嘞，您破费了', tone: 'warm' },
    ],
    giftDisliked: [
      { text: '得嘞，您破费了', tone: 'neutral' },
    ],
    tea: [
      { text: '您猜我今天碰见谁了？', tone: 'warm' },
    ],
    invite: [
      { text: '成嘞！都听你的', tone: 'warm' },
    ],
  },
  linchu: {
    chat: [
      {
        text: '小心手！',
        tone: 'neutral',
        condition: { livingAtHome: true },
      },
      {
        text: '早。我带了馍馍，你要吃吗？',
        tone: 'neutral',
        condition: { time: 'morning' },
      },
      {
        text: '天黑了，收工咯',
        tone: 'neutral',
        condition: { time: 'evening' },
      },
      {
        text: '这个架子有点朽了，明天我补一下',
        tone: 'neutral',
        condition: { room: 'storage' },
      },
      {
        text: '桌腿儿怎么不太稳？我瞅瞅',
        tone: 'neutral',
        condition: { room: 'study' },
      },
      {
        text: '师父老是嫌我慢，我心里再急手上也快不起来',
        tone: 'neutral',
        condition: { minFriendship: 1 },
      },
      {
        text: '给你打了一把新椅子，你试试',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '不行不行，得重做', tone: 'annoyed' },
      { text: '先别扔，我瞅瞅', tone: 'neutral' },
      { text: '吃饭了吗？', tone: 'neutral' },
      { text: '我雕了个小狗，给你', tone: 'warm' },
      {
        text: '青禾那锄柄我瞅着裂了好久了，她也不修修',
        tone: 'neutral',
      },
      { text: '门受潮了，得处理一下', tone: 'worried' },
      { text: '嗯？咋不准呢。我再量量', tone: 'annoyed' },
      { text: '坐。我忙完再招呼你', tone: 'worried' },
      {
        text: '你的柜子得再等一天了。沈渡叫我看看栈桥',
        tone: 'warm',
      },
      {
        text: '顾晚非要给我写个单子。要啥直接跟我说不就行了',
        tone: 'annoyed',
      },
      {
        text: '今天天气不错，我打了两斤酱牛肉，咱们出去喝一顿？',
        tone: 'neutral',
      },
      { text: '桃桃摊车轮子松了，多危险啊', tone: 'warm' },
      {
        text: '小满可太逗了，调料架还要雕花的。',
        tone: 'warm',
      },
      {
        text: '陈拾把那块木料吹上天了，我一看，有七个虫眼',
        tone: 'neutral',
      },
      {
        text: '我打的第一张凳子腿长短不一。现在垫箱子用',
        tone: 'warm',
      },
      { text: '这块边角料给你雕个小摆件吧', tone: 'neutral' },
      { text: '别急别急，都说慢工出细活', tone: 'worried' },
      { text: '顺手的事，不用给钱', tone: 'annoyed' },
      { text: '早，今天看着心情不错啊？', tone: 'warm' },
      {
        text: '我得去二里沟修个犁，有啥想让我带的吗？',
        tone: 'neutral',
      },
      { text: '我都行', tone: 'annoyed' },
    ],
    heart: [
      {
        text: '我不会说话，还是和木头打交道省心',
        tone: 'worried',
      },
      { text: '木工是精细活，差一点都不行', tone: 'annoyed' },
    ],
    romance: [
      { text: '我喜欢你。', tone: 'shy' },
    ],
    giftLiked: [
      { text: '纹理好，没暗裂。真不错', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '先放着', tone: 'neutral' },
    ],
    giftDisliked: [
      { text: '我用不上……谢谢', tone: 'neutral' },
    ],
    tea: [
      { text: '坐着歇会儿吧，喝口茶', tone: 'warm' },
    ],
    invite: [
      { text: '真的吗？我..我这就去收拾', tone: 'warm' },
    ],
  },
  baizhi: {
    chat: [
      {
        text: '药篓别揭开，容易受潮',
        tone: 'neutral',
        condition: { livingAtHome: true },
      },
      {
        text: '早呀！刚下过雨，我们去采蘑菇吧',
        tone: 'warm',
        condition: { time: 'morning' },
      },
      {
        text: '天黑啦，别忙啦，快来吃饭吧',
        tone: 'worried',
        condition: { time: 'evening' },
      },
      {
        text: '呀！有老鼠！！',
        tone: 'neutral',
        condition: { room: 'storage' },
      },
      {
        text: '这本书我借去压叶子啦',
        tone: 'neutral',
        condition: { room: 'study' },
      },
      {
        text: '昨天在药铺发现有贴错的标签！岂有此理',
        tone: 'neutral',
        condition: { minFriendship: 1 },
      },
      {
        text: '看，这棵就是白芷',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '别动别动！你肩上有只虫，好漂亮', tone: 'warm' },
      { text: '摸摸这片叶子，毛茸茸的', tone: 'warm' },
      { text: '这种花能吃的，你尝尝', tone: 'neutral' },
      { text: '不认识的别乱吃呀', tone: 'annoyed' },
      { text: '可是我只会认药，不会看病呀', tone: 'annoyed' },
      { text: '我只摘叶子，根是不拔的', tone: 'annoyed' },
      {
        text: '这里写着“秋天采”，今年好像都没有秋天',
        tone: 'neutral',
      },
      { text: '晒过头啦。颜色倒挺好看', tone: 'worried' },
      { text: '糟糕，标签弄混了！', tone: 'worried' },
      {
        text: '刚才青禾差点把我的草药当杂草扔了',
        tone: 'warm',
      },
      { text: '呀，你也在呀。今天天气真好', tone: 'annoyed' },
      { text: '尝尝我的百草茶', tone: 'warm' },
      {
        text: '你看小满，她竟然把我的草药炒了！o(╥﹏╥)o',
        tone: 'warm',
      },
      {
        text: '陈拾嫌我的药罐味儿大。谁让他把鼻子伸进去闻啦！',
        tone: 'warm',
      },
      {
        text: '最近好潮湿，不知道我的标本会不会坏掉',
        tone: 'worried',
      },
      { text: '你们别一起说呀，我听不过来', tone: 'annoyed' },
      { text: '越说别碰我的草药，大家越想碰', tone: 'neutral' },
      { text: '哇，这个是没见过的植物！好开心', tone: 'warm' },
      { text: '药圃得开出条路，我都没处下脚了', tone: 'neutral' },
      { text: '山谷里每个季节都有不同的花草', tone: 'warm' },
      { text: '你头发上粘草籽啦。我帮你摘', tone: 'warm' },
    ],
    heart: [
      {
        text: '呜呜呜是谁把我种的草药摘走了',
        tone: 'worried',
      },
      {
        text: '刚才走神了……你再说一遍好不好',
        tone: 'neutral',
      },
    ],
    romance: [
      { text: '我喜欢你。嘿嘿', tone: 'shy' },
    ],
    giftLiked: [
      { text: '橘皮好香！你闻闻', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '谢谢你', tone: 'neutral' },
    ],
    giftDisliked: [
      { text: '这味儿太冲啦，拿走拿走', tone: 'annoyed' },
    ],
    tea: [
      { text: '好茶好茶', tone: 'warm' },
    ],
    invite: [
      { text: '好呀！你家好漂亮呀', tone: 'warm' },
    ],
  },
  suweiming: {
    chat: [
      {
        text: '见笑了，这是不才新作的文章',
        tone: 'neutral',
        condition: { livingAtHome: true },
      },
      {
        text: '小生这厢有礼了',
        tone: 'neutral',
        condition: { time: 'morning' },
      },
      {
        text: '小生告退了',
        tone: 'warm',
        condition: { time: 'evening' },
      },
      {
        text: '见笑了——书房里也是不才新作',
        tone: 'neutral',
        condition: { room: 'study' },
      },
      {
        text: '咳咳咳，好大的灰尘。小生先行告退了',
        tone: 'worried',
        condition: { room: 'storage' },
      },
      {
        text: '足下贵安？',
        tone: 'neutral',
        condition: { minFriendship: 1 },
      },
      {
        text: '兄台！别来无恙？',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '小生今日抱恙，还请见谅', tone: 'neutral' },
      { text: '小生偶感风寒，还请见谅', tone: 'neutral' },
      { text: '小生这厢有礼了！', tone: 'worried' },
      { text: '足下贵安……？', tone: 'warm' },
      { text: '足下今日可好？', tone: 'warm' },
      { text: '什么！什么酸腐！读书人的事...', tone: 'annoyed' },
      { text: '读书人也逃不开孔方兄啊', tone: 'annoyed' },
      { text: '兄台，别来无恙？', tone: 'warm' },
      { text: '沈渡兄的文采...哈哈，不提也罢', tone: 'neutral' },
      { text: '足下贵安啊？', tone: 'warm' },
      { text: '贵安，足下', tone: 'annoyed' },
      { text: '这厢有礼了', tone: 'warm' },
      { text: '陈拾那厮..呔', tone: 'warm' },
      { text: '白芷倒是有几分见识', tone: 'neutral' },
      { text: '小生这厢……有礼了', tone: 'warm' },
      { text: '有礼有礼', tone: 'worried' },
      { text: '小生失礼了', tone: 'worried' },
      { text: '小生告罪', tone: 'annoyed' },
      { text: '鄙人的文章？哎呀呀足下好品味', tone: 'warm' },
      { text: '小生这厢再有一礼', tone: 'warm' },
      { text: '小生这厢有礼啦', tone: 'neutral' },
    ],
    heart: [
      { text: '总有一天，我的文章会被人看见', tone: 'worried' },
      { text: '考了十年不中...给人写写信渡日也好', tone: 'neutral' },
    ],
    romance: [
      { text: '小生不才，愿为足下效力', tone: 'shy' },
    ],
    giftLiked: [
      { text: '好..这...好！', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '小生这厢有礼了', tone: 'warm' },
    ],
    giftDisliked: [
      { text: '…', tone: 'neutral' },
    ],
    tea: [
      { text: '浮生偷得半日闲', tone: 'warm' },
    ],
    invite: [
      { text: '小生这厢有礼了', tone: 'warm' },
    ],
  },
  yueqingshan: {
    chat: [
      {
        text: '早点睡，不用等我',
        tone: 'neutral',
        condition: { livingAtHome: true },
      },
      {
        text: '晨巡开始。参与者一人……现为两人。出发。',
        tone: 'neutral',
        condition: { time: 'morning' },
      },
      {
        text: '大晚上的别在外面溜达，回去锁好门',
        tone: 'neutral',
        condition: { time: 'evening' },
      },
      {
        text: '库房怎么少了个箱子？',
        tone: 'neutral',
        condition: { room: 'storage' },
      },
      {
        text: '巡路图我贴墙上了',
        tone: 'neutral',
        condition: { room: 'study' },
      },
      {
        text: '最近山里有狼出没，别一个人去',
        tone: 'worried',
        condition: { minFriendship: 1 },
      },
      {
        text: '雷...我不是怕打雷！担心你怕而已',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '列队站好', tone: 'neutral' },
      {
        text: '剑不是这样拿的，这样转过来，对对',
        tone: 'annoyed',
      },
      { text: '山石有松动的迹象，行路要注意', tone: 'worried' },
      {
        text: '昨日风暴，家里篱笆还好吗？路边刮倒了两棵树',
        tone: 'annoyed',
      },
      {
        text: '昨夜宵禁后逮到两个娃子，扭送回家了',
        tone: 'neutral',
      },
      { text: '早安', tone: 'warm' },
      { text: '下雨天更得巡逻', tone: 'annoyed' },
      { text: '我习惯早起了', tone: 'neutral' },
      {
        text: '沈渡停渡，我支持。谁要是不服来跟我说',
        tone: 'warm',
      },
      {
        text: '多亏顾晚的塌坡标得准，好险没出事',
        tone: 'annoyed',
      },
      { text: '走快点，跟上', tone: 'neutral' },
      {
        text: '可不敢告诉陈拾，回头全村都知道了',
        tone: 'annoyed',
      },
      {
        text: '你的脚怎么扭到了？白芷说扭伤别乱揉。',
        tone: 'neutral',
      },
      { text: '看，林初给我做了个木哨', tone: 'warm' },
      { text: '早安。今天天气不错', tone: 'warm' },
      { text: '今天休息，只打三遍拳。', tone: 'worried' },
      {
        text: '咳咳..这雷...咳咳咳，怎么越来越响',
        tone: 'worried',
      },
      { text: '再跑五圈', tone: 'annoyed' },
      { text: '最近怎么没看见你来锻炼？', tone: 'warm' },
      {
        text: '我的肩膀无妨，活动活动更有助恢复',
        tone: 'neutral',
      },
      {
        text: '今天没什么大事发生，从树上救下来两只小猫',
        tone: 'warm',
      },
    ],
    heart: [
      {
        text: '确实，雷声怪吓人的。怕雷..很正常的，是吧？',
        tone: 'worried',
      },
      {
        text: '休息？我不知道闲下来该干什么。',
        tone: 'neutral',
      },
    ],
    romance: [
      { text: '回答如下：我也喜欢你。', tone: 'shy' },
    ],
    giftLiked: [
      { text: '保暖，便携用。我很喜欢。', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '收下。用途暂未确定。', tone: 'neutral' },
    ],
    giftDisliked: [
      { text: '不合用。', tone: 'neutral' },
    ],
    tea: [
      { text: '今日茶歇，无训练内容。你笑什么？', tone: 'warm' },
    ],
    invite: [
      { text: '好。', tone: 'warm' },
    ],
  },
  wenjiu: {
    chat: [
      {
        text: '你怎么又乱扔靴子',
        tone: 'neutral',
        condition: { livingAtHome: true },
      },
      {
        text: '早。今儿账多，不用叫我吃饭',
        tone: 'neutral',
        condition: { time: 'morning' },
      },
      {
        text: '灯灭了没？门闩上了没？我就问问',
        tone: 'neutral',
        condition: { time: 'evening' },
      },
      {
        text: '这堆货谁记的账？字我一个都不认识',
        tone: 'neutral',
        condition: { room: 'storage' },
      },
      {
        text: '账本在左边抽屉。别乱翻',
        tone: 'neutral',
        condition: { room: 'study' },
      },
      {
        text: '以前在大宅管账，东家忘了的事都来问我。',
        tone: 'neutral',
        condition: { minFriendship: 1 },
      },
      {
        text: '以前的事不提也罢',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '别硬拧门。坏了还得修', tone: 'annoyed' },
      { text: '屋顶别等漏了再修，早查早省钱', tone: 'neutral' },
      {
        text: '“过两天还”不算数。两天又过两天，就坏账了',
        tone: 'annoyed',
      },
      { text: '铜钱我都数三遍。', tone: 'neutral' },
      {
        text: '失物箱又满了。三只单鞋，没有一双成对的',
        tone: 'neutral',
      },
      { text: '今日日程...查修篱笆', tone: 'annoyed' },
      {
        text: '我记得是三号，账上写五号。先按账上的查，我可能记岔了',
        tone: 'worried',
      },
      { text: '这账对不上啊..', tone: 'annoyed' },
      { text: '我得再去催催林初', tone: 'warm' },
      { text: '顾晚那字，谁能看得懂？？', tone: 'warm' },
      { text: '陈拾又在路边瞎捡东西', tone: 'annoyed' },
      { text: '小满进屋从来不敲门！', tone: 'warm' },
      {
        text: '白芷老把药篓乱放，到处都是她那药味儿',
        tone: 'neutral',
      },
      {
        text: '苏未名似乎对我的老东家很感兴趣',
        tone: 'annoyed',
      },
      { text: '岳青衫这厮，话太多', tone: 'warm' },
      {
        text: '桌上那封信，提醒你三回了，你看了没？',
        tone: 'annoyed',
      },
      { text: '什么？不记得了', tone: 'shy' },
      { text: '谁把我椅子挪走了？', tone: 'worried' },
      { text: '公屋修缮记账一笔', tone: 'warm' },
      { text: '吃饭了没有？', tone: 'worried' },
      { text: '今天天气不错', tone: 'neutral' },
    ],
    heart: [
      {
        text: '人都说我记性好。越这么说，我越不敢忘',
        tone: 'worried',
      },
      { text: '你会不会觉得我烦？', tone: 'neutral' },
    ],
    romance: [
      { text: '我喜欢你', tone: 'shy' },
    ],
    giftLiked: [
      { text: '这个茶饼成色好。谢谢', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '给我的？先搁这儿', tone: 'warm' },
    ],
    giftDisliked: [
      { text: '用不上。拿回去吧', tone: 'neutral' },
    ],
    tea: [
      { text: '账合上了，休息。喝茶。', tone: 'warm' },
    ],
    invite: [
      { text: '好。钥匙我多配了一把', tone: 'warm' },
    ],
  },
  hedeng: {
    chat: [
      {
        text: '嘻嘻，这盏歪头鹅灯你喜欢吗？',
        tone: 'warm',
        condition: { livingAtHome: true },
      },
      {
        text: '快来看！太阳出来了',
        tone: 'warm',
        condition: { time: 'morning' },
      },
      {
        text: '今晚风太大，没办法出门啦',
        tone: 'warm',
        condition: { time: 'evening' },
      },
      {
        text: '别扔别扔，我还有用呢',
        tone: 'neutral',
        condition: { room: 'storage' },
      },
      {
        text: '你忙你的，我找本书看',
        tone: 'shy',
        condition: { room: 'study' },
      },
      {
        text: '告诉你个秘密，其实我小时候最怕黑。现在也有点怕啦',
        tone: 'shy',
        condition: { minFriendship: 1 },
      },
      {
        text: '这两盏灯你喜欢哪个？',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '这盏像鱼，那盏像蛤蟆。你猜哪盏本来想做兔子？', tone: 'warm' },
      { text: '嘶...又扎破手了', tone: 'annoyed' },
      { text: '好啊！你竟然在偷吃。让我看看你在吃什么', tone: 'warm' },
      { text: '今晚月色好美', tone: 'annoyed' },
      { text: '啦啦啦，啦啦啦，啦啦啦啦啦', tone: 'annoyed' },
      { text: '昨天我看见那位大叔在灯上写“少喝酒”。他写完就去喝了。', tone: 'warm' },
      { text: '镇上开了家新酒楼呢！', tone: 'neutral' },
      { text: '久等了!', tone: 'worried' },
      { text: '这盏是沈渡订的', tone: 'annoyed' },
      { text: '是谁把路修得这么弯的？累死我了', tone: 'neutral' },
      { text: '这盏鸭子灯给青禾好不好？', tone: 'warm' },
      { text: '早呀，我和桃桃今天要去赶集', tone: 'annoyed' },
      { text: '陈拾说镇上有大主顾要买我的灯呢', tone: 'warm' },
      { text: '白芷闻了我的灯油，打了六个喷嚏！', tone: 'warm' },
      { text: '给温九也做一盏歪头鹅...', tone: 'warm' },
      { text: '哎呀别看，那是我拿来练手的', tone: 'worried' },
      { text: '今天有人做寿，订了八盏红灯', tone: 'warm' },
      { text: '我最喜欢傍晚，凉爽又闲适', tone: 'neutral' },
      { text: '二里沟的路灯十六盏...沈渡的船灯四盏...再做两个歪头鹅', tone: 'warm' },
      { text: '不干啦不干啦，明天再做。', tone: 'neutral' },
      { text: '要去放风筝吗？', tone: 'warm' },
    ],
    heart: [
      { text: '每一盏灯我都舍不得扔', tone: 'worried' },
      { text: '希望年年有今朝', tone: 'neutral' },
    ],
    romance: [
      { text: '我本来写了好长一段...算了——我喜欢你。', tone: 'shy' },
    ],
    giftLiked: [
      { text: '这个好！谢谢你！', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '唔……暂时想不到拿它做什么，不过还是谢谢你！', tone: 'neutral' },
    ],
    giftDisliked: [
      { text: '唔……暂时想不到拿它做什么', tone: 'annoyed' },
    ],
    tea: [
      { text: '等一下，我做完这一点。茶还热吗？', tone: 'warm' },
    ],
    invite: [
      { text: '好啊好啊！天啊，我好期待', tone: 'warm' },
    ],
  },
  taotao: {
    chat: [
      {
        text: '早！别急别急，糖还得熬一会儿呢',
        tone: 'warm',
        condition: { time: 'morning' },
      },
      {
        text: '亲亲ლ(°◕‵ƹ′◕ლ) 给你做个糖兔子',
        tone: 'warm',
        condition: { livingAtHome: true },
      },
      {
        text: '收摊啦收摊啦',
        tone: 'neutral',
        condition: { time: 'evening' },
      },
      {
        text: '什么小鸡！我画的是凤凰！',
        tone: 'neutral',
        condition: { room: 'study' },
      },
      {
        text: '慢些慢些，熬糖要文火',
        tone: 'warm',
        condition: { room: 'kitchen' },
      },
      {
        text: '哎呀你可算起床了，快来快来看，福婶家小猫小崽儿了',
        tone: 'neutral',
        condition: { minFriendship: 1 },
      },
      {
        text: '来，坐这儿。这个专门给你留的座',
        tone: 'shy',
        condition: { minFriendship: 3 },
      },
      { text: '今天生意可好了！咱们去搓顿好的', tone: 'warm' },
      { text: '听青禾说今年麦芽长得不错', tone: 'warm' },
      {
        text: '刚才有人要画一头牛，画完他竟然说像狗！',
        tone: 'annoyed',
      },
      { text: '糟糕，糊了。难看归难看，还是很甜的', tone: 'neutral' },
      { text: '三根，六根，十根……谁偷吃了一根？？', tone: 'annoyed' },
      {
        text: '张大丫张二丫！不要再舔糖浆了！这根给你们',
        tone: 'worried',
      },
      {
        text: '哈哈过奖啦，我这个手艺练了好久才这么好的',
        tone: 'warm',
      },
      { text: '糟糕要下雨了，帮我收一下摊', tone: 'annoyed' },
      { text: '陈拾砍价怎么那么厉害，怕了他了', tone: 'annoyed' },
      {
        text: '上次用了小满的锅，我洗得干干净净还给她，还是被她嫌弃埋汰',
        tone: 'annoyed',
      },
      { text: '老虎？没问题，这就给你画', tone: 'warm' },
      {
        text: '铜勺旧是旧了点，又没坏。我用得顺手着呢！',
        tone: 'neutral',
      },
      {
        text: '嗨，这算什么。我嫂子画的龙才叫传神...一会儿收摊以后陪我去逛逛首饰店吧，嫂子生辰快到了',
        tone: 'warm',
      },
      { text: '破柴！破柴！又点不着', tone: 'worried' },
      { text: '（叹气）白忙了一天，倒赔一斤糖', tone: 'annoyed' },
      {
        text: '那边的小娃娃，姐姐给你画个小兔子好不好？',
        tone: 'warm',
      },
      { text: '看！我画的凤凰有进步没？', tone: 'warm' },
      {
        text: '呀，你的脸怎么这么白？快坐这儿，吃点糖歇会儿',
        tone: 'worried',
      },
      {
        text: '二丫她娘不让她来了，说糖吃多了虫牙',
        tone: 'annoyed',
      },
      { text: '好累，替我看会儿摊', tone: 'neutral' },
      { text: '等我有钱了，要换个带阳棚的大车！', tone: 'warm' },
    ],
    heart: [
      {
        text: '几文钱的小玩意也要砍价，白送他们得了',
        tone: 'annoyed',
      },
      {
        text: '我要让镇上的娃都知道我桃桃的糖画！',
        tone: 'worried',
      },
    ],
    romance: [
      { text: '你最好了！喜欢你❤', tone: 'shy' },
    ],
    giftLiked: [
      { text: '哇哇好喜欢，爱你（づ￣3￣）づ╭❤～', tone: 'warm' },
    ],
    giftNeutral: [
      { text: '给我的？嘻嘻', tone: 'warm' },
    ],
    giftDisliked: [
      { text: '嗯...好吧，谢谢你', tone: 'annoyed' },
    ],
    tea: [
      { text: '好烫好烫', tone: 'warm' },
    ],
    invite: [
      {
        text: '你终于问我啦！拿上这个，这个，这个。走！',
        tone: 'warm',
      },
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
  const contentVersion = [
    'shendu',
    'qinghe',
    'guwan',
    'jiangxiaoman',
    'chenshi',
    'linchu',
    'baizhi',
    'suweiming',
    'yueqingshan',
    'wenjiu',
    'hedeng',
    'taotao',
  ].includes(npcId)
    ? 3
    : null
  const contentOwnerId = contentVersion ? `${npcId}-v${contentVersion}` : npcId
  const seen = new Set(state.npc[npcId]?.seenDialogueIds ?? [])
  const unread = eligible.find(
    ({ sourceIndex }) => !seen.has(`${contentOwnerId}-${kind}-${sourceIndex}`),
  )
  const selected = unread ?? eligible[index % eligible.length]
  return {
    entryId: `${contentOwnerId}-${kind}-${selected.sourceIndex}`,
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
    small: ['收工。', '划掉。行。'],
    medium: ['干得不错。', '嗯，过了。'],
    large: ['真做完了。', '扛过来了。歇。'],
  },
  qinghe: {
    small: ['收工喽！', '划掉！漂亮！'],
    medium: ['干得漂亮！', '成了！击掌！'],
    large: ['太猛了！', '成了！庆祝！'],
  },
  guwan: {
    small: ['收工。合格。', '划掉。没问题。'],
    medium: ['干得不错。过。', '结果对了。'],
    large: ['佩服。', '收工。漂亮。'],
  },
  jiangxiaoman: {
    small: ['收工啦！', '利落！过关！'],
    medium: ['干得香！', '漂亮！先歇！'],
    large: ['全做完！加菜！', '成了！坐下！'],
  },
  chenshi: {
    small: ['收工喽！结了！', '划掉！成了！'],
    medium: ['干得漂亮！', '这笔成了！'],
    large: ['真有你的！', '漂亮！结了！'],
  },
  linchu: {
    small: ['收工咯。', '划掉。过。'],
    medium: ['干得牢。', '收得干净。'],
    large: ['成了。歇吧。', '收得住。好。'],
  },
  baizhi: {
    small: ['收工啦？', '划掉！亮了！'],
    medium: ['干得不错呀！', '成了！厉害！'],
    large: ['真做完了！', '好厉害！'],
  },
  suweiming: {
    small: ['收工喽。', '划掉。好。'],
    medium: ['这段成了。', '收笔。漂亮。'],
    large: ['真做成了。', '写上：成了。'],
  },
  yueqingshan: {
    small: ['收工。过。', '划掉。准。'],
    medium: ['目标达成。', '应变过关。'],
    large: ['干得漂亮！', '完成。庆祝！'],
  },
  wenjiu: {
    small: ['收工。记了。', '划掉。齐。'],
    medium: ['关账。漂亮。', '前后都齐。'],
    large: ['全做完了。', '核过。成了。'],
  },
  hedeng: {
    small: ['收工喽！嘻嘻', '划掉！快划！'],
    medium: ['成了！耶！', '厉害！嘻嘻'],
    large: ['全做完！走！', '哇——成了！'],
  },
  taotao: {
    small: ['收工喽！', '划掉！利落！'],
    medium: ['干得不错嘛！', '成了！不错！'],
    large: ['真办成了！', '厉害！加菜！'],
  },
}

export function completionReactionFor(
  state: GameState,
  task: Task,
): { npcId: string; text: string } {
  const available = Object.keys(COMPLETION_REACTIONS).filter(
    (npcId) => state.npc[npcId]?.met,
  )
  const fallback = available.length > 0 ? available : ['shendu']
  const completedCount = state.tasks.filter((item) => item.done).length
  const npcId = fallback[completedCount % fallback.length]
  const lines = COMPLETION_REACTIONS[npcId][task.difficulty]
  return { npcId, text: lines[completedCount % lines.length] }
}
