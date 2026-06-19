#!/usr/bin/env python3
"""Generate the animated Catppuccin terminal SVGs for the profile README.

Writes assets/terminal-frappe.svg (dark) and assets/terminal-latte.svg (light).
README.md references both via <picture>, so the terminal matches each viewer's
GitHub theme. The animation is pure SMIL (a clip-path "typing" reveal per line +
a blinking cursor), which plays in GitHub's proxied <img> embeds and degrades
gracefully to a fully-typed terminal if a renderer ignores SMIL.

Re-run after editing the lines/palette:  python3 scripts/build_terminal_svg.py
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


def prompt():
    """The shell prompt segments rendered before each command."""
    return [("h0tp", "green"), ("@", "subtext"), ("portfolio", "blue"),
            (":", "subtext"), ("~", "peach"), ("$", "subtext")]


# Each line is a list of (text, color-key) segments.
LINES = [
    prompt() + [(" whoami", "text")],
    [("FOSS developer, Swing Trader & AI enthusiast", "mauve")],
    prompt() + [(" cat skills.txt", "text")],
    [("Bioinformatics · Game Dev · RL & AI · Cybersecurity", "text")],
    prompt() + [(" cat status.txt", "text")],
    [("Just another caffeinated FOSS developer ☕", "yellow")],
]

W, H = 760, 300
PAD_X = 28
BODY_TOP = 86
LINE_H = 33
FONT_SIZE = 17
CLIP_W = W - 2 * PAD_X + 8  # generous per-line reveal width
FONT = "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Courier New', monospace"


def build(theme):
    p = PALETTES[theme]
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
        f'viewBox="0 0 {W} {H}" fill="none" font-family="{FONT}">'
    ]

    # defs: a soft shadow + one animated clip per line (the "typing" reveal)
    out.append('<defs>')
    out.append('<filter id="sh" x="-8%" y="-8%" width="116%" height="124%">'
               '<feDropShadow dx="0" dy="6" stdDeviation="10" '
               'flood-color="#000000" flood-opacity="0.22"/></filter>')
    for i in range(len(LINES)):
        y = BODY_TOP + i * LINE_H - 23
        begin = 0.4 + i * 0.82
        out.append(
            f'<clipPath id="clip{i}"><rect x="{PAD_X - 4}" y="{y}" '
            f'width="{CLIP_W}" height="28" rx="3">'
            f'<animate attributeName="width" from="0" to="{CLIP_W}" '
            f'begin="{begin:.2f}s" dur="0.66s" fill="freeze"/></rect></clipPath>'
        )
    out.append('</defs>')

    # window + title bar (only top corners rounded) + traffic lights + title
    out.append(f'<rect x="8" y="8" width="{W - 16}" height="{H - 16}" rx="14" '
               f'fill="{p["base"]}" stroke="{p["surface"]}" stroke-width="1.5" '
               f'filter="url(#sh)"/>')
    out.append(f'<path d="M22,8 H{W - 22} A14,14 0 0 1 {W - 8},22 V48 H8 V22 '
               f'A14,14 0 0 1 22,8 Z" fill="{p["crust"]}"/>')
    for cx, col in [(30, "red"), (50, "yellow"), (70, "green")]:
        out.append(f'<circle cx="{cx}" cy="28" r="6" fill="{p[col]}"/>')
    out.append(f'<text x="{W / 2:.0f}" y="32" text-anchor="middle" '
               f'font-size="13" fill="{p["overlay"]}">h0tp@portfolio: ~</text>')

    # body lines, each clipped by its animated reveal rect
    for i, segs in enumerate(LINES):
        y = BODY_TOP + i * LINE_H
        out.append(f'<g clip-path="url(#clip{i})">'
                   f'<text x="{PAD_X}" y="{y}" font-size="{FONT_SIZE}" '
                   f'xml:space="preserve">')
        for text, key in segs:
            out.append(f'<tspan fill="{p[key]}">{html.escape(text)}</tspan>')
        if i == len(LINES) - 1:  # blinking block cursor trails the last line
            out.append(f'<tspan fill="{p["text"]}">▌'
                       f'<animate attributeName="opacity" values="1;1;0;0" '
                       f'dur="1.06s" repeatCount="indefinite"/></tspan>')
        out.append('</text></g>')

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
        print(f"wrote {os.path.relpath(path, os.path.dirname(assets))} ({len(svg)} bytes)")


if __name__ == "__main__":
    main()
