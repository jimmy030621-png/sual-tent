# -*- coding: utf-8 -*-
"""
Saul Tents — product sync pipeline.

Reads the supplier wholesale price list (xlsx) and generates:
  data/products.json          -> public catalog (NO prices)
  data/private/prices.json    -> supplier cost (internal only, gitignored)
  public/images/products/     -> optimized WebP images (1400px + 700px)

Run:  python scripts/sync_products.py
"""

import io
import json
import os
import re
import zipfile
from pathlib import Path

import openpyxl
from PIL import Image, ImageOps

# ---------------------------------------------------------------- config ---
SRC = os.environ.get(
    "SUPPLIER_XLSX",
    r"C:\Users\86156\Desktop\2026年悦利（海川户外）统一批发价.xlsx",
)
ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "web"
DATA_DIR = WEB / "data"
PRIVATE_DIR = DATA_DIR / "private"
IMG_DIR = WEB / "public" / "images" / "products"

MAX_W = 1400
THUMB_W = 700
IMG_QUALITY = 82

# ------------------------------------------------------------ translations ---
# Product names (zh -> en). Manual so the catalog reads professionally.
NAME_EN = {
    # 天幕 sheet
    "方型": "Square Canopy Tarp",
    "蝶型": "Butterfly Canopy Tarp",
    "19管车边天幕": "19mm Pole Canopy Tarp",
    "25管车边天幕": "25mm Pole Canopy Tarp",
    "天幕": "Canopy Tarp 6×8 m",
    # 帐篷 sheet
    "抛帐": "Pop-up Camping Tent",
    "四面帐": "Pop-up Screen House",
    "黑胶小四面": "Blackout Screen House 210",
    "黑胶大四面": "Blackout Screen House 240",
    "假双层": "Faux Double-Layer Tent",
    "两门两窗": "2-Door 2-Window Tent",
    "六角帐": "Hexagon Camping Tent",
    "大六角黑胶5.25": "Hexagon Tent L (Blackout)",
    "双窗四面帐": "Screen House with Twin Windows",
    "帐篷搭天幕": "Tent with Attached Canopy",
    "沙滩帐篷": "Beach Tent",
    "印第安帐": "Teepee Tent",
    "印第安帐带天幕": "Teepee Tent with Canopy",
    "黑胶印第安带天幕": "Teepee with Canopy (Blackout)",
    "大六角黑胶": "Hexagon Tent (Blackout)",
    "大六角黑胶带天幕": "Hexagon with Canopy (Blackout)",
    "大四面黑胶": "Large Blackout Screen House",
    "大四面黑胶带天幕": "Large Blackout Screen House with Canopy",
    "小四面直门黑胶": "Small Blackout Screen House (Straight Door)",
    "小四面带天幕": "Small Screen House with Canopy",
    "大四面带天幕": "Large Screen House with Canopy",
    "假双层两门两窗": "Faux Double-Layer 2-Door Tent",
    "穹顶流沙金": "Dome Tent (Quicksand Gold)",
    "烟窗穹顶拉链款": "Dome Tent with Stove Jack",
    "穹顶围布涂层没拉链": "Dome Skirt (Coated, No Zipper)",
    "穹顶纱网": "Dome Mesh Inner",
    "穹顶连接片": "Dome Connector Sheet",
    "小一室一厅": "Cabin Tent S (1 Room + Living)",
    "中一室一厅": "Cabin Tent M (1 Room + Living)",
    "大二室一厅": "Cabin Tent L (2 Rooms + Living)",
    "单峰6*6": "Single-Peak Event Tent 6×6 m",
    "双峰15*8": "Double-Peak Event Tent 15×8 m",
    "三峰20*8.6*4.5": "Triple-Peak Event Tent 20×8.6 m",
    "高尔夫帐篷": "Golf Event Tent",
    "充气帐": "Inflatable Tent 220×220",
    "一门三窗内置泵充气帐带天幕": "Inflatable Tent with Canopy (Built-in Pump)",
    "车尾帐网纱": "Tailgate Mesh Awning Tent",
    "凉亭": "Pop-up Gazebo",
    "大屋脊自动帐篷": "Auto Ridge Tent L",
    "小屋脊自动帐篷": "Auto Ridge Tent S",
    "6.3平充气帐篷": "Inflatable Tent 6.3 m²",
    "车尾充气帐篷": "Tailgate Inflatable Tent",
    "新型夹网TPU气柱充气帐篷": "TPU Air-Beam Inflatable Tent",
    "充气柱天幕": "Air-Beam Canopy",
    "甲壳虫隧道帐": "Beetle Tunnel Tent",
    "落地窗卡其黑胶大六角带天幕": "Floor-Window Hexagon with Canopy (Khaki)",
    "落地窗卡其黑胶大六角": "Floor-Window Hexagon (Khaki Blackout)",
    "小号（一室一厅）": "Camping House Tent S (1+1)",
    "大号（二室一厅）": "Camping House Tent L (2+1)",
    "2.5*2.5*4根弯角黑色8.5*235": "Curved-Pole Tunnel Tent",
    "6人帐篷": "6-Person Family Tent",
    "充气帐篷260*220": "Inflatable Tent 260×220",
    "两门两窗隧道帐": "2-Door 2-Window Tunnel Tent",
    "一门两窗隧道": "1-Door 2-Window Tunnel Tent",
    "两头窗两侧门隧道帐": "Tunnel Tent (End Windows, Side Doors)",
    "充气帐篷": "Inflatable Tent 320×280",
    "真双层": "True Double-Layer Tent",
    "A塔天幕": "A-Frame Canopy Tarp",
    "隧道天幕": "Tunnel Canopy Tarp",
    "多边天幕": "Multi-Panel Canopy Tarp",
    "船形帐": "Boat-Shape Tent",
    # sheet '1' (beach & dome series, manual by row)
    "海滩汽车帐篷": "Beach Car Tent",
    "圆顶四面大帐篷": "Dome Screen House Tent",
    "3-4人双人帐篷": "3–4 Person Dome Tent",
    "3-4人单门双层帐篷": "3–4 Person Double-Layer Dome Tent",
    "经典双层湖畔露营": "Classic Double-Layer Lakeside Tent",
    "圆顶包4(PA1500)": "Dome Tent 4-Person (PA 1500)",
    "圆顶包2": "Dome Tent 2-Person",
    "圆顶包4": "Dome Tent 4-Person (PA 300)",
    "圆顶包6": "Dome Tent 6-Person",
    "假双层-牛津": "Faux Double-Layer Tent (Oxford 210D)",
    "300*300*210": "Family Dome Tent 300×300",
    "200*140*110": "2-Person Camping Tent",
    "隧道式": "Family Tunnel Tent 210×180",
    "沙滩天幕": "Beach Canopy",
    # accessories
    "22杆": "Canopy Poles 22 mm",
    "25杆": "Canopy Poles 25 mm",
    "调解绳": "Adjustable Guy Ropes",
    "调节扣": "Cord Tensioners",
    "外袋": "Carry Bag",
    "铁地钉袋": "Steel Peg Bag",
    "铝地钉袋": "Aluminum Peg Bag",
    "杆子袋": "Pole Bag",
    "加长地钉": "Extended Steel Pegs",
    "防潮垫2*2": "Ground Mat 2×2 m",
    "防潮垫2*1.5": "Ground Mat 2×1.5 m",
    "防潮垫2*1.85": "Ground Mat 2×1.85 m",
    "无纺布野餐垫2*1.5": "Non-woven Picnic Mat",
    "牛津布野餐垫2*1.5": "Oxford Picnic Mat 2×1.5 m",
    "牛津布野餐垫1*1.5": "Oxford Picnic Mat 1×1.5 m",
    "小六角防潮垫": "Hexagon Ground Mat 2.2×2.2",
    "大六角防潮垫": "Hexagon Ground Mat 2.7×2.7",
    "充气垫": "Inflatable Sleeping Pad",
    "铝合金蛋卷桌90CM": "Aluminum Roll-Up Table 90 cm",
    "铝合金蛋卷桌120CM": "Aluminum Roll-Up Table 120 cm",
    "铝蛋卷桌60CM": "Aluminum Roll-Up Table 60 cm",
    "8.7寸推车的桌板（15块板）": "Camping Cart Tabletop (15 slats)",
    "铁桌90": "Steel Folding Table 90 cm",
    "铁桌120": "Steel Folding Table 120 cm",
    "铁克米特大号椅大号51*50*76": "Steel Kermit Chair L",
    "铁克米特中号椅52*42*64": "Steel Kermit Chair M",
    "铝合金克米特大号椅": "Aluminum Kermit Chair L",
    "铝合金克米特中号椅": "Aluminum Kermit Chair M",
    "推车越野款大号7/8寸双刹万向轮": "Off-Road Camping Cart L (7\"/8\" Wheels)",
    "5寸窄轮": "Camping Cart (5\" Narrow Wheels)",
    "月亮椅": "Moon Chair",
    "露营灯": "Camping Lantern",
    "吊床": "Hammock",
    "枕头中号": "Camping Pillow M",
    "枕头大号": "Camping Pillow L",
    "小折叠椅": "Folding Chair S",
    "大号折叠椅": "Folding Chair L",
    "吸盘": "Suction Cup",
    "5寸露营车": "Camping Cart 5\" Wheels",
    "7寸露营车": "Camping Cart 7\" Wheels",
    "10寸露营车": "Camping Cart 10\" Wheels",
    "电动充气泵": "Electric Air Pump",
}

