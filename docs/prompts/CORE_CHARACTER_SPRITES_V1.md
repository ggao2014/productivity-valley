# 核心角色远景 Sprite v1

生成方式：内置图像生成工具，以 `core-chibi-v1.png` 为身份参考。每名角色单独生成在纯青色 `#00FFFF` 背景上，再使用项目图像工具移除色键、裁切透明边缘并压缩为透明 WebP。

共同要求：

- 3 头身，独立 Q 化面容
- 适合 56–80 CSS 像素高度
- 宽色块、少衣褶、无织物纹样
- 无细发丝、手指、成人鼻梁与下颌结构
- 完整道具与双脚，不带地面阴影
- 只保留发型剪影、主色、姿态和专属道具

角色不变量：

- 沈渡：低髻、平眉垂眼、灰绿短衣、竖直竹篙、笔直站姿
- 顾晚：高乱髻与长侧发、挑眉侧眼、红长衣、暗围巾、肩伞斜站
- 桃桃：双环髻、圆眼、黄衣红围裙、铜勺、简化兔糖

色键背景要求：

```text
Perfectly flat uniform solid #00FFFF chroma-key background, edge to edge.
No texture, gradient, paper grain, lighting variation, floor plane, cast shadow or contact shadow.
Do not use #00FFFF anywhere in the character.
```
