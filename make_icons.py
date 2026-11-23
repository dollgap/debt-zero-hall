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
    size = img.size[0]
    d = ImageDraw.Draw(img, "RGBA")
    c = size/2
    # arch: outer
    w = 3.2*scale*size/1024*3
    r = size*0.235*scale
    top = c - size*0.235*scale
    outer_left = c - r
    outer_right = c + r
    base_y = c + size*0.205*scale
    # arch outline (rounded top + straight sides)
    d.arc([outer_left, top, outer_right, top + 2*r], 180, 360, fill=GOLD+(255,), width=int(max(2, w)))
    d.line([(outer_left, top+r), (outer_left, base_y)], fill=GOLD+(255,), width=int(max(2,w)))
    d.line([(outer_right, top+r), (outer_right, base_y)], fill=GOLD+(255,), width=int(max(2,w)))
    # inner arch
    r2 = r*0.62
    t2 = c - r2
    w2 = max(1.6, w*0.55)
    d.arc([c-r2, t2, c+r2, t2+2*r2], 180, 360, fill=GOLD+(150,), width=int(w2))
    d.line([(c-r2, t2+r2), (c-r2, base_y)], fill=GOLD+(150,), width=int(w2))
    d.line([(c+r2, t2+r2), (c+r2, base_y)], fill=GOLD+(150,), width=int(w2))
    # zero ring
    zr = size*0.088*scale
    zc = (c, c + size*0.055*scale)
    d.ellipse([zc[0]-zr, zc[1]-zr, zc[0]+zr, zc[1]+zr], outline=GOLD_BRIGHT+(255,), width=int(max(2, w*0.95)))
    # base line
    d.line([(c-r*1.22, base_y), (c+r*1.22, base_y)], fill=GOLD+(190,), width=int(max(2,w*0.7)))
    # small gold dot above
    dr = size*0.014*scale
    d.ellipse([c-dr, base_y+size*0.045*scale-dr, c+dr, base_y+size*0.045*scale+dr], fill=GOLD_BRIGHT+(230,))
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
