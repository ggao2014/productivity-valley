# 扩展镇民素材 V1

本批素材补齐青禾、姜小满、陈拾、林初、白芷、苏未名、岳青衫、温九、河灯九人。所有生成图均使用项目既有水彩绘本美术作为参考，运行时导出由 `scripts/export_extended_character_sheets.py`、`scripts/export_extended_character_sprites.py` 和 `scripts/export_extended_event_illustrations.py` 完成。

## 共同视觉约束

- 成人设定图采用约 6.5–7 头身；远景采用 3–3.3 头身的成人 Q 版。
- 远景面部使用更简单、偏童真的几何形，但只简化画法，不把人物变成儿童。
- 媒介统一为中国乡野绘本式水彩、墨铅笔线、低饱和天然颜料、纸张颗粒。
- 禁止通用仙侠长袍、发光魔法、现代物件、亮面动漫渲染和文字标签。
- 角色差异优先依靠体型、重心、发型、配色与职业道具，不依靠换色。

## 九人身份锚点

| ID | 体型与姿态 | 发型与面部 | 固定配色 | 识别物 |
|---|---|---|---|---|
| `qinghe` | 粗壮、宽肩、落地稳 | 单根粗辫、浓眉 | 稻叶绿、赭黄、麻色 | 种袋、锄头 |
| `jiangxiaoman` | 圆润结实、直率 | 围巾高髻、圆脸 | 砖红、南瓜橙、米白 | 围裙、腌菜坛 |
| `chenshi` | 瘦削、松散、微驼 | 旧头巾、短须 | 芥末黄、旧青绿 | 小袋、旧货匣 |
| `linchu` | 方正厚实、重心低 | 极小低髻、胡茬 | 木棕、苔绿、麻色 | 木工围裙、角尺、工具箱 |
| `baizhi` | 高挑纤细、前倾观察 | 偏侧长辫、碎发 | 鼠尾草绿、灰紫、象牙白 | 草药篮、标本夹 |
| `suweiming` | 高挑舒展、手势大 | 半束长发、动眉 | 靛蓝、梅紫、白 | 墨渍袖、手稿 |
| `yueqingshan` | 短宽、对称、笔直 | 紧高髻、平直浓眉 | 森林绿、炭黑 | 木练剑、木哨 |
| `wenjiu` | 高瘦、竖向、整齐 | 低束发、长脸 | 藏蓝、板岩灰、银灰 | 钥匙串、账册 |
| `hedeng` | 瘦长、歪斜、失衡 | 松侧髻、乱发 | 蓝紫、象牙白、琥珀色 | 油壶、灯骨、歪鹅灯 |

## 成人角色母图模板

实际生成时为每人传入所属三人阵容锚点，以及一张核心角色母图作为版式参考，并将下列模板中的方括号替换为上表身份锚点与五种个性化表情。

```text
Use case: identity-preserve.
Asset type: full game character model sheet for [character].
Image 1 is the exact identity anchor; preserve only [character]. Image 2 is layout and rendering reference only.
Create a polished vertical character sheet on warm blank rice paper. Upper section: one large complete front three-quarter full-body view and one smaller complete rear three-quarter full-body view. Lower section: exactly five shoulder-up portraits of the same identity, ordered neutral, warm, worried, annoyed, shy.
Preserve [body, posture, hair, face, palette, outfit and props]. Chinese picture-book watercolor, ink-pencil linework, muted pigments and parchment grain; normal adult anatomy around 6.5–7 heads.
Exactly two full-body views plus five busts; no labels, text, extra people, fantasy, modern items, glossy anime, border or watermark. Do not crop hands, shoes, hair or signature props.
```

五态的个性化表演分别为：

- 青禾：平静务实；大笑；担心病苗；被劝停工时不悦；说快喜欢后的害羞。
- 姜小满：直率；爽朗大笑；担心饭菜失手；厨房被干涉时恼火；被认真夸奖时害羞。
- 陈拾：观察；狡黠友好；消息说错后的担忧；边界被越过时不悦；真诚被看穿后的不好意思。
- 林初：沉着；极小的满意；图纸返工时担忧；榫卯差一线时不悦；接受照料时拘谨。
- 白芷：偏头观察；发现标本时明亮；担心辨认错误；标本被乱动时不悦；肩上小虫被靠近观察时害羞。
- 苏未名：收住表演的平静；讲到兴头；信件误期时担忧；故事被擅读时不悦；不用比喻直说时害羞。
- 岳青衫：正式中性；克制自豪；听见远雷后担忧；秩序被打乱时不悦；仍努力保持端正的害羞。
- 温九：审视；极淡满意；发现记忆不符时担忧；面对杂乱时不悦；第三次敲门后的害羞。
- 河灯：歪头好奇；恶作剧般大笑；忘记时间后担忧；看到灯会垃圾时不悦；笨拙害羞的笑。

