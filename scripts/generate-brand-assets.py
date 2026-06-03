"""Generate app icon, splash, Android adaptive, and favicon from assets/logo-official.png (Gemini)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SOURCE = ASSETS / "logo-official.png"
BG = (246, 248, 251, 255)  # #F6F8FB — matches app.json splash background


def content_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    rgba = img.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    minx, miny, maxx, maxy = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 16:
                continue
            if r > 245 and g > 245 and b > 245:
                continue
            found = True
            minx = min(minx, x)
            miny = min(miny, y)
            maxx = max(maxx, x)
            maxy = max(maxy, y)
    if not found:
        return 0, 0, w, h
    return minx, miny, maxx + 1, maxy + 1


def trim_logo(img: Image.Image) -> Image.Image:
    box = content_bbox(img)
    return img.crop(box)


def fit_on_canvas(
    logo: Image.Image,
    size: int,
    *,
    fill_ratio: float = 0.78,
    background: tuple[int, int, int, int] = BG,
    transparent_bg: bool = False,
) -> Image.Image:
    logo = trim_logo(logo.convert("RGBA"))
    target = int(size * fill_ratio)
    logo.thumbnail((target, target), Image.Resampling.LANCZOS)
    if transparent_bg:
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    else:
        canvas = Image.new("RGBA", (size, size), background)
    x = (size - logo.width) // 2
    y = (size - logo.height) // 2
    canvas.alpha_composite(logo, (x, y))
    return canvas


def to_monochrome(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 16 or (r > 245 and g > 245 and b > 245):
                continue
            opx[x, y] = (255, 255, 255, min(255, a))
    return out


def main() -> None:
    source = Image.open(SOURCE)

    icon = fit_on_canvas(source, 1024, fill_ratio=0.78, transparent_bg=False)
    icon.save(ASSETS / "icon.png", format="PNG")

    splash = fit_on_canvas(source, 1024, fill_ratio=0.72, transparent_bg=False)
    splash.save(ASSETS / "splash-icon.png", format="PNG")

    android_fg = fit_on_canvas(source, 1024, fill_ratio=0.62, transparent_bg=True)
    android_fg.save(ASSETS / "android-icon-foreground.png", format="PNG")

    android_bg = Image.new("RGBA", (1024, 1024), BG)
    android_bg.save(ASSETS / "android-icon-background.png", format="PNG")

    android_mono = to_monochrome(android_fg)
    android_mono.save(ASSETS / "android-icon-monochrome.png", format="PNG")

    favicon = fit_on_canvas(source, 192, fill_ratio=0.78, transparent_bg=False)
    favicon.save(ASSETS / "favicon.png", format="PNG")

    print("Generated brand assets in", ASSETS)


if __name__ == "__main__":
    main()