# Fallback: translate generic terms when a name is not in the map.
TERM_FALLBACK = [
    ("帐篷", " Tent"), ("天幕", " Canopy Tarp"), ("充气", "Inflatable "),
    ("隧道帐", " Tunnel Tent"), ("黑胶", "Blackout "), ("银胶", "Silver-Coated "),
    ("自动帐篷", " Auto Tent"), ("露营", " Camping "), ("防潮垫", " Ground Mat"),
    ("推车", " Cart"), ("椅子", " Chair"), ("桌子", " Table"), ("灯", " Lantern"),
]

# Keyword translation for fabric / accessories / notes texts.
# NOTE: order matters — longer / more specific terms must come first.
KW = [
    ("牛津布", "Oxford fabric"), ("牛津", "Oxford"), ("涤丝布", "polyester taffeta"),
    ("聚酯纤维", "polyester"), ("涤纶", "polyester"),
    ("银胶", "silver-coated"), ("黑胶", "blackout-coated"), ("全遮光", "full blackout"),
    ("防水PU6000+", "PU6000+ mm waterproof"), ("防水PU2000+", "PU2000+ mm waterproof"),
    ("防水", "waterproof"), ("防晒UPF50+", "UPF50+ UV protection"),
    ("防晒", "UV protection"), ("防泼水", "water-repellent"),
    ("反光尼龙", "reflective nylon"), ("夜光", "glow-in-the-dark"),
    ("风绳", "guy lines"), ("地钉", "steel pegs"),
    ("玻璃纤维", "fiberglass"), ("玻纤", "fiberglass"), ("无碱纤维", "alkali-free fiber"),
    ("铁杆", "steel poles"), ("铝杆", "aluminum poles"), ("撑杆", "poles"),
    ("天幕杆", "canopy poles"), ("门厅杆", "awning poles"), ("门杆", "door poles"),
    ("收纳袋", "carry bag"), ("外袋", "carry bag"), ("杆子袋", "pole bag"),
    ("打气筒", "air pump"), ("充气泵", "air pump"), ("锤子", "hammer"),
    ("隔帘", "room divider"), ("外帐", "flysheet"), ("内帐", "inner tent"),
    ("帐身", "tent body"), ("帐底", "floor"), ("底布", "floor fabric"),
    ("纱网", "mesh"), ("纱窗", "mesh window"), ("防蚊", "mosquito-proof"),
    ("高密", "high-density"), ("面料", "fabric"), ("面布", "fabric"),
    ("材质", "material"), ("布料", "fabric"), ("尺寸", "size"), ("规格", "spec"),
    ("支架", "frame"), ("骨架", "frame"), ("杆", "poles"), ("管", "-tube"),
    ("米色", "beige"), ("咖色", "coffee"), ("卡其", "khaki"), ("白色", "white"),
    ("黑色", "black"), ("红色", "red"), ("绿色", "green"), ("沙漠黄", "desert yellow"),
    ("银色", "silver"), ("袋子", "bag"), ("口袋", "storage pocket"),
    ("数量", "quantity"), ("调节扣", "cord tensioners"), ("调节片", "tensioner tabs"),
    ("调节绳", "adjustable guy ropes"),
    ("塑料", "plastic"), ("金属", "metal"), ("烤漆", "powder-coated"), ("电泳", "e-coating"),
    ("碳钢管", "carbon steel tube"), ("碳钢", "carbon steel"),
    ("外径", "outer size"), ("内径", "inner size"), ("内尺寸", "inner size"),
    ("外尺寸", "outer size"), ("外形尺寸", "outer size"), ("内部尺寸", "inner size"),
    ("净重", "net weight"), ("毛重", "gross weight"), ("重量", "weight"),
    ("独立装箱规格", "single-unit packing"), ("外箱规格", "master carton"),
    ("装箱数", "qty per carton"), ("箱规", "carton size"), ("装箱", "packing"),
    ("个装", "per carton"), ("件装", "per carton"), ("套", "sets"),
    ("节", " sections"), ("付", " pairs"), ("对", " pairs"), ("支", " pcs"),
    ("根", " pcs"), ("个", " pcs"), ("高", " height"), ("宽", " width"),
    ("长", " length"), ("直径", "diameter"),
    ("涂层", "coating"), ("涂银", "silver-coated"),
    ("水压", "water column"), ("执行标准", "standard"), ("认证", "certification"),
    ("起订量", "MOQ"), ("不含", "excluding"), ("含税运", "incl. tax & freight"),
    ("工作", "runtime"), ("电池", "battery"), ("加小箱另加", "plus small carton"),
    ("一包", "a pack of"),
    ("玻璃纤纤维", "fiberglass"), ("罗纹钢", "threaded steel"), ("螺纹钢", "threaded steel"),
    ("钢丝", "steel wire"), ("实心", "solid"), ("伸缩", "telescopic"),
    ("前杆", "front pole"), ("弯角", "curved corner"), ("拐角", "corner joint"),
    ("三角片", "triangle plate"), ("环扣", "ring buckle"), ("双刹", "dual brake"),
    ("万向轮", "swivel wheels"), ("窄轮", "narrow wheels"),
    ("内置泵", "built-in pump"), ("气柱", "air beam"), ("夹网", "laminated mesh"),
    ("落地窗", "floor window"), ("直门", "straight door"), ("流沙金", "quicksand gold"),
    ("烟窗", "stove jack"), ("围布", "skirt"), ("拉链", "zipper"), ("拉链款", "zipper model"),
    ("门拉链", "door zipper"), ("双片", "double panel"), ("单片", "single panel"),
    ("外门", "outer door"), ("内门", "inner door"), ("窗", "window"),
    ("桌板", "tabletop"), ("蛋卷桌", "roll-up table"), ("折叠椅", "folding chair"),
    ("月亮椅", "moon chair"), ("克米特", "Kermit"), ("野餐垫", "picnic mat"),
    ("充气垫", "sleeping pad"), ("枕头", "pillow"), ("吊床", "hammock"),
    ("露营灯", "camping lantern"), ("露营车", "camping cart"), ("推车", "cart"),
    ("布", "fabric"), ("顶盖", "top cover"), ("顶布", "top fabric"),
    ("米", "m"), ("厘米", "cm"), ("平", "m²"),
    ("六角", "hexagon"), ("四面", "four-sided"), ("双窗", "twin-window"),
    ("两门两窗", "two-door two-window"), ("一门两窗", "one-door two-window"),
    ("两头", "both ends"), ("两侧", "two sides"), ("车尾", "tailgate"),
    ("顶", "top"), ("沙滩", "beach"), ("湖畔", "lakeside"), ("高尔夫", "golf"),
    ("全", "all"), ("度", ""), ("长度", "length"), ("短", "short"),
    ("配", "with"), ("有", "with"),
    ("袋", "bag"), ("插扣带", "buckle straps"), ("插扣", "buckles"),
    ("户外露营", "outdoor camping"), ("户外", "outdoor"), ("露营", "camping"),
    ("帐篷", "tent"), ("桌椅", "furniture"),
]

