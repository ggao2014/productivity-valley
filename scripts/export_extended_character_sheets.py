from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "art-source" / "characters" / "extended"
EXPRESSION_SOURCE_DIR = ROOT / "art-source" / "characters" / "expressions-extended"
PUBLIC_EXPRESSION_DIR = ROOT / "public" / "art" / "characters" / "expressions"
PUBLIC_PORTRAIT_DIR = ROOT / "public" / "art" / "characters" / "portraits"
CONTACT_SHEET = SOURCE_DIR / "extended-expression-contact-sheet-v1.jpg"

NPC_IDS = [
    "qinghe",
    "jiangxiaoman",
    "chenshi",
    "linchu",
    "baizhi",
    "suweiming",
    "yueqingshan",
    "wenjiu",
    "hedeng",
]
TONES = ["neutral", "warm", "worried", "annoyed", "shy"]

# ImageGen kept the five expression studies in the lower strip of every sheet,
# but returned two canvas aspect ratios. These normalized bands preserve the
# complete head and shoulders without pulling in the full-body studies above.
PORTRAIT_BANDS = {
    "qinghe": (0.665, 0.955),
    "jiangxiaoman": (0.665, 0.955),
    "chenshi": (0.665, 0.955),
    "linchu": (0.665, 0.955),
    "baizhi": (0.675, 0.955),
    "suweiming": (0.665, 0.955),
    "yueqingshan": (0.665, 0.955),
    "wenjiu": (0.675, 0.955),
    "hedeng": (0.675, 0.955),
}

# Some ImageGen sheets arranged the five studies as 3+2 or 2+3 instead of a
# single row. Boxes are normalized (left, top, right, bottom) and ordered by
# the canonical dialogue tones above.
CUSTOM_BOXES = {
    "qinghe": [
        (0.015, 0.565, 0.335, 0.785),
        (0.335, 0.565, 0.665, 0.785),
        (0.665, 0.565, 0.990, 0.785),
        (0.125, 0.770, 0.510, 0.990),
        (0.490, 0.770, 0.875, 0.990),
    ],
    "chenshi": [
        (0.105, 0.600, 0.505, 0.790),
        (0.490, 0.600, 0.920, 0.790),
        (0.015, 0.790, 0.375, 0.985),
        (0.315, 0.790, 0.700, 0.985),
        (0.660, 0.790, 0.995, 0.985),
    ],
    "suweiming": [
        (0.005, 0.585, 0.335, 0.790),
        (0.325, 0.585, 0.670, 0.790),
        (0.660, 0.585, 0.995, 0.790),
        (0.105, 0.790, 0.515, 0.990),
        (0.485, 0.790, 0.895, 0.990),
    ],
}


def fit_on_paper(
    crop: Image.Image,
    paper: tuple[int, int, int],
    size: tuple[int, int] = (320, 512),
) -> Image.Image:
    canvas = Image.new("RGB", size, paper)
    fitted = crop.copy()
    fitted.thumbnail(size, Image.Resampling.LANCZOS)
    x = (size[0] - fitted.width) // 2
    y = (size[1] - fitted.height) // 2
    canvas.paste(fitted, (x, y))
    return canvas


def main() -> None:
    EXPRESSION_SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_EXPRESSION_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_PORTRAIT_DIR.mkdir(parents=True, exist_ok=True)

    preview_rows: list[Image.Image] = []
    for npc_id in NPC_IDS:
        sheet = Image.open(SOURCE_DIR / f"{npc_id}-sheet-v1.png").convert("RGB")
        width, height = sheet.size
        paper = tuple(sheet.getpixel((8, 8)))
        y0_n, y1_n = PORTRAIT_BANDS[npc_id]
        y0, y1 = round(height * y0_n), round(height * y1_n)
        cells: list[Image.Image] = []

        for index, tone in enumerate(TONES):
            if npc_id in CUSTOM_BOXES:
                bx0, by0, bx1, by1 = CUSTOM_BOXES[npc_id][index]
                box = (
                    round(width * bx0),
                    round(height * by0),
                    round(width * bx1),
                    round(height * by1),
                )
            else:
                # A small inset prevents ink from the adjacent portrait leaking in.
                box = (
                    round(width * (index / 5 + 0.006)),
                    y0,
                    round(width * ((index + 1) / 5 - 0.006)),
                    y1,
                )
            portrait = fit_on_paper(sheet.crop(box), paper)
            source_path = EXPRESSION_SOURCE_DIR / f"{npc_id}-{tone}-v1.png"
            portrait.save(source_path, optimize=True)
            portrait.save(
                PUBLIC_EXPRESSION_DIR / f"{npc_id}-{tone}-v1.webp",
                "WEBP",
                quality=90,
                method=6,
            )
            if tone == "neutral":
                portrait.save(
                    PUBLIC_PORTRAIT_DIR / f"{npc_id}-portrait-v1.webp",
                    "WEBP",
                    quality=90,
                    method=6,
                )
            cells.append(portrait.resize((160, 256), Image.Resampling.LANCZOS))

        row = Image.new("RGB", (5 * 160, 286), (231, 219, 190))
        for index, cell in enumerate(cells):
            row.paste(cell, (index * 160, 0))
        ImageDraw.Draw(row).text((8, 264), npc_id, fill=(56, 51, 43))
        preview_rows.append(row)

    contact = Image.new("RGB", (800, len(preview_rows) * 286), (231, 219, 190))
    for index, row in enumerate(preview_rows):
        contact.paste(row, (0, index * 286))
    contact.save(CONTACT_SHEET, quality=92)


if __name__ == "__main__":
    main()
