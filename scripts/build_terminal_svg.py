#!/usr/bin/env python3
"""Generate the Catppuccin terminal SVGs for the profile README.

Writes assets/terminal-frappe.svg (dark) and assets/terminal-latte.svg (light);
README.md references both via <picture> so the terminal matches each viewer's
GitHub theme.

The terminal is STATIC except the status line, which mimics the portfolio site's
rotating text: in "Just another <word> FOSS developer", the <word> types out
char-by-char, holds, erases, and the next word types — with a blinking cursor
riding the word's right edge and "FOSS developer" reflowing after it. All motion
is pure SMIL (a per-word clip "reveal" for type/erase + x-position animations for
the cursor and suffix), so it plays in GitHub's proxied <img> embeds. Falls back
to the first word fully typed if a renderer ignores SMIL.

Re-run after editing the lines/palette/words:
    python3 scripts/build_terminal_svg.py
"""
import html
import os
import xml.dom.minidom as minidom

PALETTES = {
    "frappe": {  # Catppuccin Frappé (dark)
        "base": "#303446", "crust": "#232634", "surface": "#414559",
        "text": "#c6d0f5", "subtext": "#a5adce", "overlay": "#949cbb",
        "red": "#e78284", "green": "#a6d189", "yellow": "#e5c890",
        "blue": "#8caaee", "mauve": "#ca9ee6", "peach": "#ef9f76",
    },
    "latte": {  # Catppuccin Latte (light)
        "base": "#eff1f5", "crust": "#dce0e8", "surface": "#ccd0da",
        "text": "#4c4f69", "subtext": "#6c6f85", "overlay": "#8c8fa1",
        "red": "#d20f39", "green": "#40a02b", "yellow": "#df8e1d",
        "blue": "#1e66f5", "mauve": "#8839ef", "peach": "#fe640b",
    },
}

# The word that types/erases — same self-deprecating set as the portfolio site.
ROTATING_WORDS = [
    "unpaid", "unknown", "overworked", "broke",
    "caffeinated", "sleep-deprived", "passionate", "dedicated",
]
STATUS_PREFIX = "Just another "
STATUS_SUFFIX = "FOSS developer"

# Typewriter timing (seconds)
CHAR_TYPE = 0.085   # per-char typing
CHAR_ERASE = 0.045  # per-char erasing (faster, like a real backspace)
HOLD = 1.5          # pause on the fully-typed word
GAP = 0.45          # blank pause before the next word types


def prompt():
    """Shell-prompt segments rendered before each command."""
    return [("h0tp", "green"), ("@", "subtext"), ("portfolio", "blue"),
            (":", "subtext"), ("~", "peach"), ("$", "subtext")]


# Intro lines, all shown statically. The status line is rendered separately.
INTRO_LINES = [
    prompt() + [(" whoami", "text")],
    [("FOSS developer, Swing Trader & AI enthusiast", "mauve")],
    prompt() + [(" cat skills.txt", "text")],
    [("Bioinformatics · Game Dev · RL & AI · Cybersecurity", "text")],
    prompt() + [(" cat status.txt", "text")],
]
STATUS_ROW = len(INTRO_LINES)

W, H = 760, 300
PAD_X = 28
BODY_TOP = 86
LINE_H = 33
FONT_SIZE = 17
CW = FONT_SIZE * 0.6  # monospace character advance (approx)
CUR_GAP = CW * 1.2    # space between the word's edge and "FOSS developer"
FONT = "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Courier New', monospace"


def schedule():
    """Per-word (start, type_dur, erase_dur, width_px); plus the total CYCLE."""
    rows, t = [], 0.0
    for word in ROTATING_WORDS:
        n = len(word)
        type_dur, erase_dur, width = n * CHAR_TYPE, n * CHAR_ERASE, n * CW
        rows.append((t, type_dur, erase_dur, width))
        t += type_dur + HOLD + erase_dur + GAP
    return rows, t


def _anim(attr, pts, cycle):
    """A looping linear <animate> from (time, value) points (dedups equal times)."""
    dd = []
    for tt, vv in pts:
        if dd and abs(dd[-1][0] - tt) < 1e-9:
            dd[-1] = (tt, vv)
        else:
            dd.append((tt, vv))
    kt = ";".join(f"{min(1.0, tt / cycle):.4f}" for tt, _ in dd)
    vs = ";".join(f"{vv:.1f}" for _, vv in dd)
    return (f'<animate attributeName="{attr}" dur="{cycle:.2f}s" begin="0s" '
            f'repeatCount="indefinite" calcMode="linear" keyTimes="{kt}" '
            f'values="{vs}"/>')