SPEC_LABELS = {
    "面料": "fabric", "布料": "fabric", "材质": "material", "面布": "fabric",
    "底布": "floor", "帐底": "floor", "帐篷底部": "floor", "纱": "mesh",
    "纱网": "mesh", "纱窗": "mesh", "骨架": "frame", "支架": "frame",
    "配件": "accessories", "钉子": "pegs", "地钉": "pegs", "风绳": "guy lines",
    "尺寸": "size", "规格": "spec", "logo": "logo", "口袋": "storage",
    "颜色": "color", "外帐": "flysheet", "内帐": "inner tent",
}

CANOPY_COATING_HINT = {"黑胶": "Blackout", "银胶": "Silver"}

# --------------------------------------------------------- sheet parsing ---

def cell(row, idx):
    v = row[idx] if idx < len(row) else None
    if v is None:
        return None
    s = str(v).strip()
    return s or None


def norm(text):
    """Normalize supplier text: keep latin/digits/dot/star/x, drop stray spaces."""
    if not text:
        return None
    t = text.replace("\u3000", " ").replace("\xa0", " ")
    t = t.replace("\uff08", " (").replace("\uff09", ") ")
    t = t.replace("\uff1a", ": ").replace("\uff0c", ", ").replace("\u3002", ". ")
    t = t.replace("\u3001", ", ").replace("\uff1b", "; ").replace("\uff01", "! ")
    t = re.sub(r"\s+", " ", t).strip()
    return t or None