## 远景三态模板

每人以个人母图为身份参考、`core-chibi-v1.png` 为比例参考。背景使用纯洋红键控色，之后由脚本拆分和去色。

```text
Use case: identity-preserve.
Asset type: three-state distant game sprite sheet for [character].
Create exactly three separate full-body chibi drawings on one horizontal sheet, evenly spaced: LEFT idle front three-quarter with [signature prop]; CENTER walk-away rear three-quarter with [rear identity cues]; RIGHT move-in front three-quarter stepping forward with a tied bedding bundle and [signature prop].
Preserve [identity anchor]. Simplify the face into childlike distant-game geometry while retaining adult identity cues. Chinese picture-book watercolor and ink-pencil texture; 3–3.3 heads tall adult chibi, muted pigments, clean silhouette, no ground shadow.
Background perfectly uniform solid chroma magenta #ff00ff edge to edge. Exactly three figures, no labels, text, extra people, crop, overlap, fantasy, modern items or glossy anime.
```

运行时映射：左栏为 `sprite`，中栏为 `walk-away`，右栏为 `move-in`。

## 关系事件双场景模板

每人生成一张友情／爱情双场景母图。生成器偶尔返回横向画布，但仍要求上下两格；导出脚本按中线拆分，并使用 3:2 焦点裁切。

```text
Use case: identity-preserve.
Asset type: two-panel relationship event illustration sheet for [character].
Create exactly TWO separate wide cinematic watercolor scenes stacked TOP and BOTTOM, equal height, divided by a narrow blank parchment gutter, no border or text.
TOP friendship scene: [friendship action grounded in the character's work and conflict].
BOTTOM romance scene: [ordinary shared action that shows trust or negotiated closeness]. Show only a small first-person hand, knee or shoulder at the foreground edge; never define a full player body or face.
Chinese rural picture-book watercolor, fine ink-pencil linework, muted pigments, textured paper and adult anatomy. Preserve [identity anchor]. Exactly one named NPC per panel; no labels, speech bubbles, UI, glamour pose, fantasy, modern items, glossy anime or watermark. Each scene must remain readable as its own wide crop.
```

| ID | 友情场景 | 爱情场景 |
|---|---|---|
| `qinghe` | 田边教玩家留种，把豆子放回掌心 | 放下工具，在田埂分享饭团并笑着看歪苗 |
| `jiangxiaoman` | 公共厨房举起空盘，桌上是照顾不同口味的饭菜 | 被请出灶台，坐下吃玩家做的一顿普通饭 |
| `chenshi` | 市集旧货摊认真登记寄卖物，不编来路 | 黄昏长路上安静同行，不推销也不讲故事 |
| `linchu` | 木工棚递出第三张修订草图 | 两张工作台并排，用蝴蝶榫保留旧裂痕 |
| `baizhi` | 一起比较两片相似叶并翻标本册 | 肩上停着小虫，靠近一起辨认 |
| `suweiming` | 在茶棚为自己装订的手稿署名 | 灯下合上私人手稿，留一张空白页直说 |
| `yueqingshan` | 雷雨前取消训练、点名并分发木哨 | 山路岔口不催促，递水等玩家走到同一速度 |
| `wenjiu` | 将钥匙簿公开挂起并扶正 | 明明有钥匙仍站在门外先敲三次门 |
| `hedeng` | 清晨与玩家回收河里的湿灯骨和残蜡 | 白天赶集比较灯油价格，为歪竹篮讲价 |

## 输出与检查

- 成人阵容与母图：`art-source/characters/extended/`
- 表情裁切源：`art-source/characters/expressions-extended/`
- 三态键控源：`art-source/characters/sprites-chroma-extended/`
- 三态透明源：`art-source/characters/sprites-alpha-extended/`
- 事件母图：`art-source/events/extended/`
- 运行时：`public/art/characters/` 与 `public/art/events/`
- 接触表：`extended-expression-contact-sheet-v1.jpg`、`extended-states-contact-sheet-v1.jpg`、`extended-events-contact-sheet-v1.jpg`
