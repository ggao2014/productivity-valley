from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "art-source" / "landscapes" / "courtyard-ground-accents-v1-alpha.png"
OUTPUT = ROOT / "public" / "art" / "landscapes"
NAMES = (
    "kitchen-earth-v1.webp",
    "damp-stones-v1.webp",
    "pathside-stones-v1.webp",
    "mossy-wall-v1.webp",
    "wildflower-ribbon-v1.webp",
    "leaf-litter-v1.webp",
)


def padded_alpha_crop(image: Image.Image, padding: int = 18) -> Image.Image:
    bounds = image.getchannel("A").getbbox()
    if bounds is None:
        return image
    left, top, right, bottom = bounds
    return image.crop(
        (
            max(0, left - padding),
            max(0, top - padding),
            min(image.width, right + padding),
            min(image.height, bottom + padding),
        )
    )


def main() -> None:
    atlas = Image.open(SOURCE).convert("RGBA")
    cell_width = atlas.width // 3
    cell_height = atlas.height // 2
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for index, name in enumerate(NAMES):
        column = index % 3
        row = index // 3
        cell = atlas.crop(
            (
                column * cell_width,
                row * cell_height,
                (column + 1) * cell_width,
                (row + 1) * cell_height,
            )
        )
        cropped = padded_alpha_crop(cell)
        cropped.save(OUTPUT / name, "WEBP", lossless=True, method=6)
        print(f"Wrote {OUTPUT / name} ({cropped.width}x{cropped.height})")


if __name__ == "__main__":
    main()