def translate_text(text):
    """Best-effort keyword translation, preserving numbers. Each replacement is
    space-padded so merged terms stay readable."""
    if not text:
        return None
    t = norm(text)
    # Chinese count words + unit -> "N pcs/pairs/sections"
    CN_NUM = {"一": "1", "两": "2", "二": "2", "三": "3", "四": "4", "五": "5",
              "六": "6", "七": "7", "八": "8", "九": "9", "十": "10"}

    CN_UNIT = {"根": "pcs", "支": "pcs", "个": "pcs", "付": "pairs",
               "对": "pairs", "节": "sections"}

    def cnt(m):
        n = CN_NUM.get(m.group(1), m.group(1))
        u = CN_UNIT.get(m.group(2), m.group(2))
        return "%s %s " % (n, u)

    t = re.sub(r"([一两二三四五六七八九十]+)(根|支|个|付|对|节)", lambda m: cnt(m), t)
    for zh, en in KW:
        t = t.replace(zh, " %s " % en)
    # glue "-tube" back onto digits: "13 -tube" -> "13-tube"
    t = re.sub(r"(\d)\s*-tube\b", r"\1-tube", t)
    t = t.replace("*", "×")
    t = re.sub(r"\s+([.,;:!?])", r"\1", t)
    t = re.sub(r"([(])\s+", r"\1", t)
    t = re.sub(r"\s+([)])", r"\1", t)
    t = re.sub(r"\s+", " ", t).strip(" ,.;:")
    return t or None


def spec_text_to_english(text):
    """Translate numbered spec blocks like '1, fabric X 2, floor Y ...' into
    a list of {label, value} pairs. Falls back to None."""
    if not text:
        return None
    t = norm(text)
    # strip a leading intro like "camping tent:" (only if it holds no numbers)
    m = re.match(r"^([^1-9１-９]*)[:：]\s*", t)
    if m:
        t = t[m.end():]
    parts = re.split(r"\s*([1-9１-９])[,、，]\s*", t)
    pairs = []
    if len(parts) > 1:
        i = 1
        while i + 1 < len(parts):
            seg = parts[i + 1]
            label, sep, rest = seg.partition(":")
            if not sep:
                label, sep, rest = seg.partition(" ")
            label = label.strip()
            if label in SPEC_LABELS:
                pairs.append({"label": SPEC_LABELS[label], "value": translate_text(rest) or translate_text(label)})
            else:
                pairs.append({"label": "spec", "value": translate_text(seg)})
            i += 2
        return pairs if pairs else None
    return None


# ----------------------------------------------------------- image maps ---

