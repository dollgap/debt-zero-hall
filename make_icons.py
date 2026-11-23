"""Generate ZEROED PWA icons from the Z·Ø monogram (assets/img/logo-monogram.png).

The monogram is a transparent PNG, so each icon draws it over the obsidian
house background with a soft brushed-gold glow. Run from the repo root:
    python3 make_icons.py
"""
from PIL import Image, ImageDraw, ImageFilter

S = 1024
INK = (10, 9, 12)
GOLD = (201, 163, 73)


def bg(size):
    """Obsidian plate with a warm radial glow behind the mark."""
    img = Image.new("RGB", (size, size), INK)
    d = ImageDraw.Draw(img)
    cx, cy = size / 2, size * 0.44
    steps = 240
    for i in range(steps, 0, -1):
        r = size * 0.82 * i / steps
        a = 0.34 * (1 - i / steps) ** 1.7
        col = (int(INK[0] + 62 * a), int(INK[1] + 50 * a), int(INK[2] + 22 * a))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
    # thin gold hairline frame
    d.rectangle([size * 0.055, size * 0.055, size * 0.945, size * 0.945],
                outline=(int(GOLD[0] * 0.45), int(GOLD[1] * 0.45), int(GOLD[2] * 0.45)),
                width=max(1, int(size * 0.004)))
    return img


def compose(size, mark_height):
    plate = bg(size).convert("RGBA")
    mark = Image.open("assets/img/logo-monogram.png").convert("RGBA")
    h = int(size * mark_height)
    w = round(mark.width * h / mark.height)
    mark = mark.resize((w, h), Image.LANCZOS)

    # soft gold bloom under the mark
    bloom = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bloom)
    bx, by = (size - w) / 2, (size - h) / 2
    bd.ellipse([bx - w * 0.15, by - h * 0.08, bx + w * 1.15, by + h * 1.08],
               fill=(201, 163, 73, 46))
    bloom = bloom.filter(ImageFilter.GaussianBlur(size * 0.06))
    plate = Image.alpha_composite(plate, bloom)
    plate.alpha_composite(mark, (int((size - w) / 2), int((size - h) / 2)))
    return plate


full = compose(S, 0.60)
full.resize((512, 512), Image.LANCZOS).convert("RGB").save("assets/icons/icon-512.png", optimize=True)
full.resize((192, 192), Image.LANCZOS).convert("RGB").save("assets/icons/icon-192.png", optimize=True)
full.resize((180, 180), Image.LANCZOS).convert("RGB").save("assets/icons/apple-touch-icon.png", optimize=True)

# maskable: keep the mark inside the central 80% safe zone
maskable = compose(S, 0.46)
maskable.resize((512, 512), Image.LANCZOS).convert("RGB").save("assets/icons/icon-maskable-512.png", optimize=True)

print("icons done — Z·Ø monogram")
