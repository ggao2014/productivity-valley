# 美术素材登记表

所有正式或候选素材都在这里记录。状态使用：`brief`、`candidate`、`selected`、`integrated`、`rejected`。

| ID | 文件 | 类型 | 状态 | 页面/用途 | 参考图 | Prompt 记录 | 备注 |
|---|---|---|---|---|---|---|---|
| ENV-VALLEY-A | `art-source/concepts/valley-direction-a.png` | 环境候选 | rejected | 山谷风格探索 | 无 | `docs/prompts/VALLEY_CONCEPTS.md` | 水彩气氛自然，但小屋扩建结构偏弱 |
| ENV-VALLEY-B | `art-source/concepts/valley-direction-b.png` | 环境候选 | rejected | 山谷风格探索 | 无 | `docs/prompts/VALLEY_CONCEPTS.md` | 分层强，但错误生成圆形站位符 |
| ENV-VALLEY-C | `art-source/concepts/valley-direction-c.png` | 环境候选 | selected | 山谷风格基准 | 无 | `docs/prompts/VALLEY_CONCEPTS.md` | 用户确认选择；小屋、路径、空地和扩建空间最清楚 |
| ENV-VALLEY-BASE-V1 | `art-source/environment/valley-base-v1.png` | 环境基准 | selected | 正式山谷底图与拆层参考 | ENV-VALLEY-C | `docs/prompts/VALLEY_BASE_V1.md` | 运行时压缩版：`public/art/environment/valley-base-v1.webp` |
| CHAR-CORE-LINEUP-V1 | `art-source/characters/core/core-lineup-v1.png` | 角色基准 | rejected | 三人比例探索 | ENV-VALLEY-BASE-V1 | `docs/prompts/CORE_CHARACTER_SET_V1.md` | 成年面容与 2.75 头身冲突，身体显得矮厚 |
| CHAR-SHENDU-SHEET-V1 | `art-source/characters/core/shendu-sheet-v1.png` | 角色设定 | rejected | 沈渡设定探索 | CHAR-CORE-LINEUP-V1 | 同上 | 依赖已作废的比例 |
| CHAR-GUWAN-SHEET-V1 | `art-source/characters/core/guwan-sheet-v1.png` | 角色设定 | rejected | 顾晚设定探索 | CHAR-CORE-LINEUP-V1 | 同上 | 依赖已作废的比例 |
| CHAR-TAOTAO-SHEET-V1 | `art-source/characters/core/taotao-sheet-v1.png` | 角色设定 | rejected | 桃桃设定探索 | CHAR-CORE-LINEUP-V1 | 同上 | 依赖已作废的比例 |
| CHAR-CORE-LINEUP-V2 | `art-source/characters/core/core-lineup-v2.png` | 角色基准 | rejected | 成人立绘共同基准 | ENV-VALLEY-BASE-V1 | `docs/prompts/CORE_CHARACTER_SET_V1.md` | 比例已修正，但两名男性脸型、发型和服装轮廓仍过于相似 |
| CHAR-CORE-LINEUP-V3 | `art-source/characters/core/core-lineup-v3.png` | 角色基准 | selected | 差异化成人立绘基准 | ENV-VALLEY-BASE-V1 | `docs/prompts/CORE_CHARACTER_SET_V3.md` | 用户确认；沈渡低髻柔和竖向，顾晚高髻锐利斜向 |
| CHAR-CORE-CHIBI-V1 | `art-source/characters/core/core-chibi-v1.png` | 远景小人基准 | selected | 山谷 56–80px 角色 | CHAR-CORE-LINEUP-V3 | `docs/prompts/CORE_CHARACTER_SET_V3.md` | 用户确认；独立 Q 化面容 |
| CHAR-SHENDU-SHEET-V2 | `art-source/characters/core/shendu-sheet-v2.png` | 角色设定 | selected | 正背面与五表情 | CHAR-CORE-LINEUP-V3 | `docs/prompts/CORE_CHARACTER_SHEETS_V2.md` | 已作为五态头像、背面状态与事件图的正式参考母图 |
| CHAR-GUWAN-SHEET-V2 | `art-source/characters/core/guwan-sheet-v2.png` | 角色设定 | selected | 正背面与五表情 | CHAR-CORE-LINEUP-V3 | `docs/prompts/CORE_CHARACTER_SHEETS_V2.md` | 已作为五态头像、背面状态与事件图的正式参考母图 |
| CHAR-TAOTAO-SHEET-V2 | `art-source/characters/core/taotao-sheet-v2.png` | 角色设定 | selected | 正背面与五表情 | CHAR-CORE-LINEUP-V3 | `docs/prompts/CORE_CHARACTER_SHEETS_V2.md` | 已作为五态头像、背面状态与事件图的正式参考母图 |
| CHAR-EXTENDED-LINEUPS-V1 | `art-source/characters/extended/extended-lineup-{a,b,c}-v1.png` | 角色基准 | selected | 九位扩展镇民差异化基准 | CHAR-CORE-LINEUP-V3 | `docs/prompts/EXTENDED_NPC_ASSETS_V1.md` | 三组各三人；固定体型、发型、配色与职业道具 |
| CHAR-EXTENDED-SHEETS-V1 | `art-source/characters/extended/*-sheet-v1.png` | 角色设定 | selected | 九位扩展镇民正背面与五表情 | CHAR-EXTENDED-LINEUPS-V1 | `docs/prompts/EXTENDED_NPC_ASSETS_V1.md` | 青禾至河灯共九张；运行时头像由同母图定点裁切 |
| CHAR-EXTENDED-EXPRESSIONS-V1 | `public/art/characters/{portraits,expressions}/*-v1.webp` | 对话头像组 | integrated | 九位扩展镇民资料、互动与对话 | CHAR-EXTENDED-SHEETS-V1 | `docs/prompts/EXTENDED_NPC_ASSETS_V1.md` | 每人标准头像 1 张、五态头像 5 张；320×512 WebP |
| CHAR-EXTENDED-STATES-V1 | `public/art/characters/{sprites,states}/*-v1.webp` | 远景状态组 | integrated | 九位扩展镇民院内待机、离开与搬入 | CHAR-EXTENDED-SHEETS-V1、CHAR-CORE-CHIBI-V1 | `docs/prompts/EXTENDED_NPC_ASSETS_V1.md` | 每人 3 张透明 WebP；3–3.3 头身，远景面部简化 |
| EVENT-EXTENDED-SET-V1 | `public/art/events/{qinghe,jiangxiaoman,chenshi,linchu,baizhi,suweiming,yueqingshan,wenjiu,hedeng}-{friendship,romance}-v1.webp` | 关系事件插画组 | integrated | 九位扩展镇民友情与爱情回忆 | CHAR-EXTENDED-SHEETS-V1 | `docs/prompts/EXTENDED_NPC_ASSETS_V1.md` | 共 18 张；1200×800 WebP；第一人称在场但不固定玩家外貌 |
| CHAR-SHENDU-SPRITE-V1 | `public/art/characters/sprites/shendu-sprite-v1.webp` | 远景 sprite | integrated | 山谷可点击角色 | CHAR-CORE-CHIBI-V1 | `docs/prompts/CORE_CHARACTER_SPRITES_V1.md` | 透明 WebP；源 PNG 在 `art-source/characters/sprites-alpha/` |
| CHAR-GUWAN-SPRITE-V1 | `public/art/characters/sprites/guwan-sprite-v1.webp` | 远景 sprite | integrated | 山谷可点击角色 | CHAR-CORE-CHIBI-V1 | `docs/prompts/CORE_CHARACTER_SPRITES_V1.md` | 透明 WebP；源 PNG 在 `art-source/characters/sprites-alpha/` |
| CHAR-TAOTAO-SPRITE-V1 | `public/art/characters/sprites/taotao-sprite-v1.webp` | 远景 sprite | integrated | 山谷可点击角色 | CHAR-CORE-CHIBI-V1 | `docs/prompts/CORE_CHARACTER_SPRITES_V1.md` | 透明 WebP；源 PNG 在 `art-source/characters/sprites-alpha/` |
| CHAR-SHENDU-PORTRAIT-V1 | `public/art/characters/portraits/shendu-portrait-v1.webp` | 对话半身像 | integrated | NPC 关系面板 | CHAR-SHENDU-SHEET-V2 | `docs/prompts/CORE_CHARACTER_PORTRAITS_V1.md` | 透明 WebP；竹篙为身份提示 |
| CHAR-GUWAN-PORTRAIT-V1 | `public/art/characters/portraits/guwan-portrait-v1.webp` | 对话半身像 | integrated | NPC 关系面板 | CHAR-GUWAN-SHEET-V2 | `docs/prompts/CORE_CHARACTER_PORTRAITS_V1.md` | 透明 WebP；肩伞为身份提示 |
| CHAR-TAOTAO-PORTRAIT-V1 | `public/art/characters/portraits/taotao-portrait-v1.webp` | 对话半身像 | integrated | NPC 关系面板 | CHAR-TAOTAO-SHEET-V2 | `docs/prompts/CORE_CHARACTER_PORTRAITS_V1.md` | 透明 WebP；铜勺为身份提示 |
| CHAR-SHENDU-WARM-V1 | `public/art/characters/portraits/shendu-portrait-warm-v1.webp` | 表情差分 | rejected | 旧温暖、害羞对话 | CHAR-SHENDU-PORTRAIT-V1 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V1.md` | 已由同母图五态头像替代，保留历史版本 |
| CHAR-GUWAN-ANNOYED-V1 | `public/art/characters/portraits/guwan-portrait-annoyed-v1.webp` | 表情差分 | rejected | 旧不悦对话 | CHAR-GUWAN-PORTRAIT-V1 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V1.md` | 已由同母图五态头像替代，保留历史版本 |
| CHAR-TAOTAO-WARM-V1 | `public/art/characters/portraits/taotao-portrait-warm-v1.webp` | 表情差分 | rejected | 旧温暖、害羞对话 | CHAR-TAOTAO-PORTRAIT-V1 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V1.md` | 已由同母图五态头像替代，保留历史版本 |
| ROOM-BEDROOM-V1 | `public/art/house/modules/bedroom-module-v1.webp` | 房间外观模块 | integrated | 山谷小屋扩建 | ENV-VALLEY-BASE-V1 | `docs/prompts/ROOM_MODULES_V1.md` | 小暖窗 |
| ROOM-KITCHEN-V1 | `public/art/house/modules/kitchen-module-v1.webp` | 房间外观模块 | integrated | 山谷小屋扩建 | ENV-VALLEY-BASE-V1 | `docs/prompts/ROOM_MODULES_V1.md` | 烟囱与香草 |
| ROOM-STUDY-V1 | `public/art/house/modules/study-module-v1.webp` | 房间外观模块 | integrated | 山谷小屋扩建 | ENV-VALLEY-BASE-V1 | `docs/prompts/ROOM_MODULES_V1.md` | 高格窗与书影 |
| ROOM-GUEST-V1 | `public/art/house/modules/guest-module-v1.webp` | 房间外观模块 | integrated | 山谷小屋扩建 | ENV-VALLEY-BASE-V1 | `docs/prompts/ROOM_MODULES_V1.md` | 双窗与门灯 |
| ROOM-STORAGE-V1 | `public/art/house/modules/storage-module-v1.webp` | 房间外观模块 | integrated | 山谷小屋扩建 | ENV-VALLEY-BASE-V1 | `docs/prompts/ROOM_MODULES_V1.md` | 小木门与竹筐 |
| INTERIOR-BEDROOM-V1 | `public/art/rooms/interiors/bedroom-interior-v1.webp` | 房间室内插画 | integrated | 卧室详情面板 | ROOM-BEDROOM-V1 | `docs/prompts/ROOM_INTERIORS_V1.md` | 单人床、提灯与木箱 |
| INTERIOR-GUEST-V1 | `public/art/rooms/interiors/guest-interior-v1.webp` | 房间室内插画 | integrated | 客房详情面板 | ROOM-GUEST-V1 | `docs/prompts/ROOM_INTERIORS_V1.md` | 客床与备用被褥 |
| INTERIOR-KITCHEN-V1 | `public/art/rooms/interiors/kitchen-interior-v1.webp` | 房间室内插画 | integrated | 厨房详情面板 | ROOM-KITCHEN-V1 | `docs/prompts/ROOM_INTERIORS_V1.md` | 砖炉、料理台与香草 |
| INTERIOR-STUDY-V1 | `public/art/rooms/interiors/study-interior-v1.webp` | 房间室内插画 | integrated | 书房详情面板 | ROOM-STUDY-V1 | `docs/prompts/ROOM_INTERIORS_V1.md` | 书桌、高窗与书架 |
| INTERIOR-STORAGE-V1 | `public/art/rooms/interiors/storage-interior-v1.webp` | 房间室内插画 | integrated | 储藏室详情面板 | ROOM-STORAGE-V1 | `docs/prompts/ROOM_INTERIORS_V1.md` | 陶罐、竹篮与整齐货架 |
| EMPTY-TASKS-V1 | `public/art/empty-states/tasks-empty-v1.webp` | 空状态插画 | integrated | 没有未完成待办 | ENV-VALLEY-BASE-V1 | `docs/prompts/EMPTY_STATES_V1.md` | 空白笔记本、铅笔与新芽 |
| EMPTY-CHARACTERS-V1 | `public/art/empty-states/characters-empty-v1.webp` | 空状态插画 | integrated | 尚未遇见角色 | ENV-VALLEY-BASE-V1 | `docs/prompts/EMPTY_STATES_V1.md` | 空路径、木桥与未点亮路灯 |
| CHAR-TRAVELER-PLACEHOLDER-V1 | `public/art/characters/placeholders/traveler-placeholder-v1.webp` | 临时远景剪影 | integrated | 未完成正式素材的已遇见角色 | CHAR-SHENDU-SPRITE-V1 | `docs/prompts/TRAVELER_PLACEHOLDER_V1.md` | 无五官旅人；透明 WebP；正式角色小人完成后逐一替换 |
| EVENT-SHENDU-FRIENDSHIP-V1 | `public/art/events/shendu-friendship-v1.webp` | 友情事件插画 | integrated | 沈渡友情回忆 | CHAR-CORE-LINEUP-V3 | `docs/prompts/CORE_EVENT_ILLUSTRATIONS_V1.md` | 旧题《河岸停一停》；文案已改为《五文钱》等琐事线；运行时 1200×800 WebP |
| EVENT-SHENDU-ROMANCE-V1 | `public/art/events/shendu-romance-v1.webp` | 爱情事件插画 | integrated | 沈渡爱情回忆 | CHAR-CORE-LINEUP-V3 | `docs/prompts/CORE_EVENT_ILLUSTRATIONS_V1.md` | 旧题《回家的水路》；文案已改为《漏雨》《蓑衣》等；运行时 1200×800 WebP |
| EVENT-GUWAN-FRIENDSHIP-V1 | `public/art/events/guwan-friendship-v1.webp` | 友情事件插画 | integrated | 顾晚友情回忆 | CHAR-CORE-LINEUP-V3 | `docs/prompts/CORE_EVENT_ILLUSTRATIONS_V1.md` | 《半边伞》；运行时 1200×800 WebP |
| EVENT-GUWAN-ROMANCE-V1 | `public/art/events/guwan-romance-v1.webp` | 爱情事件插画 | integrated | 顾晚爱情回忆 | CHAR-CORE-LINEUP-V3 | `docs/prompts/CORE_EVENT_ILLUSTRATIONS_V1.md` | 《备用钥匙》；运行时 1200×800 WebP |
| EVENT-TAOTAO-FRIENDSHIP-V1 | `public/art/events/taotao-friendship-v1.webp` | 友情事件插画 | integrated | 桃桃旧友情回忆 | CHAR-CORE-LINEUP-V3 | `docs/prompts/CORE_EVENT_ILLUSTRATIONS_V1.md` | 已由 V2 替代，保留历史版本 |
| EVENT-TAOTAO-ROMANCE-V1 | `public/art/events/taotao-romance-v1.webp` | 爱情事件插画 | integrated | 桃桃旧爱情回忆 | CHAR-CORE-LINEUP-V3 | `docs/prompts/CORE_EVENT_ILLUSTRATIONS_V1.md` | 已由 V2 替代，保留历史版本 |
| EVENT-TAOTAO-FRIENDSHIP-V2 | `public/art/events/taotao-friendship-v2.webp` | 友情事件插画 | integrated | 桃桃新版友情回忆 | CHAR-TAOTAO-SHEET-V2 | `docs/prompts/TAOTAO_EVENT_ILLUSTRATIONS_V2.md` | 文案已改为《凤凰》《张二丫》《大车》；运行时 1200×800 WebP |
| EVENT-TAOTAO-ROMANCE-V2 | `public/art/events/taotao-romance-v2.webp` | 爱情事件插画 | integrated | 桃桃新版爱情回忆 | EVENT-TAOTAO-FRIENDSHIP-V2 | `docs/prompts/TAOTAO_EVENT_ILLUSTRATIONS_V2.md` | 文案已改为《糖兔子》《首饰店》《留座》；运行时 1200×800 WebP |
| EXPR-SHENDU-NEUTRAL-V1 | `public/art/characters/expressions/shendu-neutral-v1.webp` | 表情头像 | integrated | 沈渡平静对话 | CHAR-SHENDU-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-SHENDU-WARM-V1 | `public/art/characters/expressions/shendu-warm-v1.webp` | 表情头像 | integrated | 沈渡开心对话 | CHAR-SHENDU-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-SHENDU-WORRIED-V1 | `public/art/characters/expressions/shendu-worried-v1.webp` | 表情头像 | integrated | 沈渡担心对话 | CHAR-SHENDU-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-SHENDU-ANNOYED-V1 | `public/art/characters/expressions/shendu-annoyed-v1.webp` | 表情头像 | integrated | 沈渡生气对话 | CHAR-SHENDU-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-SHENDU-SHY-V1 | `public/art/characters/expressions/shendu-shy-v1.webp` | 表情头像 | integrated | 沈渡害羞对话 | CHAR-SHENDU-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-GUWAN-NEUTRAL-V1 | `public/art/characters/expressions/guwan-neutral-v1.webp` | 表情头像 | integrated | 顾晚平静对话 | CHAR-GUWAN-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-GUWAN-WARM-V1 | `public/art/characters/expressions/guwan-warm-v1.webp` | 表情头像 | integrated | 顾晚开心对话 | CHAR-GUWAN-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-GUWAN-WORRIED-V1 | `public/art/characters/expressions/guwan-worried-v1.webp` | 表情头像 | integrated | 顾晚担心对话 | CHAR-GUWAN-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-GUWAN-ANNOYED-V1 | `public/art/characters/expressions/guwan-annoyed-v1.webp` | 表情头像 | integrated | 顾晚生气对话 | CHAR-GUWAN-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-GUWAN-SHY-V1 | `public/art/characters/expressions/guwan-shy-v1.webp` | 表情头像 | integrated | 顾晚害羞对话 | CHAR-GUWAN-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-TAOTAO-NEUTRAL-V1 | `public/art/characters/expressions/taotao-neutral-v1.webp` | 表情头像 | integrated | 桃桃平静对话 | CHAR-TAOTAO-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-TAOTAO-WARM-V1 | `public/art/characters/expressions/taotao-warm-v1.webp` | 表情头像 | integrated | 桃桃开心对话 | CHAR-TAOTAO-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-TAOTAO-WORRIED-V1 | `public/art/characters/expressions/taotao-worried-v1.webp` | 表情头像 | integrated | 桃桃担心对话 | CHAR-TAOTAO-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-TAOTAO-ANNOYED-V1 | `public/art/characters/expressions/taotao-annoyed-v1.webp` | 表情头像 | integrated | 桃桃生气对话 | CHAR-TAOTAO-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| EXPR-TAOTAO-SHY-V1 | `public/art/characters/expressions/taotao-shy-v1.webp` | 表情头像 | integrated | 桃桃害羞对话 | CHAR-TAOTAO-SHEET-V2 | `docs/prompts/CORE_CHARACTER_EXPRESSIONS_V2.md` | 320×512；同母图定点裁切 |
| STATE-SHENDU-WALK-V1 | `public/art/characters/states/shendu-walk-away-v1.webp` | 远景背面行走 | integrated | 沈渡在山谷小路移动 | CHAR-CORE-CHIBI-V1、CHAR-SHENDU-SHEET-V2 | `docs/prompts/CORE_CHARACTER_STATES_V1.md` | 透明 WebP；低髻与竖竹篙 |
| STATE-SHENDU-MOVEIN-V1 | `public/art/characters/states/shendu-move-in-v1.webp` | 远景搬入状态 | integrated | 沈渡入住反馈 | CHAR-CORE-CHIBI-V1、CHAR-SHENDU-SHEET-V2 | `docs/prompts/CORE_CHARACTER_STATES_V1.md` | 透明 WebP；布包与竖竹篙 |
| STATE-GUWAN-WALK-V1 | `public/art/characters/states/guwan-walk-away-v1.webp` | 远景背面行走 | integrated | 顾晚在山谷小路移动 | CHAR-CORE-CHIBI-V1、CHAR-GUWAN-SHEET-V2 | `docs/prompts/CORE_CHARACTER_STATES_V1.md` | 透明 WebP；高髻、长衣与肩伞 |
| STATE-GUWAN-MOVEIN-V1 | `public/art/characters/states/guwan-move-in-v1.webp` | 远景搬入状态 | integrated | 顾晚入住反馈 | CHAR-CORE-CHIBI-V1、CHAR-GUWAN-SHEET-V2 | `docs/prompts/CORE_CHARACTER_STATES_V1.md` | 透明 WebP；布包与肩伞 |
| STATE-TAOTAO-WALK-V1 | `public/art/characters/states/taotao-walk-away-v1.webp` | 远景背面行走 | integrated | 桃桃在山谷小路移动 | CHAR-CORE-CHIBI-V1、CHAR-TAOTAO-SHEET-V2 | `docs/prompts/CORE_CHARACTER_STATES_V1.md` | 透明 WebP；双环髻、铜勺与糖兔 |
| STATE-TAOTAO-MOVEIN-V1 | `public/art/characters/states/taotao-move-in-v1.webp` | 远景搬入状态 | integrated | 桃桃入住反馈 | CHAR-CORE-CHIBI-V1、CHAR-TAOTAO-SHEET-V2 | `docs/prompts/CORE_CHARACTER_STATES_V1.md` | 透明 WebP；布包、铜勺与小糖兔 |
| ICON-SHENDU-PROP-V1 | `src/assets/icons/GameIcon.tsx` (`bamboo`) | 专属道具 SVG | integrated | 沈渡角色档案 | CHAR-SHENDU-SHEET-V2 | 代码原生 SVG | 竹节与小叶；24×24 viewBox |
| ICON-GUWAN-PROP-V1 | `src/assets/icons/GameIcon.tsx` (`umbrella`) | 专属道具 SVG | integrated | 顾晚角色档案 | CHAR-GUWAN-SHEET-V2 | 代码原生 SVG | 伞面、伞骨与弯柄；24×24 viewBox |
| ICON-TAOTAO-PROP-V1 | `src/assets/icons/GameIcon.tsx` (`ladle`) | 专属道具 SVG | integrated | 桃桃角色档案 | CHAR-TAOTAO-SHEET-V2 | 代码原生 SVG | 铜勺碗与长柄；24×24 viewBox |
| GIFT-GINGER-SOUP-V1 | `src/assets/icons/GiftIcon.tsx` (`ginger_soup`) | 礼物 SVG | integrated | 热姜汤商店卡片 | 无 | `docs/prompts/GIFT_ICONS_V1.md` | 汤碗与蒸汽 |
| GIFT-WHEAT-CAKE-V1 | `src/assets/icons/GiftIcon.tsx` (`wheat_cake`) | 礼物 SVG | integrated | 麦香饼商店卡片 | 无 | `docs/prompts/GIFT_ICONS_V1.md` | 三层烤饼 |
| GIFT-CHESTNUTS-V1 | `src/assets/icons/GiftIcon.tsx` (`chestnuts`) | 礼物 SVG | integrated | 糖炒栗子商店卡片 | 无 | `docs/prompts/GIFT_ICONS_V1.md` | 纸袋与栗子 |
| GIFT-WOOD-SCRAP-V1 | `src/assets/icons/GiftIcon.tsx` (`wood_scrap`) | 礼物 SVG | integrated | 小木块商店卡片 | 无 | `docs/prompts/GIFT_ICONS_V1.md` | 立体木块 |
| GIFT-OSMANTHUS-V1 | `src/assets/icons/GiftIcon.tsx` (`osmanthus`) | 礼物 SVG | integrated | 桂花糖商店卡片 | 无 | `docs/prompts/GIFT_ICONS_V1.md` | 包糖与桂花 |
| GIFT-ORANGE-PEEL-V1 | `src/assets/icons/GiftIcon.tsx` (`orange_peel`) | 礼物 SVG | integrated | 蜜橘皮商店卡片 | 无 | `docs/prompts/GIFT_ICONS_V1.md` | 卷曲果皮 |
| GIFT-TRINKET-V1 | `src/assets/icons/GiftIcon.tsx` (`trinket`) | 礼物 SVG | integrated | 小玩意商店卡片 | 无 | `docs/prompts/GIFT_ICONS_V1.md` | 星形挂件 |
| GIFT-CINNABAR-V1 | `src/assets/icons/GiftIcon.tsx` (`cinnabar`) | 礼物 SVG | integrated | 印泥商店卡片 | 无 | `docs/prompts/GIFT_ICONS_V1.md` | 圆盒与印章 |
| GIFT-BEAN-BAG-V1 | `src/assets/icons/GiftIcon.tsx` (`bean_bag`) | 礼物 SVG | integrated | 暖手豆袋商店卡片 | 无 | `docs/prompts/GIFT_ICONS_V1.md` | 缝线布袋 |
| GIFT-MALTOSE-V1 | `src/assets/icons/GiftIcon.tsx` (`maltose`) | 礼物 SVG | integrated | 麦芽糖商店卡片 | 无 | `docs/prompts/GIFT_ICONS_V1.md` | 糖罐与拉丝 |
| GIFT-TEA-CAKE-V1 | `src/assets/icons/GiftIcon.tsx` (`tea_cake`) | 礼物 SVG | integrated | 茶饼商店卡片 | 无 | `docs/prompts/GIFT_ICONS_V1.md` | 圆饼与叶纹 |
| GIFT-LOTUS-PAPER-V1 | `src/assets/icons/GiftIcon.tsx` (`lotus_paper`) | 礼物 SVG | integrated | 莲纸商店卡片 | 无 | `docs/prompts/GIFT_ICONS_V1.md` | 叠纸与莲花 |
| UI-PROFILE-PAPER-V1 | `src/styles.css` (`character-profile-paper`) | 档案纸张边框 | integrated | 核心角色档案 | ART_DIRECTION | 代码原生 CSS | 双层纸边、纤维纹、纸胶带与缝线 |
| UI-RELATIONSHIP-TEA-V1 | `src/components/RelationshipMotif.tsx` (`tea-symbol`) | 关系阶段 SVG | integrated | 友情 0–3 阶段 | ART_DIRECTION | 代码原生 SVG | 两杯茶从冷清到轻碰 |
| UI-RELATIONSHIP-LAMP-V1 | `src/components/RelationshipMotif.tsx` (`lamp-symbol`) | 关系阶段 SVG | integrated | 喜欢 0–4 阶段 | ART_DIRECTION | 代码原生 SVG | 小灯从未点亮到照见家门 |
| ENV-VALLEY-STAGES-V1 | `public/art/environment/valley-stage-{0..3}-v1.webp` | 四阶段环境背景 | integrated | 山谷成长 0–3 阶段 | ENV-VALLEY-BASE-V1 | `docs/prompts/PHASE3_VALLEY_AND_DECORATIONS_V1.md` | 固定相机、主屋与点击锚点；荒地到共同生活 |
| DECOR-ATLAS-V1 | `art-source/phase3/decorations-atlas-alpha-v1.png` | 12 件装饰母图 | selected | 装饰切片母图 | ENV-VALLEY-BASE-V1 | `docs/prompts/PHASE3_VALLEY_AND_DECORATIONS_V1.md` | 4×3 透明图集；键控源文件一并保留 |
| DECOR-SET-V1 | `public/art/decorations/*-v1.webp` | 12 件透明装饰 | integrated | 口袋商店与山谷摆放 | DECOR-ATLAS-V1 | `docs/prompts/PHASE3_VALLEY_AND_DECORATIONS_V1.md` | 384×342；最多同时摆放 6 件 |
| MILESTONE-SET-V1 | `public/art/milestones/*-v1.webp` | 6 件里程碑小插画 | integrated | 山谷成长卡 | ENV-VALLEY-BASE-V1 | `docs/prompts/PHASE3_VALLEY_AND_DECORATIONS_V1.md` | 256×256 透明 WebP；纸本、茶杯与家灯意象 |
| BETA-COVER-V1 | `public/art/beta/beta-cover-v1.webp` | 测试版封面/分享图 | integrated | 邀请入口与 Open Graph | ENV-VALLEY-BASE-V1 | `docs/prompts/PHASE4_BETA_ASSETS_V1.md` | 1200×630 WebP；待办本、两杯茶与暖窗小屋 |
| BETA-STATUS-SET-V1 | `public/art/beta/{offline,update,save-recovery,feedback}-v1.webp` | 测试状态插画 | integrated | PWA 状态、存档恢复与反馈 | BETA-COVER-V1 | `docs/prompts/PHASE4_BETA_ASSETS_V1.md` | 320×240 透明 WebP；四状态图集切片 |
| COURTYARD-POND-V1 | `public/art/landscapes/courtyard-pond-v1.webp` | 院落主景 | integrated | 三级以上院落的池塘院 | COURTYARD-FOUR-SIDED-V1 | `docs/prompts/COURTYARD_LANDSCAPES_V1.md` | 不规则双池面与中轴短石桥；透明 WebP |
| COURTYARD-OLD-TREE-V1 | `public/art/landscapes/courtyard-old-tree-v1.webp` | 院落主景 | integrated | 二级以上院落的老树院 | COURTYARD-FOUR-SIDED-V1 | `docs/prompts/COURTYARD_LANDSCAPES_V1.md` | 枣树、石凳、裸根与落叶；透明 WebP |
| COURTYARD-KITCHEN-GARDEN-V1 | `public/art/landscapes/courtyard-kitchen-garden-v1.webp` | 院落主景 | integrated | 二级以上院落的菜园院 | COURTYARD-FOUR-SIDED-V1 | `docs/prompts/COURTYARD_LANDSCAPES_V1.md` | 三组破边菜畦、水沟、竹架；透明 WebP |
| COURTYARD-GROUND-ACCENTS-V1 | `public/art/landscapes/{kitchen-earth,damp-stones,pathside-stones,mossy-wall,wildflower-ribbon,leaf-litter}-v1.webp` | 地面融合素材 | integrated | 小装饰的语义组合底层 | COURTYARD-FOUR-SIDED-V1 | `docs/prompts/COURTYARD_LANDSCAPES_V1.md` | 六件破边低矮地景；图集源文件与导出脚本一并保留 |

## 首轮评估

已确认采用 **方向 C 的构图、媒介和可读性**，生成唯一的山谷基准图：

- 保留 C 清楚的小屋、门窗、路径和左右扩建空间。
- 保留 C 较大的自然草地，作为角色站位。
- 减少房前杂物和前景碎石，避免角色进入后画面过密。
- 不采用 B 中可见的圆形站位符；站位只应表现为自然空地。
- 基准图仍为完整概念图，正式接入前需进一步拆成图层。

## 状态变更要求

- `candidate → selected`：需记录选择原因和需要修正的地方。
- `selected → integrated`：需记录实际使用页面和压缩后文件。
- 被替换的素材不覆盖，改为 `rejected` 或保留版本号。
- 角色资产必须记录所依赖的标准角色参考图。