def parse_image_anchors(src):
    """(sheet_title -> excel_row -> [media paths]) plus DISPIMG rows."""
    z = zipfile.ZipFile(src)
    anchors = {}  # sheet title -> {excel_row: [media]}
    dispimg_media = {}  # GUID -> media

    # 1) regular drawing anchors
    sheet_drawing = {}
    for i in range(1, 30):
        p = "xl/worksheets/sheet%d.xml" % i
        if p not in z.namelist():
            continue
        xml = z.read(p).decode("utf-8", "ignore")
        m = re.search(r'<drawing r:id="(rId\d+)"', xml)
        if m:
            rels = z.read("xl/worksheets/_rels/sheet%d.xml.rels" % i).decode("utf-8", "ignore")
            rels_map = dict(re.findall(r'Id="(rId\d+)" Type="[^"]*" Target="([^"]+)"', rels))
            sheet_drawing[i] = rels_map.get(m.group(1))

    for i, dr in sheet_drawing.items():
        m = re.search(r"drawing(\d+)", dr)
        if not m:
            continue
        dnum = m.group(1)
        dxml = z.read("xl/drawings/drawing%s.xml" % dnum).decode("utf-8", "ignore")
        drels = z.read("xl/drawings/_rels/drawing%s.xml.rels" % dnum).decode("utf-8", "ignore")
        drels_map = dict(re.findall(r'Id="(rId\d+)" Type="[^"]*" Target="([^"]+)"', drels))
        for m in re.finditer(
            r'<xdr:(?:twoCell|oneCell)Anchor[^>]*>.*?<xdr:from>'
            r'<xdr:col>(\d+)</xdr:col>.*?<xdr:row>(\d+)</xdr:row>.*?'
            r'</xdr:(?:twoCell|oneCell)Anchor>', dxml, re.S):
            excel_row = int(m.group(2)) + 1
            rids = re.findall(r'r:embed="(rId\d+)"', m.group(0))
            if rids and rids[0] in drels_map:
                media = drels_map[rids[0]].replace("../", "").replace("media/", "")
                anchors.setdefault(i, {}).setdefault(excel_row, []).append(media)

    # 2) WPS DISPIMG cell images
    if "xl/cellimages.xml" in z.namelist():
        cxml = z.read("xl/cellimages.xml").decode("utf-8", "ignore")
        crels = z.read("xl/_rels/cellimages.xml.rels").decode("utf-8", "ignore")
        crels_map = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="media/([^"]+)"', crels))
        for m in re.finditer(r'name="(ID_[A-F0-9]+)".*?r:embed="(rId\d+)"', cxml, re.S):
            dispimg_media[m.group(1)] = crels_map.get(m.group(2))

    # 3) DISPIMG GUIDs per sheet row
    dispimg_rows = {}  # sheet idx -> {excel_row: media}
    for i in range(1, 30):
        p = "xl/worksheets/sheet%d.xml" % i
        if p not in z.namelist():
            continue
        xml = z.read(p).decode("utf-8", "ignore")
        for m in re.finditer(
            r'<row r="(\d+)"[^>]*>((?:(?!</row>).)*?DISPIMG\(&quot;(ID_[A-F0-9]+)&quot;)',
            xml, re.S):
            row = int(m.group(1))
            media = dispimg_media.get(m.group(3))
            if media:
                dispimg_rows.setdefault(i, {})[row] = media

    return anchors, dispimg_rows


# ------------------------------------------------------------- products ---

def slugify(s):
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:60]


# name lookup ignores whitespace (supplier cells have inconsistent spacing)
NAME_EN_LOOKUP = {re.sub(r"\s+", "", k): v for k, v in NAME_EN.items()}


def name_to_en(zh):
    zh = norm(zh) or ""
    hit = NAME_EN_LOOKUP.get(re.sub(r"\s+", "", zh))
    if hit:
        return hit
    en = zh
    for z, e in TERM_FALLBACK:
        en = en.replace(z, e)
    return en.strip()


SIZE_TERMS = [
    ("加延伸间尺寸", "with extension: "), ("不加延伸", "without extension "),
    ("外形尺寸", "outer: "), ("内部尺寸", "inner: "), ("内尺寸", "inner: "),
    ("外尺寸", "outer: "), ("内帐", "inner tent"), ("外帐", "outer tent"),
    ("帐篷", "tent"), ("天幕", "canopy"), ("船形帐", "boat shape "),
    ("尺寸", ""), ("高", "height"), ("米", " m"), ("厘米", " cm"), ("CM", "cm"),
    ("黑色", "black"), ("沙漠黄", "desert yellow"), ("、", ", "),
]


def format_size(s):
    """Normalize a size string for public display."""
    if not s:
        return None
    t = norm(s)
    for zh, en in SIZE_TERMS:
        t = t.replace(zh, en)
    t = t.replace("*", "×").replace("：", ": ").replace(":", ": ")
    t = re.sub(r"×{2,}", "×", t)
    t = re.sub(r"\s{2,}", " ", t).strip(" :：,，")
    # compact number×number patterns: "2.1 ×1.5" -> "2.1×1.5"
    t = re.sub(r"(\d)\s*×\s*(\d)", r"\1×\2", t)
    # space between word and digit: "outer tent220" -> "outer tent 220"
    t = re.sub(r"([a-zA-Z])(\d)", r"\1 \2", t)
    return t or None


