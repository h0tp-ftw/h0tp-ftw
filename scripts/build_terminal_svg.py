#!/usr/bin/env python3
"""Generate the animated Catppuccin terminal SVGs for the profile README.

Writes assets/terminal-frappe.svg (dark) and assets/terminal-latte.svg (light).
README.md references both via <picture>, so the terminal matches each viewer's
GitHub theme. Everything animates via pure SMIL so it plays in GitHub's proxied
<img> embeds:

  * each line "types" itself in via a clip-path reveal, then
  * the status line cycles ROTATING_WORDS forever (type -> hold -> delete),
    mirroring the rotating "Just another <word>" text on the portfolio site.

Degrades to a fully-typed terminal (showing the first word) if a renderer
ignores SMIL.

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

# Cycled in the status line — same self-deprecating set as the portfolio site.
ROTATING_WORDS = [
    "unpaid", "unknown", "overworked", "broke",
    "caffeinated", "sleep-deprived", "passionate", "dedicated",
]
STATUS_PREFIX = "Just another "


def prompt():
    """Shell-prompt segments rendered before each command."""
    return [("h0tp", "green"), ("@", "subtext"), ("portfolio", "blue"),
            (":", "subtext"), ("~", "peach"), ("$", "subtext")]


# Intro lines (each "typed" once). The status line is rendered separately.
INTRO_LINES = [
    prompt() + [(" whoami", "text")],
    [("FOSS developer, Swing Trader & AI enthusiast", "mauve")],
    prompt() + [(" cat skills.txt", "text")],
    [("Bioinformatics · Game Dev · RL & AI · Cybersecurity", "text")],
    prompt() + [(" cat status.txt", "text")],
]
STATUS_ROW = len(INTRO_LINES)  # the rotating line sits just below the intro

W, H = 760, 300
PAD_X = 28
BODY_TOP = 86
LINE_H = 33
FONT_SIZE = 17
CW = FONT_SIZE * 0.6          # monospace character advance (approx)
CLIP_W = W - 2 * PAD_X + 8    # generous per-line reveal width
FONT = "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Courier New', monospace"

# Rotating-word timing (seconds)
TYPE, HOLD, DEL, GAP = 0.45, 1.15, 0.30, 0.18
SLOT = TYPE + HOLD + DEL + GAP
CYCLE = SLOT * len(ROTATING_WORDS)
ROT_BEGIN = 0.4 + STATUS_ROW * 0.82 + 0.7  # start cycling once the prompt is typed


def _intro_begin(i):
    return 0.4 + i * 0.82


def _word_keyframes(i, w_px):
    """(keyTimes, values) for word i's reveal-rect width across one CYCLE."""
    a = i * SLOT
    if i == 0:
        times = [0.0, TYPE, TYPE + HOLD, TYPE + HOLD + DEL, CYCLE]
        vals = [0, w_px, w_px, 0, 0]
    else:
        times = [0.0, a, a + TYPE, a + TYPE + HOLD, a + TYPE + HOLD + DEL, CYCLE]
        vals = [0, 0, w_px, w_px, 0, 0]
    keytimes = [min(1.0, t / CYCLE) for t in times]
    return (";".join(f"{k:.4f}" for k in keytimes),
            ";".join(str(v) for v in vals))


def build(theme):
    p = PALETTES[theme]
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
        f'viewBox="0 0 {W} {H}" fill="none" font-family="{FONT}">'
    ]

    status_y = BODY_TOP + STATUS_ROW * LINE_H
    word_x = PAD_X + len(STATUS_PREFIX) * CW

    # ---- defs: shadow + reveal clips (intro lines, status prefix, each word)
    out.append('<defs>')
    out.append('<filter id="sh" x="-8%" y="-8%" width="116%" height="124%">'
               '<feDropShadow dx="0" dy="6" stdDeviation="10" '
               'flood-color="#000000" flood-opacity="0.22"/></filter>')
    for i in range(len(INTRO_LINES)):
        y = BODY_TOP + i * LINE_H - 23
        out.append(
            f'<clipPath id="clip{i}"><rect x="{PAD_X - 4}" y="{y}" '
            f'width="{CLIP_W}" height="28" rx="3">'
            f'<animate attributeName="width" from="0" to="{CLIP_W}" '
            f'begin="{_intro_begin(i):.2f}s" dur="0.66s" fill="freeze"/>'
            f'</rect></clipPath>'
        )
    # status prefix ("Just another ") types in with the sequence
    pre_w = len(STATUS_PREFIX) * CW + 6
    out.append(
        f'<clipPath id="clipPre"><rect x="{PAD_X - 4}" y="{status_y - 23}" '
        f'width="{pre_w:.0f}" height="28" rx="3">'
        f'<animate attributeName="width" from="0" to="{pre_w:.0f}" '
        f'begin="{_intro_begin(STATUS_ROW):.2f}s" dur="0.66s" fill="freeze"/>'
        f'</rect></clipPath>'
    )
    # one cycling clip per rotating word
    for i, word in enumerate(ROTATING_WORDS):
        w_px = (len(word) + 1) * CW + 4          # +1 leaves room for the cursor
        authored = round(w_px) if i == 0 else 0  # word 0 shows in static fallback
        kt, vals = _word_keyframes(i, round(w_px))
        out.append(
            f'<clipPath id="clipW{i}"><rect x="{word_x - 3:.0f}" '
            f'y="{status_y - 23}" width="{authored}" height="28" rx="3">'
            f'<animate attributeName="width" dur="{CYCLE:.2f}s" '
            f'begin="{ROT_BEGIN:.2f}s" repeatCount="indefinite" '
            f'calcMode="linear" keyTimes="{kt}" values="{vals}"/>'
            f'</rect></clipPath>'
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

    # ---- intro lines
    for i, segs in enumerate(INTRO_LINES):
        y = BODY_TOP + i * LINE_H
        out.append(f'<g clip-path="url(#clip{i})">'
                   f'<text x="{PAD_X}" y="{y}" font-size="{FONT_SIZE}" '
                   f'xml:space="preserve">')
        for text, key in segs:
            out.append(f'<tspan fill="{p[key]}">{html.escape(text)}</tspan>')
        out.append('</text></g>')

    # ---- status line: static prefix + cycling words (each with its own cursor)
    out.append(f'<g clip-path="url(#clipPre)">'
               f'<text x="{PAD_X}" y="{status_y}" font-size="{FONT_SIZE}" '
               f'xml:space="preserve"><tspan fill="{p["yellow"]}">'
               f'{html.escape(STATUS_PREFIX)}</tspan></text></g>')
    for i, word in enumerate(ROTATING_WORDS):
        out.append(
            f'<g clip-path="url(#clipW{i})">'
            f'<text x="{word_x:.0f}" y="{status_y}" font-size="{FONT_SIZE}" '
            f'xml:space="preserve"><tspan fill="{p["yellow"]}">'
            f'{html.escape(word)}</tspan>'
            f'<tspan fill="{p["text"]}">▌<animate attributeName="opacity" '
            f'values="1;1;0;0" dur="1.06s" repeatCount="indefinite"/></tspan>'
            f'</text></g>'
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
              f"({len(svg)} bytes, {len(ROTATING_WORDS)} rotating words)")


if __name__ == "__main__":
    main()
