from PIL import Image
from pathlib import Path

src = Path(r"C:\Users\Haile\.cursor\projects\c-Users-Haile-projects-LoopTidy\assets\looptidy-icon-sample-a.png")
assets = Path(r"C:\Users\Haile\projects\LoopTidy\assets")
im = Image.open(src).convert("RGBA").resize((1024, 1024), Image.Resampling.LANCZOS)

im.save(assets / "icon.png", "PNG")
im.save(assets / "logo-official.png", "PNG")
im.save(assets / "splash-icon.png", "PNG")
im.save(assets / "looptidy-icon-option1.png", "PNG")
im.resize((48, 48), Image.Resampling.LANCZOS).save(assets / "favicon.png", "PNG")

teal = Image.new("RGBA", (1024, 1024), (10, 79, 74, 255))
teal.save(assets / "android-icon-background.png", "PNG")
im.save(assets / "android-icon-foreground.png", "PNG")

gray = im.convert("L")
mono = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
gp = gray.load()
op = mono.load()
for y in range(1024):
    for x in range(1024):
        v = gp[x, y]
        if v > 90:
            a = min(255, int((v - 90) * 1.8))
            op[x, y] = (255, 255, 255, a)
mono.save(assets / "android-icon-monochrome.png", "PNG")
print("ok")