def build_families_tarp(rows, anchors):
    """天幕 sheet: 序号 breaks families; explicit same name continues."""
    families = []
    cur = None
    for r in range(3, len(rows)):  # 1-indexed rows, header at 2
        if r > len(rows):
            break
        row = rows[r - 1]
        idx = cell(row, 0)
        name = cell(row, 1)
        if name and name.startswith("注"):
            continue  # footnote row, not a product
        if not idx and not name and not cell(row, 7) and not cell(row, 11):
            continue
        if (idx and re.fullmatch(r"\d+", idx)) or (name and (cur is None or name != cur["nameZh"])):
            if cur:
                families.append(cur)
            cur = {"nameZh": name or "方型", "variants": []}
        if cur is None:
            cur = {"nameZh": name or "方型", "variants": []}
        cur["variants"].append({
            "row": r,
            "size": cell(row, 7),
            "weightKg": cell(row, 3),
            "packing": cell(row, 4),
            "carton": cell(row, 5),
            "qtyPerCarton": cell(row, 6),
            "fabric": cell(row, 8),
            "poles": cell(row, 9),
            "bag": cell(row, 10),
            "notes": cell(row, 13),
            "price": cell(row, 11),
        })
    if cur:
        families.append(cur)
    for f in families:
        f["images"] = [anchors.get(v["row"], []) for v in f["variants"]]
    return families


def build_families_tent(rows, anchors, name_overrides):
    """帐篷 sheet: explicit new name breaks family, empty inherits."""
    families = []
    cur = None
    for r in range(3, len(rows)):
        row = rows[r - 1]
        name = name_overrides.get(r) or cell(row, 1)
        if not name and not cell(row, 8) and not cell(row, 11) and r not in name_overrides:
            continue
        if name and (cur is None or name != cur["nameZh"]):
            if cur:
                families.append(cur)
            cur = {"nameZh": name, "variants": []}
        if cur is None:
            continue
        cur["variants"].append({
            "row": r,
            "size": cell(row, 8),
            "weightKg": cell(row, 3),
            "packing": cell(row, 5),
            "carton": cell(row, 7),
            "qtyPerCarton": cell(row, 6),
            "fabric": cell(row, 9),
            "accessories": cell(row, 10),
            "notes": cell(row, 13),
            "price": cell(row, 11),
        })
    if cur:
        families.append(cur)
    for f in families:
        f["images"] = [anchors.get(v["row"], []) for v in f["variants"]]
    return families


def build_families_beach(rows, anchors, name_by_row):
    """sheet '1': every row is its own product (manual names)."""
    families = []
    prev_cells = None
    for r in range(3, len(rows)):
        if r not in name_by_row:
            continue
        row = rows[r - 1]
        # skip exact duplicate rows (copy-paste dup in supplier sheet)
        cells = tuple(str(c) if c is not None else "" for c in row)
        if cells == prev_cells:
            continue
        prev_cells = cells
        families.append({
            "nameZh": name_by_row[r],
            "variants": [{
                "row": r,
                "size": cell(row, 8),
                "weightKg": cell(row, 3),
                "packing": cell(row, 5),
                "carton": cell(row, 7),
                "qtyPerCarton": cell(row, 6),
                "fabric": cell(row, 9),
                "accessories": cell(row, 10),
                "notes": cell(row, 13),
                "price": cell(row, 12),
            }],
            "images": [anchors.get(r, [])],
        })
    return families


def build_families_acc(rows, anchors, group_names):
    """Accessories: group consecutive rows sharing an explicit group name."""
    groups = []
    cur = None
    for r in range(2, len(rows)):
        row = rows[r - 1]
        name = group_names.get(r)
        if name is None:
            name = cell(row, 0)
        if not name:
            continue
        if cur is None or name != cur["nameZh"]:
            cur = {"nameZh": name, "variants": []}
            groups.append(cur)
        # 吊床 (hammock): spec lives in col 1, weight in col 4
        if r == 42:
            cur["variants"].append({
                "row": r,
                "unit": cell(row, 2),
                "size": cell(row, 1),
                "weightKg": cell(row, 4),
                "notes": cell(row, 5),
                "price": cell(row, 3),
            })
            continue
        cur["variants"].append({
            "row": r,
            "unit": cell(row, 2),
            "size": cell(row, 4),
            "weightKg": cell(row, 5),
            "notes": cell(row, 6) or cell(row, 7) or cell(row, 8),
            "price": cell(row, 3),
        })
    # merge groups that share the same name (split by unrelated rows in between)
    merged = []
    by_name = {}
    for g in groups:
        if g["nameZh"] in by_name:
            by_name[g["nameZh"]]["variants"].extend(g["variants"])
        else:
            merged.append(g)
            by_name[g["nameZh"]] = g
    for g in merged:
        g["images"] = [anchors.get(v["row"], []) for v in g["variants"]]
    return merged


# --------------------------------------------------------------- images ---

