#!/usr/bin/env python3
"""Generate the Catppuccin terminal SVGs for the profile README.

Writes assets/terminal-frappe.svg (dark) and assets/terminal-latte.svg (light);
README.md references both via <picture> so the terminal matches each viewer's
GitHub theme.

The terminal itself is STATIC — every line is just shown. The only motion is the
status line, which cycles the word in "Just another <word> FOSS developer"
through ROTATING_WORDS, exactly like the rotating text on the portfolio site.
Each word cross-fades to the next (pure SMIL, so it plays in GitHub's proxied
<img> embeds); if a renderer ignores SMIL it falls back to the first word.

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

# The word that cycles — same self-deprecating set as the portfolio site.
ROTATING_WORDS = [
    "unpaid", "unknown", "overworked", "broke",
    "caffeinated", "sleep-deprived", "passionate", "dedicated",
]
STATUS_PREFIX = "Just another "
STATUS_SUFFIX = " FOSS developer"


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
FONT = "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Courier New', monospace"

# Word-rotation timing (seconds): calm, ~2.4s per word.
FADE = 0.4
SLOT = 2.4
CYCLE = SLOT * len(ROTATING_WORDS)


def _opacity_keyframes(i):
    """(keyTimes, values) fading word i in for its slot, out otherwise."""
    a, b = i * SLOT, (i + 1) * SLOT
    pts = [(0.0, 0), (a, 0), (a + FADE, 1), (b - FADE, 1), (b, 0), (CYCLE, 0)]
    dedup = []
    for t, v in pts:                       # drop duplicate timestamps (i=0, last)
        if dedup and abs(dedup[-1][0] - t) < 1e-9:
            continue
        dedup.append((t, v))
    kt = ";".join(f"{min(1.0, t / CYCLE):.4f}" for t, _ in dedup)
    vals = ";".join(str(v) for _, v in dedup)
    return kt, vals


def build(theme):
    p = PALETTES[theme]
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
        f'viewBox="0 0 {W} {H}" fill="none" font-family="{FONT}">'
    ]

    status_y = BODY_TOP + STATUS_ROW * LINE_H
    word_x = PAD_X + len(STATUS_PREFIX) * CW

    out.append('<defs><filter id="sh" x="-8%" y="-8%" width="116%" height="124%">'
               '<feDropShadow dx="0" dy="6" stdDeviation="10" '
               'flood-color="#000000" flood-opacity="0.22"/></filter></defs>')

    # window chrome
    out.append(f'<rect x="8" y="8" width="{W - 16}" height="{H - 16}" rx="14" '
               f'fill="{p["base"]}" stroke="{p["surface"]}" stroke-width="1.5" '
               f'filter="url(#sh)"/>')
    out.append(f'<path d="M22,8 H{W - 22} A14,14 0 0 1 {W - 8},22 V48 H8 V22 '
               f'A14,14 0 0 1 22,8 Z" fill="{p["crust"]}"/>')
    for cx, col in [(30, "red"), (50, "yellow"), (70, "green")]:
        out.append(f'<circle cx="{cx}" cy="28" r="6" fill="{p[col]}"/>')
    out.append(f'<text x="{W / 2:.0f}" y="32" text-anchor="middle" '
               f'font-size="13" fill="{p["overlay"]}">h0tp@portfolio: ~</text>')

    # intro lines (static)
    for i, segs in enumerate(INTRO_LINES):
        y = BODY_TOP + i * LINE_H
        out.append(f'<text x="{PAD_X}" y="{y}" font-size="{FONT_SIZE}" '
                   f'xml:space="preserve">')
        for text, key in segs:
            out.append(f'<tspan fill="{p[key]}">{html.escape(text)}</tspan>')
        out.append('</text>')

    # status line: static "Just another ", then the cross-fading word + suffix
    out.append(f'<text x="{PAD_X}" y="{status_y}" font-size="{FONT_SIZE}" '
               f'xml:space="preserve"><tspan fill="{p["yellow"]}">'
               f'{html.escape(STATUS_PREFIX)}</tspan></text>')
    for i, word in enumerate(ROTATING_WORDS):
        kt, vals = _opacity_keyframes(i)
        out.append(
            f'<g opacity="{1 if i == 0 else 0}">'
            f'<text x="{word_x:.0f}" y="{status_y}" font-size="{FONT_SIZE}" '
            f'xml:space="preserve"><tspan fill="{p["yellow"]}">{html.escape(word)}</tspan>'
            f'<tspan fill="{p["text"]}">{html.escape(STATUS_SUFFIX)}</tspan>'
            f'<tspan fill="{p["overlay"]}"> ▌<animate attributeName="opacity" '
            f'values="1;1;0;0" dur="1.06s" repeatCount="indefinite"/></tspan></text>'
            f'<animate attributeName="opacity" dur="{CYCLE:.2f}s" begin="0s" '
            f'repeatCount="indefinite" calcMode="linear" keyTimes="{kt}" '
            f'values="{vals}"/></g>'
        )

    out.append('</svg>')
    return "".join(out)


def main():
    assets = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "assets"))
    os.makedirs(assets, exist_ok=True)
    for theme, fname in [("frappe", "terminal-frappe.svg"), ("latte", "terminal-latte.svg")]:
        svg = build(theme)
        minidom.parseString(svg)  # fail loudly on malformed XML
        path = os.path.join(assets, fname)
        with open(path, "w", encoding="utf-8") as f:
            f.write(svg + "\n")
        print(f"wrote {os.path.relpath(path, os.path.dirname(assets))} "
              f"({len(svg)} bytes, static terminal + {len(ROTATING_WORDS)} cycling words)")


if __name__ == "__main__":
    main()