def build(theme):
    p = PALETTES[theme]
    rows, cycle = schedule()
    status_y = BODY_TOP + STATUS_ROW * LINE_H
    word_x = PAD_X + len(STATUS_PREFIX) * CW
    w0 = rows[0][3]  # first word width, for the static fallback

    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
        f'viewBox="0 0 {W} {H}" fill="none" font-family="{FONT}">'
    ]

    # ---- defs: shadow + one type/erase reveal clip per word
    out.append('<defs><filter id="sh" x="-8%" y="-8%" width="116%" height="124%">'
               '<feDropShadow dx="0" dy="6" stdDeviation="10" '
               'flood-color="#000000" flood-opacity="0.22"/></filter>')
    for i, (s, td, ed, wpx) in enumerate(rows):
        pts = [(0.0, 0)]
        if s > 0:
            pts.append((s, 0))
        pts += [(s + td, wpx), (s + td + HOLD, wpx), (s + td + HOLD + ed, 0),
                (cycle, 0)]
        authored = round(wpx) if i == 0 else 0
        out.append(
            f'<clipPath id="clipW{i}"><rect x="{word_x - 3:.0f}" '
            f'y="{status_y - 23}" width="{authored}" height="28" rx="2">'
            f'{_anim("width", pts, cycle)}</rect></clipPath>'
        )
    out.append('</defs>')

    # ---- window chrome
    out.append(f'<rect x="8" y="8" width="{W - 16}" height="{H - 16}" rx="14" '
               f'fill="{p["base"]}" stroke="{p["surface"]}" stroke-width="1.5" '
               f'filter="url(#sh)"/>')
    out.append(f'<path d="M22,8 H{W - 22} A14,14 0 0 1 {W - 8},22 V48 H8 V22 '
               f'A14,14 0 0 1 22,8 Z" fill="{p["crust"]}"/>')
    for cx, col in [(30, "red"), (50, "yellow"), (70, "green")]:
        out.append(f'<circle cx="{cx}" cy="28" r="6" fill="{p[col]}"/>')
    out.append(f'<text x="{W / 2:.0f}" y="32" text-anchor="middle" '
               f'font-size="13" fill="{p["overlay"]}">h0tp@portfolio: ~</text>')

    # ---- intro lines (static)
    for i, segs in enumerate(INTRO_LINES):
        y = BODY_TOP + i * LINE_H
        out.append(f'<text x="{PAD_X}" y="{y}" font-size="{FONT_SIZE}" '
                   f'xml:space="preserve">')
        for text, key in segs:
            out.append(f'<tspan fill="{p[key]}">{html.escape(text)}</tspan>')
        out.append('</text>')

    # master edge timeline: x of the word's right edge over the whole cycle
    edge = []
    for s, td, ed, wpx in rows:
        edge += [(s, 0), (s + td, wpx), (s + td + HOLD, wpx), (s + td + HOLD + ed, 0)]
    edge.append((cycle, 0))
    cur_pts = [(t, word_x + w) for t, w in edge]
    suf_pts = [(t, word_x + w + CUR_GAP) for t, w in edge]

    # ---- status line: static prefix, each word (clipped), reflowing suffix, cursor
    out.append(f'<text x="{PAD_X}" y="{status_y}" font-size="{FONT_SIZE}" '
               f'xml:space="preserve"><tspan fill="{p["yellow"]}">'
               f'{html.escape(STATUS_PREFIX)}</tspan></text>')
    for i, word in enumerate(ROTATING_WORDS):
        out.append(
            f'<g clip-path="url(#clipW{i})"><text x="{word_x:.0f}" y="{status_y}" '
            f'font-size="{FONT_SIZE}" fill="{p["yellow"]}" xml:space="preserve">'
            f'{html.escape(word)}</text></g>'
        )
    out.append(
        f'<text y="{status_y}" font-size="{FONT_SIZE}" fill="{p["text"]}" '
        f'x="{word_x + w0 + CUR_GAP:.0f}">{html.escape(STATUS_SUFFIX)}'
        f'{_anim("x", suf_pts, cycle)}</text>'
    )
    out.append(
        f'<text y="{status_y}" font-size="{FONT_SIZE}" fill="{p["text"]}" '
        f'x="{word_x + w0:.0f}">▌'
        f'<animate attributeName="opacity" values="1;1;0;0" dur="1.06s" '
        f'repeatCount="indefinite"/>{_anim("x", cur_pts, cycle)}</text>'
    )

    out.append('</svg>')
    return "".join(out)


def main():
    assets = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "assets"))
    os.makedirs(assets, exist_ok=True)
    _, cycle = schedule()
    for theme, fname in [("frappe", "terminal-frappe.svg"), ("latte", "terminal-latte.svg")]:
        svg = build(theme)
        minidom.parseString(svg)  # fail loudly on malformed XML
        path = os.path.join(assets, fname)
        with open(path, "w", encoding="utf-8") as f:
            f.write(svg + "\n")
        print(f"wrote {os.path.relpath(path, os.path.dirname(assets))} "
              f"({len(svg)} bytes, type/erase cycle {cycle:.1f}s)")


if __name__ == "__main__":
    main()