def extract_images(z, media_list, product_id, out_images):
    """Extract + convert images for one product. Returns list of public paths."""
    paths = []
    seen = set()
    for media in media_list:
        if not media or media in seen:
            continue
        seen.add(media)
        key = "xl/media/" + media
        try:
            data = z.read(key)
        except KeyError:
            continue
        try:
            im = Image.open(io.BytesIO(data))
            im = ImageOps.exif_transpose(im)
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGB")
        except Exception as e:
            print("  !! cannot open %s: %s" % (media, e))
            continue
        n = len(paths) + 1
        base = "%s-%d" % (product_id, n)
        for suffix, width in (("", MAX_W), ("-thumb", THUMB_W)):
            w, h = im.size
            if max(w, h) > width:
                ratio = width / max(w, h)
                resized = im.resize((max(1, int(w * ratio)), max(1, int(h * ratio))), Image.LANCZOS)
            else:
                resized = im
            out = IMG_DIR / ("%s%s.webp" % (base, suffix))
            if im.mode == "RGBA" or (im.mode == "P" and "transparency" in im.info):
                resized.convert("RGBA").save(out, "WEBP", quality=IMG_QUALITY, method=6)
            else:
                resized.convert("RGB").save(out, "WEBP", quality=IMG_QUALITY, method=6)
        paths.append("/images/products/%s.webp" % base)
    return paths


# ---------------------------------------------------------------- main ---

