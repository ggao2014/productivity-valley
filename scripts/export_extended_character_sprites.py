from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
CHROMA_DIR = ROOT / "art-source" / "characters" / "sprites-chroma-extended"
ALPHA_DIR = ROOT / "art-source" / "characters" / "sprites-alpha-extended"
PUBLIC_SPRITE_DIR = ROOT / "public" / "art" / "characters" / "sprites"
PUBLIC_STATE_DIR = ROOT / "public" / "art" / "characters" / "states"
CONTACT_SHEET = ALPHA_DIR / "extended-states-contact-sheet-v1.jpg"

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
STATES = ["idle", "walk-away", "move-in"]


def remove_magenta(image: Image.Image) -> Image.Image:
    rgb = np.asarray(image.convert("RGB"), dtype=np.float32)
    key = np.array([255.0, 0.0, 255.0], dtype=np.float32)
    distance = np.linalg.norm(rgb - key, axis=2)
    background = Image.fromarray((distance < 42.0).astype(np.uint8) * 255, "L")
    edge_zone = np.asarray(background.filter(ImageFilter.MaxFilter(11))) > 0
    alpha = np.ones(distance.shape, dtype=np.float32)
    alpha[edge_zone] = np.clip((distance[edge_zone] - 15.0) / 195.0, 0.0, 1.0)
    alpha[distance < 24.0] = 0.0

    # Undo the key color contribution on antialiased edge pixels. This avoids
    # a pink halo when the sprite is placed over grass or pale courtyard walls.
    safe_alpha = np.maximum(alpha[..., None], 1 / 255)
    foreground = (rgb - (1.0 - alpha[..., None]) * key) / safe_alpha
    foreground = np.clip(foreground, 0.0, 255.0)
    rgba = np.dstack((foreground, alpha[..., None] * 255.0)).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def crop_visible(image: Image.Image, padding: int = 20) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 10 else 0).getbbox()
    if bbox is None:
        raise ValueError("No visible pixels after chroma removal")
    left, top, right, bottom = bbox
    return image.crop(
        (
            max(0, left - padding),
            max(0, top - padding),
            min(image.width, right + padding),
            min(image.height, bottom + padding),
        )
    )


def runtime_path(npc_id: str, state: str) -> Path:
    if state == "idle":
        return PUBLIC_SPRITE_DIR / f"{npc_id}-sprite-v1.webp"
    return PUBLIC_STATE_DIR / f"{npc_id}-{state}-v1.webp"


def main() -> None:
    ALPHA_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_SPRITE_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_STATE_DIR.mkdir(parents=True, exist_ok=True)
    previews: list[tuple[str, list[Image.Image]]] = []

    for npc_id in NPC_IDS:
        sheet = Image.open(CHROMA_DIR / f"{npc_id}-states-v1.png").convert("RGB")
        cells: list[Image.Image] = []
        for index, state in enumerate(STATES):
            x0 = round(sheet.width * index / 3)
            x1 = round(sheet.width * (index + 1) / 3)
            sprite = crop_visible(remove_magenta(sheet.crop((x0, 0, x1, sheet.height))))
            alpha_path = ALPHA_DIR / f"{npc_id}-{state}-v1.png"
            sprite.save(alpha_path, optimize=True)
            sprite.save(runtime_path(npc_id, state), "WEBP", lossless=True, method=6)

            preview = Image.new("RGBA", (240, 260), (231, 219, 190, 255))
            fitted = sprite.copy()
            fitted.thumbnail((220, 240), Image.Resampling.LANCZOS)
            preview.alpha_composite(
                fitted,
                ((preview.width - fitted.width) // 2, preview.height - fitted.height - 8),
            )
            cells.append(preview.convert("RGB"))
        previews.append((npc_id, cells))

    contact = Image.new("RGB", (720, len(previews) * 286), (231, 219, 190))
    draw = ImageDraw.Draw(contact)
    for row, (npc_id, cells) in enumerate(previews):
        y = row * 286
        for column, cell in enumerate(cells):
            contact.paste(cell, (column * 240, y))
        draw.text((8, y + 264), npc_id, fill=(56, 51, 43))
    contact.save(CONTACT_SHEET, quality=92)


if __name__ == "__main__":
    main()
