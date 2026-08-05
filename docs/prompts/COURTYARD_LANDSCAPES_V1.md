# 院落主景与地面融合素材 V1

## 目标

让原有装饰品从“独立贴图”变成院落生活场景的一部分。主景改变院心结构；低矮地景只负责连接小物与地面。

## 统一视觉约束

- 参考：`public/art/environment/courtyard-four-sided-v1.webp`
- 温暖、低饱和的中国乡居水彩／水粉，宣纸颗粒，橄榄绿、赭黄、青灰色系。
- 俯视斜角与院落地面一致，边缘自然破碎，不使用规则矩形底板。
- 原始生成图使用纯品红 `#FF00FF` 键控背景，四周保留空白。
- 禁止建筑、人物、文字、UI、边框、签名和漂浮阴影。

## 主景提示词

公共前缀：

> Create a transparent-ready isolated watercolor game environment asset for Productivity Valley. Match the reference courtyard's warm, muted Chinese rural watercolor/gouache style, oblique top-down perspective, soft hand-painted edges, rice-paper texture, olive/sage/ochre/slate palette, and restrained detail. The asset must look physically embedded in the same ground plane. Flat pure magenta #FF00FF background only, fully uniform to every edge, no cast shadow on the background. No buildings, people, labels, UI, borders, frame, text, signature, or extra objects. Keep a clean 8% magenta margin on all sides.

### 池塘院

> A large irregular central courtyard pond, horizontally wide kidney/bean shape, not circular and not ornamental-palace-like. Shallow blue-green water with subtle watercolor reflections. Low uneven fieldstone and damp-earth banks, a few reeds and water grass, 5-7 scattered stones. A narrow axis remains passable from bottom foreground toward top center: place a short rustic flat-stone footbridge across the pond's narrow waist, aligned vertically in the image. Pond dominates the asset but remains low-profile and walkable-looking. Composition centered, isolated.

### 老树院

> One mature old Chinese jujube tree as a courtyard centerpiece, slightly leaning trunk, broad but airy irregular canopy, visible branching, mossy exposed roots settling into a low asymmetric earth-and-grass island. Include one modest weathered stone bench tucked under the canopy and sparse fallen leaves. Avoid giant fantasy tree, cherry blossoms, flowers, lanterns, fences, pots. Composition centered, isolated; canopy can be taller but should remain compatible with a courtyard house.

### 菜园院

> An irregular kitchen-garden courtyard vignette made of three uneven narrow vegetable beds following perspective, not a rectangular garden panel. Mixed leafy greens and scallions, low earthen ridges, one simple bamboo trellis, one tiny shallow irrigation groove, a few stepping stones. Soft broken edges with grass tufts so it blends naturally into the yard. No fence, tools, baskets, buildings, pots, signs. Composition centered, isolated.

## 地面融合图集

采用 3×2 图集，依次为：灶边泥地、湿地碎石、路边石带、墙根苔痕、野花草带、枣叶落叶。六格必须低矮、破边、互不跨格，不包含可被误认为商品的小型立体物件。

源文件：

- `art-source/landscapes/courtyard-ground-accents-v1-source.png`
- `art-source/landscapes/courtyard-ground-accents-v1-alpha.png`

导出脚本：`scripts/export-landscape-accents.py`

## 运行时规则

- 主景互斥，一次只使用一套；开阔院不需要图片。
- 老树院、菜园院从二级院落开放；池塘院从三级院落开放。
- 小物按墙边、屋侧、路边、角落、水边等语义区摆放，并随主景改变位置。
- 主景和地面融合层不可点击；房屋、小物和人物保持各自交互层级。
