from PIL import Image, ImageDraw
import math

S = 1024
GOLD = (201, 163, 73)
GOLD_BRIGHT = (237, 219, 159)
INK = (10, 9, 12)

def bg(size, maskable=False):
    img = Image.new("RGB", (size, size), INK)
    d = ImageDraw.Draw(img)
    # radial glow
    cx, cy = size/2, size*0.42
    steps = 220
    for i in range(steps, 0, -1):
        r = size*0.78*i/steps
        a = 0.30*(1-i/steps)**1.6
        col = (int(INK[0]+ (52)*a), int(INK[1]+ (44)*a), int(INK[2]+ (20)*a))
        d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=col)
    # subtle vertical warm gradient bottom
    for y in range(size):
        t = y/size
        v = int(6*(1-t))
        d.line([(0,y),(size,y)], fill=(INK[0]+v, INK[1]+v, INK[2]+v))
    return img

def draw_emblem(img, scale=1.0):
    """Lightning bolt mark for ZEROED."""
    size = img.size[0]
    d = ImageDraw.Draw(img, "RGBA")
    c = size / 2
    def P(x, y):
        return (c + x * size * scale, c + y * size * scale)
    bolt = [
        P(0.055, -0.30), P(-0.205, 0.045), P(-0.020, 0.045),
        P(-0.075, 0.30), P(0.205, -0.045), P(0.020, -0.045),
        P(0.055, -0.30)
    ]
    d.polygon(bolt, fill=GOLD_BRIGHT + (255,))
    # subtle inner gold rim
    d.line(bolt + [bolt[0]], fill=GOLD + (255,), width=max(2, int(size * 0.006 * scale)))
    return img

# full icon
img = bg(S)
draw_emblem(img, 1.0)
img.save("assets/icons/icon-512.png", optimize=True)
img.resize((192,192), Image.LANCZOS).save("assets/icons/icon-192.png", optimize=True)

# maskable: safe zone -> emblem smaller (80% content, centered)
m = bg(S)
d = ImageDraw.Draw(m)
draw_emblem(m, 0.74)
m.save("assets/icons/icon-maskable-512.png", optimize=True)

# apple touch 180
img.resize((180,180), Image.LANCZOS).save("assets/icons/apple-touch-icon.png", optimize=True)
print("icons done")
