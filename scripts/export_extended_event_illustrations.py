from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "art-source" / "events" / "extended"
PUBLIC_DIR = ROOT / "public" / "art" / "events"
CONTACT_SHEET = SOURCE_DIR / "extended-events-contact-sheet-v1.jpg"

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
TRACKS = ["friendship", "romance"]


def center_crop_ratio(
    image: Image.Image,
    ratio: float = 1.5,
    focus_x: float = 0.5,
) -> Image.Image:
    width, height = image.size
    current = width / height
    if current < ratio:
        target_height = round(width / ratio)
        top = (height - target_height) // 2
        return image.crop((0, top, width, top + target_height))
    target_width = round(height * ratio)
    center = round(width * focus_x)
    left = max(0, min(width - target_width, center - target_width // 2))
    return image.crop((left, 0, left + target_width, height))


def main() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    previews: list[tuple[str, list[Image.Image]]] = []

    for npc_id in NPC_IDS:
        sheet = Image.open(SOURCE_DIR / f"{npc_id}-events-v1.png").convert("RGB")
        middle = sheet.height // 2
        panels = [sheet.crop((0, 0, sheet.width, middle - 5)), sheet.crop((0, middle + 5, sheet.width, sheet.height))]
        cells: list[Image.Image] = []
        for track, panel in zip(TRACKS, panels, strict=True):
            focus_x = 0.35 if npc_id == "yueqingshan" and track == "friendship" else 0.5
            illustration = center_crop_ratio(panel, focus_x=focus_x).resize((1200, 800), Image.Resampling.LANCZOS)
            illustration.save(
                PUBLIC_DIR / f"{npc_id}-{track}-v1.webp",
                "WEBP",
                quality=91,
                method=6,
            )
            cells.append(illustration.resize((360, 240), Image.Resampling.LANCZOS))
        previews.append((npc_id, cells))

    contact = Image.new("RGB", (720, len(previews) * 270), (231, 219, 190))
    draw = ImageDraw.Draw(contact)
    for row, (npc_id, cells) in enumerate(previews):
        y = row * 270
        contact.paste(cells[0], (0, y))
        contact.paste(cells[1], (360, y))
        draw.text((8, y + 246), f"{npc_id} — friendship / romance", fill=(56, 51, 43))
    contact.save(CONTACT_SHEET, quality=92)


if __name__ == "__main__":
    main()
