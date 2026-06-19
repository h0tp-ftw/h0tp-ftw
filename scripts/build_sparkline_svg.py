#!/usr/bin/env python3
"""Generate the live swing-trading sparkline SVGs for the profile README.

Reads the portfolio's cumulative time-weighted return (the `return` column of
portfolio-returns.csv, served from the website repo) and renders a compact
"stat card": a big current-return number + an animated sparkline of the curve.
Frappé (dark) and Latte (light) variants are produced for <picture>.

The CSV lives in the website repo, so by default we fetch it over HTTPS; the
Generate-profile-assets workflow re-runs this twice a day, keeping the number on
the profile in sync with the portfolio without any manual step.

    python3 scripts/build_sparkline_svg.py                 # fetch live CSV -> assets/
    python3 scripts/build_sparkline_svg.py --csv path.csv --out dist
"""
import argparse
import os
import urllib.request
import xml.dom.minidom as minidom

CSV_URL = ("https://raw.githubusercontent.com/h0tp-ftw/h0tp-ftw.github.io"
           "/main/assets/portfolio-returns.csv")

PALETTES = {
    "frappe": {"base": "#303446", "crust": "#232634", "surface": "#414559",
               "text": "#c6d0f5", "subtext": "#a5adce", "overlay": "#949cbb",
               "green": "#a6d189", "red": "#e78284"},
    "latte": {"base": "#eff1f5", "crust": "#dce0e8", "surface": "#ccd0da",
              "text": "#4c4f69", "subtext": "#6c6f85", "overlay": "#8c8fa1",
              "green": "#40a02b", "red": "#d20f39"},
}

_MONTHS = {"01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May",
           "06": "Jun", "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct",
           "11": "Nov", "12": "Dec"}

W, H = 470, 150


def load_csv(src):
    if src.startswith("http"):
        with urllib.request.urlopen(src, timeout=30) as r:
            text = r.read().decode("utf-8")
    else:
        with open(src, encoding="utf-8") as f:
            text = f.read()
    rows = [ln.split(",") for ln in text.splitlines() if ln.strip()][1:]
    months = [r[0].strip() for r in rows]
    cumulative = [float(r[1]) for r in rows]
    return months, cumulative


def month_label(token):
    """'Oct-24' -> 'Oct 2024'; 'Jan-25' -> 'Jan 2025'."""
    name, _, yy = token.partition("-")
    name = _MONTHS.get(name, name)
    year = "20" + yy if len(yy) == 2 else yy
    return f"{name} {year}"


def sparkline_points(cum, x0, x1, y0, y1):
    n = len(cum)
    lo, hi = min(cum), max(cum)
    span = (hi - lo) or 1.0
    pts = []
    for i, v in enumerate(cum):
        x = x0 + (x1 - x0) * (i / (n - 1) if n > 1 else 0)
        y = y1 - (v - lo) / span * (y1 - y0)
        pts.append((x, y))
    return pts


def build(theme, months, cum):
    p = PALETTES[theme]
    last = cum[-1]
    up = last >= 0
    accent = p["green"] if up else p["red"]
    sign = "+" if up else "−"
    since = month_label(months[0]) if months else ""

    gx0, gx1, gy0, gy1 = 250, W - 26, 40, H - 34   # sparkline plot box
    pts = sparkline_points(cum, gx0, gx1, gy0, gy1)
    line = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts)
    area = (f"M{pts[0][0]:.1f} {gy1:.1f} L"
            + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts)
            + f" L{pts[-1][0]:.1f} {gy1:.1f} Z")
    ex, ey = pts[-1]

    rgb = ",".join(str(int(accent[j:j + 2], 16)) for j in (1, 3, 5))

    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
        f'viewBox="0 0 {W} {H}" fill="none" '
        f'font-family="\'Inter\',\'Segoe UI\',system-ui,sans-serif">',
        '<defs>',
        '<filter id="sh" x="-8%" y="-8%" width="116%" height="124%">'
        '<feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" '
        'flood-opacity="0.22"/></filter>',
        f'<linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="rgb({rgb})" stop-opacity="0.45"/>'
        f'<stop offset="1" stop-color="rgb({rgb})" stop-opacity="0.02"/>'
        f'</linearGradient>',
        '</defs>',
        # panel
        f'<rect x="6" y="6" width="{W - 12}" height="{H - 12}" rx="14" '
        f'fill="{p["base"]}" stroke="{p["surface"]}" stroke-width="1.5" '
        f'filter="url(#sh)"/>',
        # left stat block
        f'<text x="26" y="46" font-size="11" letter-spacing="2.5" '
        f'font-weight="700" fill="{p["overlay"]}">SWING STRATEGY</text>',
        f'<text x="24" y="92" font-size="40" font-weight="800" '
        f'fill="{accent}">{sign}{abs(last):.1f}%</text>',
        f'<text x="26" y="116" font-size="12.5" fill="{p["subtext"]}">'
        f'cumulative TWR · since {since}</text>',
        # sparkline fill + line (draws itself on)
        f'<path d="{area}" fill="url(#fill)"/>',
        f'<path d="{line}" stroke="{accent}" stroke-width="2.6" '
        f'stroke-linecap="round" stroke-linejoin="round" pathLength="1" '
        f'stroke-dasharray="1" stroke-dashoffset="1">'
        f'<animate attributeName="stroke-dashoffset" from="1" to="0" '
        f'begin="0.3s" dur="1.5s" fill="freeze"/></path>',
        # end marker with a soft pulse
        f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="3.6" fill="{accent}">'
        f'<animate attributeName="r" values="3.6;5.2;3.6" dur="2s" '
        f'begin="1.8s" repeatCount="indefinite"/></circle>',
    ]
    out.append('</svg>')
    return "".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default=CSV_URL)
    ap.add_argument("--out", default=os.path.normpath(
        os.path.join(os.path.dirname(__file__), "..", "assets")))
    args = ap.parse_args()

    months, cum = load_csv(args.csv)
    os.makedirs(args.out, exist_ok=True)
    for theme, fname in [("frappe", "sparkline-frappe.svg"),
                         ("latte", "sparkline-latte.svg")]:
        svg = build(theme, months, cum)
        minidom.parseString(svg)  # fail loudly on malformed XML
        path = os.path.join(args.out, fname)
        with open(path, "w", encoding="utf-8") as f:
            f.write(svg + "\n")
        print(f"wrote {path}  (last={cum[-1]:.2f}%, {len(cum)} months)")


if __name__ == "__main__":
    main()
