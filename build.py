#!/usr/bin/env python3
"""Pokédex ES - genera data.json a partir de los CSV públicos de PokeAPI/pokeapi.

Solo usa la librería estándar. Se ejecuta en GitHub Actions cada día:
- vuelve a leer los datos (por si PokeAPI añade Pokémon o corrige textos)
- elige el Pokémon del día (cambia a medianoche, hora de Madrid)
"""
import csv
import hashlib
import io
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/"
ES, EN = "7", "9"
TZ = ZoneInfo("Europe/Madrid")
LOCAL_DIR = os.environ.get("PKX_CSV_DIR")  # para pruebas con CSV locales
OUT = os.environ.get("PKX_OUT", "data.json")
HIST = os.environ.get("PKX_HIST", "historial.json")

FILES = [
    "pokemon", "pokemon_species", "pokemon_species_names", "pokemon_species_flavor_text",
    "pokemon_types", "type_names", "pokemon_stats", "generation_names",
    "pokemon_abilities", "ability_names", "abilities",
]


def load(name):
    if LOCAL_DIR:
        with open(os.path.join(LOCAL_DIR, name + ".csv"), encoding="utf-8") as f:
            text = f.read()
    else:
        req = urllib.request.Request(BASE + name + ".csv", headers={"User-Agent": "pokedex-es"})
        for intento in range(3):
            try:
                with urllib.request.urlopen(req, timeout=60) as r:
                    text = r.read().decode("utf-8")
                break
            except Exception as e:  # reintento sencillo
                if intento == 2:
                    raise
                print("Reintentando", name, e)
    rows = list(csv.DictReader(io.StringIO(text.replace("\r\n", "\n"))))
    return [{k.strip(): (v or "").strip() for k, v in r.items() if k} for r in rows]


def clean(txt):
    txt = txt.replace("\u00ad", "").replace("\f", " ").replace("\n", " ")
    txt = re.sub(r"-\s+(?=[a-záéíóúñ])", "", txt)  # palabras partidas
    txt = re.sub(r"\s+", " ", txt).strip()
    return txt


def titulo(slug):
    return " ".join(p.capitalize() for p in slug.split("-"))


def pokemon_del_dia(fecha, total):
    h = hashlib.sha256(("pkx-" + fecha).encode()).hexdigest()
    return int(h, 16) % total + 1


def main():
    d = {f: load(f) for f in FILES}

    tipos = {r["type_id"]: r["name"] for r in d["type_names"]
             if r["local_language_id"] == ES and int(r["type_id"]) <= 18}
    gens = {r["generation_id"]: r["name"] for r in d["generation_names"] if r["local_language_id"] == ES}

    nombres, generos = {}, {}
    for r in d["pokemon_species_names"]:
        sid, lang = r["pokemon_species_id"], r["local_language_id"]
        if lang == ES:
            nombres[sid] = r["name"]
            if r.get("genus"):
                generos[sid] = r["genus"]
        elif lang == EN and r.get("genus"):
            generos.setdefault("en" + sid, r["genus"])

    hab_es = {r["ability_id"]: r["name"] for r in d["ability_names"] if r["local_language_id"] == ES}
    hab_slug = {r["id"]: r["identifier"] for r in d["abilities"]}

    # descripción en español del juego más reciente que la tenga
    desc = {}
    for r in d["pokemon_species_flavor_text"]:
        if r["language_id"] != ES:
            continue
        sid, v = r["species_id"], int(r["version_id"])
        if sid not in desc or v >= desc[sid][0]:
            desc[sid] = (v, clean(r["flavor_text"]))

    defecto = {}
    for r in d["pokemon"]:
        if r["is_default"] == "1":
            defecto[r["species_id"]] = r

    ptipos, pstats, phab = {}, {}, {}
    for r in sorted(d["pokemon_types"], key=lambda r: int(r["slot"])):
        if int(r["type_id"]) <= 18:
            ptipos.setdefault(r["pokemon_id"], []).append(int(r["type_id"]))
    for r in d["pokemon_stats"]:
        if int(r["stat_id"]) <= 6:
            pstats.setdefault(r["pokemon_id"], [0] * 6)[int(r["stat_id"]) - 1] = int(r["base_stat"])
    for r in sorted(d["pokemon_abilities"], key=lambda r: int(r["slot"])):
        aid = r["ability_id"]
        nom = hab_es.get(aid) or titulo(hab_slug.get(aid, aid))
        phab.setdefault(r["pokemon_id"], []).append([nom, 1 if r["is_hidden"] == "1" else 0])

    lista = []
    for s in sorted(d["pokemon_species"], key=lambda r: int(r["id"])):
        sid = s["id"]
        p = defecto.get(sid)
        if not p:
            continue
        pid = p["id"]
        cat = 2 if s["is_mythical"] == "1" else 1 if s["is_legendary"] == "1" else 3 if s["is_baby"] == "1" else 0
        item = {
            "i": int(sid),
            "n": nombres.get(sid) or titulo(s["identifier"]),
            "s": s["identifier"],
            "g": generos.get(sid, ""),
            "t": ptipos.get(pid, []),
            "gen": int(s["generation_id"]),
            "st": pstats.get(pid, [0] * 6),
            "h": int(p["height"] or 0),
            "w": int(p["weight"] or 0),
            "ab": phab.get(pid, []),
            "d": desc.get(sid, (0, ""))[1],
            "ev": int(s["evolves_from_species_id"]) if s["evolves_from_species_id"] else 0,
            "ch": int(s["evolution_chain_id"] or 0),
            "c": cat,
            "cr": int(s["capture_rate"] or 0),
            "gr": int(s["gender_rate"] or -1),
        }
        lista.append(item)

    if len(lista) < 100:
        print("ERROR: muy pocos Pokémon, no se escribe nada", len(lista))
        sys.exit(1)

    ahora = datetime.now(TZ)
    hoy = ahora.strftime("%Y-%m-%d")
    total = len(lista)

    # historial de Pokémon del día (últimos 30)
    hist = []
    if os.path.exists(HIST):
        try:
            with open(HIST, encoding="utf-8") as f:
                hist = json.load(f)
        except Exception:
            hist = []
    hist = [h for h in hist if h.get("fecha") != hoy]
    hist.insert(0, {"fecha": hoy, "id": pokemon_del_dia(hoy, total)})
    hist = sorted(hist, key=lambda h: h["fecha"], reverse=True)[:30]
    with open(HIST, "w", encoding="utf-8") as f:
        json.dump(hist, f, ensure_ascii=False, indent=0)

    manana = (ahora + timedelta(days=1)).strftime("%Y-%m-%d")
    data = {
        "actualizado": ahora.strftime("%Y-%m-%d %H:%M"),
        "total": total,
        "tipos": tipos,
        "generaciones": gens,
        "stats": ["PS", "Ataque", "Defensa", "At. Esp.", "Def. Esp.", "Velocidad"],
        "dia": {"fecha": hoy, "id": pokemon_del_dia(hoy, total), "manana": manana},
        "historial": hist,
        "pokemon": lista,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    con_desc = sum(1 for p in lista if p["d"])
    print(f"OK: {total} Pokémon, {con_desc} con descripción, del día: #{data['dia']['id']}")


if __name__ == "__main__":
    main()
