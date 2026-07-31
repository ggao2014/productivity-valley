# 核心角色五态表情 V2

本批次没有重新调用生成模型。V2 角色设定表已经包含位置稳定、造型一致的五态头像，因此直接从同一母图定点提取，避免二次生成造成脸型、服装和发型漂移。

## 来源与顺序

来源：

- `art-source/characters/core/shendu-sheet-v2.png`
- `art-source/characters/core/guwan-sheet-v2.png`
- `art-source/characters/core/taotao-sheet-v2.png`

每张设定表底部从左到右固定为：

1. `neutral`：平静
2. `warm`：开心
3. `worried`：担心
4. `annoyed`：生气
5. `shy`：害羞

## 提取规格

- 母图尺寸：1024×1536。
- 五个横向区间：`18–215`、`217–414`、`415–612`、`613–810`、`812–1009`。
- 沈渡、顾晚纵向区间：`1158–1518`。
- 桃桃纵向区间：`1188–1518`。
- 无损裁切保存到 `art-source/characters/expressions/`。
- 运行时统一适配为 320×512 WebP，quality 84，保存到 `public/art/characters/expressions/`。
- QA 拼图：`art-source/characters/expressions/expression-contact-sheet-v1.jpg`。

## 一致性检查

- 沈渡：低髻、柔和长脸、青灰外衣和白色交领在五态中不变。
- 顾晚：高髻、斜落侧发、锐利眉眼、深色围巾和砖红外衣在五态中不变。
- 桃桃：双环髻、红发带、姜黄上衣和砖红领边在五态中不变。
- 五态只改变眉、眼、口和少量脸红，不改变头部角度与服装结构。
- 对话切换时使用同尺寸同裁切基准，避免人物位置跳动。
