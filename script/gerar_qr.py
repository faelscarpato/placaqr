#!/usr/bin/env python3
"""
Gerador de lote de QR Codes para placas de avaliação.
Uso:
    pip install segno
    python gerar_qr.py --base-url https://placaqr.pages.dev/r --qtd 100 --lote L001 --prefixo ""

Saídas (pasta ./saida_<lote>/):
    svg/<CODIGO>.svg   -> vetorial, arraste no Illustrator (Vincular/Incorporar)
    png/<CODIGO>.png   -> opcional (--png)
    lote_<lote>.csv    -> lista dos códigos e URLs (para data merge)
    lote_<lote>.sql    -> INSERT pronto para colar no SQL Editor do Supabase
    todos_<lote>.svg   -> folha-índice com todos os QRs e códigos (conferência)
"""
import argparse, csv, secrets, sys
from pathlib import Path
import segno

# Alfabeto sem caracteres ambíguos (sem 0/O, 1/I/L) -> fácil de digitar à mão
ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

def gerar_codigo(tam, prefixo=""):
    return prefixo + "".join(secrets.choice(ALFABETO) for _ in range(tam))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", required=True, help="Ex: https://placaqr.pages.dev/r (sem barra final)")
    ap.add_argument("--qtd", type=int, default=50)
    ap.add_argument("--lote", default="L001")
    ap.add_argument("--tam", type=int, default=8, help="Tamanho do código (padrão 8)")
    ap.add_argument("--prefixo", default="")
    ap.add_argument("--erro", default="M", choices=list("LMQH"), help="Correção de erro (M recomendado)")
    ap.add_argument("--escala", type=int, default=20, help="Escala do SVG/PNG")
    ap.add_argument("--png", action="store_true")
    ap.add_argument("--existentes", help="CSV de lotes anteriores p/ evitar códigos repetidos")
    a = ap.parse_args()

    base = a.base_url.rstrip("/")
    usados = set()
    if a.existentes:
        with open(a.existentes, newline="", encoding="utf-8") as f:
            usados = {r["codigo"] for r in csv.DictReader(f)}

    out = Path(f"saida_{a.lote}")
    (out / "svg").mkdir(parents=True, exist_ok=True)
    if a.png:
        (out / "png").mkdir(exist_ok=True)

    codigos = []
    while len(codigos) < a.qtd:
        c = gerar_codigo(a.tam, a.prefixo)
        if c in usados:
            continue
        usados.add(c)
        codigos.append(c)

    for c in codigos:
        url = f"{base}/{c}"
        qr = segno.make(url, error=a.erro, micro=False)
        qr.save(out / "svg" / f"{c}.svg", scale=a.escala, border=0, dark="#000000", light=None)
        if a.png:
            qr.save(out / "png" / f"{c}.png", scale=a.escala, border=0)

    with open(out / f"lote_{a.lote}.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["codigo", "url", "lote", "arquivo_svg"])
        for c in codigos:
            w.writerow([c, f"{base}/{c}", a.lote, f"svg/{c}.svg"])

    valores = ",\n".join(f"  ('{c}', '{a.lote}')" for c in codigos)
    sql = (
        f"-- Lote {a.lote} ({len(codigos)} placas) - rode no SQL Editor do Supabase\n"
        f"insert into public.plates (code, batch) values\n{valores}\n"
        f"on conflict (code) do nothing;\n"
    )
    (out / f"lote_{a.lote}.sql").write_text(sql, encoding="utf-8")

    # folha-índice para conferência visual
    cols, cel, pad = 6, 220, 20
    linhas = (len(codigos) + cols - 1) // cols
    partes = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{cols*cel}" height="{linhas*(cel+40)}" style="background:#fff">']
    for i, c in enumerate(codigos):
        x, y = (i % cols) * cel, (i // cols) * (cel + 40)
        svg = segno.make(f"{base}/{c}", error=a.erro).svg_inline(scale=4, border=0, dark="#000")
        partes.append(f'<g transform="translate({x+pad},{y+pad})">{svg}</g>')
        partes.append(f'<text x="{x+cel/2}" y="{y+cel+10}" font-family="monospace" font-size="16" text-anchor="middle">{c}</text>')
    partes.append("</svg>")
    (out / f"todos_{a.lote}.svg").write_text("\n".join(partes), encoding="utf-8")

    print(f"OK: {len(codigos)} códigos em {out}/")

if __name__ == "__main__":
    main()