def main():
    print("== Saul Tents product sync ==")
    print("source:", SRC)
    wb = openpyxl.load_workbook(SRC, data_only=True)
    anchors_raw, dispimg_rows = parse_image_anchors(SRC)

    sheet_titles = wb.sheetnames
    def anchors_for(sheet_idx):
        d = {}
        for row, medias in (anchors_raw.get(sheet_idx) or {}).items():
            d.setdefault(row, []).extend(medias)
        return d

    products = []

    def add_products(families, category, base_id_prefix):
        used_ids = {}
        for f in families:
            name_en = name_to_en(f["nameZh"])
            slug = slugify(name_en)
            if slug in used_ids:
                used_ids[slug] += 1
                slug = "%s-%d" % (slug, used_ids[slug])
            else:
                used_ids[slug] = 1
            pid = "%s-%s" % (base_id_prefix, slug)

            # dedupe identical variant rows
            variants, seen_v = [], set()
            for v in f["variants"]:
                key = (v.get("size"), v.get("weightKg"), v.get("packing"), v.get("price"))
                if key in seen_v:
                    continue
                seen_v.add(key)
                variants.append(v)

            coating = None
            coatings_found = set()
            for v in variants:
                src = (v.get("fabric") or "") + (f["nameZh"] or "")
                for zh, en in CANOPY_COATING_HINT.items():
                    if zh in src:
                        coatings_found.add(en.lower())
            if len(coatings_found) == 1:
                coating = coatings_found.pop()

            images_flat = []
            for lst in f["images"]:
                for m in lst:
                    if m and m not in images_flat:
                        images_flat.append(m)

            product = {
                "id": pid,
                "category": category,
                "nameEn": name_en,
                "nameZh": f["nameZh"],
                "coating": coating,
                "images": [],  # filled after extraction
                "variants": [],
            }

            first = variants[0] if variants else {}
            if first.get("fabric"):
                product["fabric"] = first["fabric"]
            if first.get("poles"):
                product["poles"] = first["poles"]
            if first.get("accessories"):
                product["accessories"] = first["accessories"]
            if first.get("bag"):
                product["bag"] = first["bag"]
            if first.get("notes"):
                product["notes"] = first["notes"]

            for v in variants:
                variant = {}
                if v.get("size"):
                    variant["size"] = format_size(v["size"])
                if v.get("unit"):
                    variant["unit"] = translate_text(v["unit"])
                if v.get("weightKg"):
                    variant["weightKg"] = v["weightKg"]
                if v.get("packing"):
                    variant["packing"] = v["packing"]
                if v.get("carton"):
                    variant["carton"] = v["carton"]
                if v.get("qtyPerCarton"):
                    variant["qtyPerCarton"] = v["qtyPerCarton"]
                if v.get("fabric") and v.get("fabric") != product.get("fabric"):
                    variant["fabric"] = v["fabric"]
                if v.get("notes"):
                    variant["notes"] = v["notes"]
                variant["priceKey"] = "%s::%s" % (pid, v.get("size") or v.get("unit") or str(v["row"]))
                product["variants"].append(variant)

            product["_priceMap"] = {
                "%s::%s" % (pid, v.get("size") or v.get("unit") or str(v["row"])): v.get("price")
                for v in variants
            }
            products.append((product, images_flat, [v["row"] for v in variants]))

    # --- 天幕 (sheet 1) -> canopies
    tarp_families = build_families_tarp(
        [list(r) for r in wb[sheet_titles[0]].iter_rows(values_only=True)],
        anchors_for(1))
    print("canopy families:", len(tarp_families))
    add_products(tarp_families, "canopies", "cp")

    # --- 帐篷 (sheet 2) -> tents
    name_overrides_tent = {6: "黑胶小四面", 7: "黑胶大四面", 14: "大六角黑胶5.25", 11: "假双层-牛津"}
    tent_families = build_families_tent(
        [list(r) for r in wb[sheet_titles[1]].iter_rows(values_only=True)],
        anchors_for(2), name_overrides_tent)
    # image30 floats on the header row; supplier placed it there for the first
    # product (抛帐 / Pop-up Camping Tent) which has no other photo.
    if tent_families:
        tent_families[0]["images"][0] = ["image30.jpeg"] + tent_families[0]["images"][0]
    print("tent families:", len(tent_families))
    add_products(tent_families, "tents", "tn")

    # --- sheet '1' (beach & dome) -> tents
    beach_names = {
        3: "沙滩帐篷", 4: "海滩汽车帐篷", 5: "圆顶四面大帐篷",
        6: "3-4人双人帐篷", 7: "3-4人单门双层帐篷", 8: "经典双层湖畔露营",
        9: "圆顶包4(PA1500)", 10: "圆顶包2", 11: "圆顶包4", 12: "圆顶包4",
        13: "圆顶包6", 14: "300*300*210", 15: "200*140*110",
        16: "隧道式", 17: "沙滩天幕",
    }
    beach_families = build_families_beach(
        [list(r) for r in wb[sheet_titles[3]].iter_rows(values_only=True)],
        anchors_for(4), beach_names)
    print("beach families:", len(beach_families))
    add_products(beach_families, "tents", "bc")

    # --- 户外周边产品 (sheet 3) -> accessories
    acc_group_names = {
        48: "5寸露营车", 49: "7寸露营车", 50: "10寸露营车",
        37: "8.7寸推车的桌板（15块板）",
    }
    acc_rows = [list(r) for r in wb[sheet_titles[2]].iter_rows(values_only=True)]
    acc_rows = acc_rows[:51]  # rows 52+ are free-text notes, not products
    acc_families = build_families_acc(acc_rows, anchors_for(3), acc_group_names)
    print("accessory families:", len(acc_families))
    add_products(acc_families, "accessories", "ac")

    # --- disambiguate duplicate display names with coating suffix
    by_name = {}
    for prod, _, _ in products:
        by_name.setdefault(prod["nameEn"], []).append(prod)
    for name_en, group in by_name.items():
        if len(group) < 2:
            continue
        for prod in group:
            if prod.get("coating"):
                prod["nameEn"] = "%s (%s)" % (name_en, prod["coating"].capitalize())
            elif prod["id"].endswith("-2"):
                prod["nameEn"] = "%s (II)" % name_en

    # --- extract images
    z = zipfile.ZipFile(SRC)
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    # wipe previous product images
    for old in IMG_DIR.glob("*.webp"):
        old.unlink()

    # DISPIMG rows: sheet2 row57 -> image97, row74 -> image98
    for sheet_idx in (2, 4):
        for row, media in (dispimg_rows.get(sheet_idx) or {}).items():
            media = media.split("/")[-1]
            for _, (prod, imgs, rows) in enumerate(products):
                if row in rows and media not in imgs:
                    imgs.append(media)

    image_count = 0
    for prod, imgs, _ in products:
        prod["images"] = extract_images(z, imgs, prod["id"], IMG_DIR)
        image_count += len(prod["images"])

    # --- finalize public data (no prices)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    PRIVATE_DIR.mkdir(parents=True, exist_ok=True)

    public_products = []
    for prod, _, _ in products:
        p = {k: v for k, v in prod.items() if k not in ("variants", "_priceMap")}
        p["variants"] = [
            {k: v for k, v in v.items() if k != "priceKey"}
            for v in prod["variants"]
        ]
        # translate long texts for the English storefront
        specs = spec_text_to_english(prod.get("fabric") or "")
        if specs:
            p["specs"] = specs
        if p.get("fabric"):
            p["fabric"] = translate_text(p["fabric"])
        if p.get("poles"):
            p["poles"] = translate_text(p["poles"])
        if p.get("accessories"):
            p["accessories"] = translate_text(p["accessories"])
        if p.get("bag"):
            p["bag"] = translate_text(p["bag"])
        if p.get("notes"):
            p["notes"] = translate_text(p["notes"])
        public_products.append(p)

    # preserve category ordering for display
    cat_order = {"tents": 0, "canopies": 1, "accessories": 2}
    public_products.sort(key=lambda x: (cat_order[x["category"]], x["nameEn"].lower()))

    payload = {
        "generatedAt": "2026-10-29",
        "source": os.path.basename(SRC),
        "categories": [
            {"slug": "tents", "name": "Tents", "tagline": "Camping, family & event tents"},
            {"slug": "canopies", "name": "Canopies & Tarps", "tagline": "Pole canopies, tarps & shades"},
            {"slug": "accessories", "name": "Accessories", "tagline": "Poles, mats, furniture & gear"},
        ],
        "products": public_products,
    }
    with open(DATA_DIR / "products.json", "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)

    # --- private supplier prices (internal only, never imported by the app)
    price_rows = []
    for prod, _, _ in products:
        for key, price in (prod.get("_priceMap") or {}).items():
            variant_label = key.split("::", 1)[1] if "::" in key else "-"
            price_rows.append({
                "productId": prod["id"],
                "nameZh": prod["nameZh"],
                "variant": variant_label,
                "supplierPriceCny": price,
            })
    with open(PRIVATE_DIR / "prices.json", "w", encoding="utf-8") as fh:
        json.dump(price_rows, fh, ensure_ascii=False, indent=1)

    n_with_img = sum(1 for p, _, _ in products if p["images"])
    print()
    print("== done ==")
    print("products:", len(public_products))
    print("with images:", n_with_img)
    print("images written:", image_count)
    print("public catalog: data/products.json")
    print("internal prices: data/private/prices.json")


if __name__ == "__main__":
    main()
