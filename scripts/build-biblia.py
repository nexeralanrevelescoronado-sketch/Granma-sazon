#!/usr/bin/env python3
"""Genera data/biblia/<version>/<libro>.json a partir de fuentes de DOMINIO PUBLICO.

  rv1909  Reina-Valera 1909 (ES)   fuente: scrollmapper/bible_databases (SpaRV)
  kjv     King James Version (EN)  fuente: scrollmapper/bible_databases (KJV)
  web     World English Bible (EN) fuente: TehShrike/world-english-bible

NO se incluye ni se descarga NTV/NLT (derechos de Tyndale House): ver docs/BIBLIA.md.
Uso: python3 scripts/build-biblia.py [carpeta_de_cache]
"""
import json, os, re, sys, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, "data", "biblia")
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RAIZ, ".cache-biblia")
os.makedirs(CACHE, exist_ok=True)

# id, nombre ES, nombre EN, slug de la WEB
LIBROS = [
 ("gen","Génesis","Genesis","genesis"),("exo","Éxodo","Exodus","exodus"),("lev","Levítico","Leviticus","leviticus"),
 ("num","Números","Numbers","numbers"),("deu","Deuteronomio","Deuteronomy","deuteronomy"),("jos","Josué","Joshua","joshua"),
 ("jue","Jueces","Judges","judges"),("rut","Rut","Ruth","ruth"),("1sa","1 Samuel","1 Samuel","1-samuel"),
 ("2sa","2 Samuel","2 Samuel","2-samuel"),("1re","1 Reyes","1 Kings","1-kings"),("2re","2 Reyes","2 Kings","2-kings"),
 ("1cr","1 Crónicas","1 Chronicles","1-chronicles"),("2cr","2 Crónicas","2 Chronicles","2-chronicles"),("esd","Esdras","Ezra","ezra"),
 ("neh","Nehemías","Nehemiah","nehemiah"),("est","Ester","Esther","esther"),("job","Job","Job","job"),
 ("sal","Salmos","Psalms","psalms"),("pro","Proverbios","Proverbs","proverbs"),("ecl","Eclesiastés","Ecclesiastes","ecclesiastes"),
 ("can","Cantares","Song of Solomon","song-of-solomon"),("isa","Isaías","Isaiah","isaiah"),("jer","Jeremías","Jeremiah","jeremiah"),
 ("lam","Lamentaciones","Lamentations","lamentations"),("eze","Ezequiel","Ezekiel","ezekiel"),("dan","Daniel","Daniel","daniel"),
 ("ose","Oseas","Hosea","hosea"),("joe","Joel","Joel","joel"),("amo","Amós","Amos","amos"),("abd","Abdías","Obadiah","obadiah"),
 ("jon","Jonás","Jonah","jonah"),("miq","Miqueas","Micah","micah"),("nah","Nahúm","Nahum","nahum"),
 ("hab","Habacuc","Habakkuk","habakkuk"),("sof","Sofonías","Zephaniah","zephaniah"),("hag","Hageo","Haggai","haggai"),
 ("zac","Zacarías","Zechariah","zechariah"),("mal","Malaquías","Malachi","malachi"),
 ("mat","Mateo","Matthew","matthew"),("mar","Marcos","Mark","mark"),("luc","Lucas","Luke","luke"),("jua","Juan","John","john"),
 ("hch","Hechos","Acts","acts"),("rom","Romanos","Romans","romans"),("1co","1 Corintios","1 Corinthians","1-corinthians"),
 ("2co","2 Corintios","2 Corinthians","2-corinthians"),("gal","Gálatas","Galatians","galatians"),("efe","Efesios","Ephesians","ephesians"),
 ("fil","Filipenses","Philippians","philippians"),("col","Colosenses","Colossians","colossians"),
 ("1te","1 Tesalonicenses","1 Thessalonians","1-thessalonians"),("2te","2 Tesalonicenses","2 Thessalonians","2-thessalonians"),
 ("1ti","1 Timoteo","1 Timothy","1-timothy"),("2ti","2 Timoteo","2 Timothy","2-timothy"),("tit","Tito","Titus","titus"),
 ("flm","Filemón","Philemon","philemon"),("heb","Hebreos","Hebrews","hebrews"),("san","Santiago","James","james"),
 ("1pe","1 Pedro","1 Peter","1-peter"),("2pe","2 Pedro","2 Peter","2-peter"),("1jn","1 Juan","1 John","1-john"),
 ("2jn","2 Juan","2 John","2-john"),("3jn","3 Juan","3 John","3-john"),("jud","Judas","Jude","jude"),("apo","Apocalipsis","Revelation","revelation"),
]
assert len(LIBROS) == 66

def bajar(url, nombre):
    ruta = os.path.join(CACHE, nombre)
    if not os.path.exists(ruta):
        print("bajando", url)
        with urllib.request.urlopen(url, timeout=120) as r, open(ruta, "wb") as f:
            f.write(r.read())
    return ruta

def limpiar(t):
    t = re.sub(r"[\u0590-\u05FF]+", "", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t.replace("[", "").replace("]", "")  # corchetes editoriales

def desde_scrollmapper(nombre):
    ruta = bajar(f"https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/{nombre}.json", nombre + ".json")
    d = json.load(open(ruta, encoding="utf-8"))
    assert len(d["books"]) == 66
    salida = []
    for b in d["books"]:
        caps = []
        for c in sorted(b["chapters"], key=lambda c: c["chapter"]):
            caps.append([limpiar(v["text"]) for v in sorted(c["verses"], key=lambda v: v["verse"])])
        salida.append(caps)
    return salida

def desde_web():
    salida = []
    for (_i, _es, _en, slug) in LIBROS:
        ruta = bajar(f"https://raw.githubusercontent.com/TehShrike/world-english-bible/master/json/{slug.replace('-', '')}.json", f"web-{slug}.json")
        mapa = {}
        for x in json.load(open(ruta, encoding="utf-8")):
            if "verseNumber" in x and "value" in x:
                mapa.setdefault(x["chapterNumber"], {}).setdefault(x["verseNumber"], []).append(x["value"])
        caps = []
        for c in sorted(mapa):
            caps.append([limpiar(" ".join(mapa[c][v])) for v in sorted(mapa[c])])
        salida.append(caps)
    return salida

VERSIONES = {"rv1909": desde_scrollmapper("SpaRV"), "kjv": desde_scrollmapper("KJV"), "web": desde_web()}

for ver, libros in VERSIONES.items():
    carpeta = os.path.join(SALIDA, ver)
    os.makedirs(carpeta, exist_ok=True)
    total = 0
    for (id_, es, en, _s), caps in zip(LIBROS, libros):
        with open(os.path.join(carpeta, id_ + ".json"), "w", encoding="utf-8") as f:
            json.dump({"id": id_, "c": caps}, f, ensure_ascii=False, separators=(",", ":"))
        total += sum(len(c) for c in caps)
    print(ver, "versículos:", total)

indice = {"libros": [{"id": i, "es": es, "en": en, "caps": [len(c) for c in VERSIONES["kjv"][n]]} for n, (i, es, en, _s) in enumerate(LIBROS)]}
with open(os.path.join(SALIDA, "libros.json"), "w", encoding="utf-8") as f:
    json.dump(indice, f, ensure_ascii=False, separators=(",", ":"))
