# 核心角色远景状态 V1

生成方式：内置 ImageGen。每个状态分别生成，使用
`core-chibi-v1.png` 作为远景比例与媒介参考，并使用对应的 V2 角色设定表作为服装和背面结构参考。

## 统一母 Prompt

```text
Use case: illustration-story
Asset type: single transparent-ready distant valley character sprite
Input images: Image 1 establishes the exact 3-head-tall chibi proportion, simplified face, colored-pencil storybook style and palette. Image 2 establishes the exact adult costume and rear-view construction.
Style/medium: colored-pencil Chinese storybook sprite with restrained watercolor fill, clear dark-brown contour, simplified wide color shapes and very low detail, readable at 56–80 CSS pixels.
Composition: one complete centered character with generous padding, no crop and no ground plane.
Background: perfectly flat uniform solid #00FFFF chroma-key background, edge to edge; no texture, gradient, paper grain, lighting variation, floor, cast shadow or contact shadow; do not use #00FFFF anywhere in the character.
Constraints: one character only; both feet visible; no text, frame or watermark.
Avoid: adult realistic facial anatomy, 2-head super-deformed body, photorealism, 3D, anime card art, xianxia, extra limbs, duplicate props, ornate patterns and tiny fingers.
```

## 背面行走状态

- 沈渡：三分之二背面，小步向右上行走；低髻、青灰短衣、棕裤与竖直竹篙。
- 顾晚：三分之二背面，小步向左上行走；高乱髻、侧发、深围巾、砖红长衣与肩上斜伞。
- 桃桃：三分之二背面，轻快向右上行走；双环髻、红发带、姜黄衣、砖红围裙、铜勺与简化糖兔。

背面状态不表现成人化面部细节，只靠发型、主色块、衣服下摆和专属道具辨认。

## 提包搬入状态

- 沈渡：三分之二正面向前行走，右肩一只棕色布包，左手竖竹篙，克制微笑。
- 顾晚：三分之二正面向前行走，左手深棕布包，右肩斜放油纸伞，轻微歪笑。
- 桃桃：三分之二正面向前行走，左肩姜黄红结布包，右手铜勺，包结处露出小糖兔。

三人的搬入包袱统一使用传统布包语法，不使用行李箱、双肩包或现代扣件。

## 后处理

1. 色键源图保存到 `art-source/characters/sprites-chroma-v2/`。
2. 使用内置 imagegen skill 的 `remove_chroma_key.py`：

```text
--auto-key border
--soft-matte
--transparent-threshold 12
--opaque-threshold 220
--despill
```

3. 按 alpha 边界裁切并保留 2.5% 透明边距。
4. Alpha PNG 保存到 `art-source/characters/sprites-alpha-v2/`。
5. 运行时缩放到最大 640×768，保存为 quality 84 的透明 WebP。
6. QA 拼图：`art-source/characters/sprites-alpha-v2/states-contact-sheet-v1.jpg`。
