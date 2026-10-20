"""Build a single GLB with 15 Asian countries extruded from real borders.

Pipeline (headless Blender):

    Natural Earth 1:50m admin-0 GeoJSON
      -> Lambert azimuthal equal-area projection (90E / 32N)
      -> Douglas-Peucker simplification (triangle budget)
      -> 2D filled Bezier curve per country (holes preserved)
      -> bmesh extrude + EAR_CLIP triangulate + recalc normals + flat shading
      -> GLB (Draco) + manifest

Run via `npm run model:build` (see scripts/build-model.mjs).
"""

from __future__ import annotations

import json
import math
import os
import sys
import traceback

import bmesh
import bpy

# --------------------------------------------------------------------------- #
# Paths
# --------------------------------------------------------------------------- #

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "assets", "source", "ne_50m_admin_0_countries.geojson")
PALETTE = os.path.join(ROOT, "assets", "palette.json")
OUT_GLB = os.path.join(ROOT, "public", "models", "asia.glb")
OUT_MANIFEST = os.path.join(ROOT, "public", "models", "asia.manifest.json")

# --------------------------------------------------------------------------- #
# Tunables
# --------------------------------------------------------------------------- #

# Lambert azimuthal equal-area, centred on continental Asia.
EARTH_RADIUS = 100.0  # scene units for the full 2 * R diameter
LON0 = 90.0
LAT0 = 32.0

# Simplification tolerance in scene units (1 unit ~= 63.7 km). The first value
# that fits the triangle budget wins, so detail degrades only when needed.
TOLERANCE_STEPS = (0.03, 0.05, 0.08, 0.12)

# Islands smaller than this projected area (~40 km^2) are specks at this scale.
MIN_ISLAND_AREA = 0.01

# Rings with at most this many source vertices skip simplification entirely.
KEEP_UNSIMPLIFIED_ABOVE = 32

MAX_TRIANGLES = 60000

NEUTRAL_COLOR = "#d9d6cf"  # used until assets/palette.json exists

# Extrusion heights are placeholders until the design pass fixes the relief.
COUNTRIES = (
    {"id": "cn", "iso3": "CHN", "name": "China", "height": 6.0},
    {"id": "in", "iso3": "IND", "name": "India", "height": 5.4},
    {"id": "id", "iso3": "IDN", "name": "Indonesia", "height": 3.2},
    {"id": "jp", "iso3": "JPN", "name": "Japan", "height": 4.2},
    {"id": "kr", "iso3": "KOR", "name": "South Korea", "height": 3.6},
    {"id": "my", "iso3": "MYS", "name": "Malaysia", "height": 3.0},
    {"id": "ph", "iso3": "PHL", "name": "Philippines", "height": 3.0},
    {"id": "sg", "iso3": "SGP", "name": "Singapore", "height": 1.8},
    {"id": "th", "iso3": "THA", "name": "Thailand", "height": 3.8},
    {"id": "vn", "iso3": "VNM", "name": "Vietnam", "height": 3.4},
    {"id": "sa", "iso3": "SAU", "name": "Saudi Arabia", "height": 4.6},
    {"id": "tr", "iso3": "TUR", "name": "Turkey", "height": 4.4},
    {"id": "kz", "iso3": "KAZ", "name": "Kazakhstan", "height": 4.8},
    {"id": "uz", "iso3": "UZB", "name": "Uzbekistan", "height": 3.0},
    {"id": "mn", "iso3": "MNG", "name": "Mongolia", "height": 4.0},
)

ISO3_LIST = [c["iso3"] for c in COUNTRIES]
ID_BY_ISO3 = {c["iso3"]: c["id"] for c in COUNTRIES}

PHI0 = math.radians(LAT0)


# --------------------------------------------------------------------------- #
# Geo helpers
# --------------------------------------------------------------------------- #


def log(message: str) -> None:
    print(f"[build] {message}", flush=True)


def fail(message: str) -> "NoReturn":  # type: ignore[valid-type]
    print(f"[build] GAGAL: {message}", file=sys.stderr, flush=True)
    sys.exit(1)


def project(lon: float, lat: float) -> tuple[float, float]:
    """Lambert azimuthal equal-area (spherical form)."""
    lam = math.radians(lon - LON0)
    phi = math.radians(lat)
    denominator = 1.0 + math.sin(PHI0) * math.sin(phi) + math.cos(PHI0) * math.cos(phi) * math.cos(lam)
    if denominator <= 1e-9:
        denominator = 1e-9
    k = math.sqrt(2.0 / denominator)
    x = EARTH_RADIUS * k * math.cos(phi) * math.sin(lam)
    y = EARTH_RADIUS * k * (
        math.cos(PHI0) * math.sin(phi) - math.sin(PHI0) * math.cos(phi) * math.cos(lam)
    )
    return x, y


def signed_area(points: list[tuple[float, float]]) -> float:
    total = 0.0
    count = len(points)
    for index in range(count):
        x1, y1 = points[index]
        x2, y2 = points[(index + 1) % count]
        total += x1 * y2 - x2 * y1
    return total * 0.5


def simplify(points: list[tuple[float, float]], tolerance: float) -> list[tuple[float, float]]:
    """Douglas-Peucker on a closed ring (kept closed implicitly)."""
    count = len(points)
    if count < 4:
        return list(points)

    ring = list(points) + [points[0]]
    keep = [False] * len(ring)
    keep[0] = keep[-1] = True
    stack = [(0, len(ring) - 1)]
    tolerance_sq = tolerance * tolerance

    while stack:
        start, end = stack.pop()
        if end <= start + 1:
            continue
        ax, ay = ring[start]
        bx, by = ring[end]
        dx, dy = bx - ax, by - ay
        length_sq = dx * dx + dy * dy
        best_dist_sq, best_index = -1.0, -1
        for index in range(start + 1, end):
            px, py = ring[index]
            if length_sq <= 1e-18:
                dist_sq = (px - ax) ** 2 + (py - ay) ** 2
            else:
                t = ((px - ax) * dx + (py - ay) * dy) / length_sq
                t = 0.0 if t < 0.0 else (1.0 if t > 1.0 else t)
                qx, qy = ax + t * dx, ay + t * dy
                dist_sq = (px - qx) ** 2 + (py - qy) ** 2
            if dist_sq > best_dist_sq:
                best_dist_sq, best_index = dist_sq, index
        if best_dist_sq > tolerance_sq:
            keep[best_index] = True
            stack.append((start, best_index))
            stack.append((best_index, end))

    return [ring[index] for index in range(len(ring) - 1) if keep[index]]


def make_ring(ring: list[list[float]], tolerance: float) -> list[tuple[float, float]] | None:
    points = [project(coord[0], coord[1]) for coord in ring]
    if len(points) > 1 and points[0] == points[-1]:
        points = points[:-1]
    if len(points) < 3:
        return None
    # Small features are already coarse in the 1:50m source; simplifying them
    # again visibly shrinks islands (Singapore loses ~30% of its area).
    if len(points) > KEEP_UNSIMPLIFIED_ABOVE:
        points = simplify(points, tolerance)
    if len(points) < 3:
        return None
    return points


def load_polygons(tolerance: float) -> dict[str, list[dict[str, list]]]:
    """iso3 -> [{outer: [...], holes: [[...], ...]}, ...] in projected space."""
    if not os.path.exists(SOURCE):
        fail(
            f"sumber data tidak ditemukan: {SOURCE}. "
            "Unduh sesuai assets/source/README.md lalu jalankan ulang."
        )

    with open(SOURCE, encoding="utf-8") as handle:
        collection = json.load(handle)

    polygons: dict[str, list[dict[str, list]]] = {iso3: [] for iso3 in ISO3_LIST}
    skipped_holes = 0

    for feature in collection.get("features", []):
        properties = feature.get("properties", {})
        iso3 = properties.get("ISO_A3")
        if iso3 not in polygons:
            iso3 = properties.get("ADM0_A3")
        if iso3 not in polygons:
            continue

        geometry = feature.get("geometry") or {}
        raw_polygons = (
            geometry.get("coordinates", [])
            if geometry.get("type") == "MultiPolygon"
            else [geometry.get("coordinates", [])]
        )

        for raw_polygon in raw_polygons:
            if not raw_polygon:
                continue
            outer = make_ring(raw_polygon[0], tolerance)
            if outer is None or abs(signed_area(outer)) < MIN_ISLAND_AREA:
                continue
            holes = []
            for raw_hole in raw_polygon[1:]:
                hole = make_ring(raw_hole, tolerance)
                if hole is None or abs(signed_area(hole)) < MIN_ISLAND_AREA * 0.05:
                    skipped_holes += 1
                    continue
                holes.append(hole)
            polygons[iso3].append({"outer": outer, "holes": holes})

    if skipped_holes:
        log(f"lewat {skipped_holes} lubang kecil (di bawah ambang area)")

    missing = [iso3 for iso3 in ISO3_LIST if not polygons[iso3]]
    if missing:
        fail(f"negara tidak ditemukan di GeoJSON: {', '.join(missing)}")

    return polygons


# --------------------------------------------------------------------------- #
# Colour helpers
# --------------------------------------------------------------------------- #


def srgb_to_linear(channel: float) -> float:
    if channel <= 0.04045:
        return channel / 12.92
    return ((channel + 0.055) / 1.055) ** 2.4


def hex_to_linear_rgba(value: str) -> tuple[float, float, float, float]:
    text = value.strip().lstrip("#")
    if len(text) != 6:
        raise ValueError(f"warna hex tidak valid: {value!r}")
    rgb = [int(text[index : index + 2], 16) / 255.0 for index in (0, 2, 4)]
    return (*(srgb_to_linear(channel) for channel in rgb), 1.0)


def load_palette() -> tuple[dict[str, str], bool]:
    if not os.path.exists(PALETTE):
        log(f"palette belum tersedia ({os.path.relpath(PALETTE, ROOT)}) — memakai warna netral {NEUTRAL_COLOR}")
        return {}, False
    with open(PALETTE, encoding="utf-8") as handle:
        raw = json.load(handle)
    if not isinstance(raw, dict):
        fail(f"{PALETTE} harus berisi objek {{\"cn\": \"#RRGGBB\", ...}}")
    palette = {}
    for key, value in raw.items():
        if not isinstance(value, str):
            fail(f"warna palette untuk {key!r} bukan string hex")
        try:
            hex_to_linear_rgba(value)
        except ValueError as error:
            fail(str(error))
        palette[key] = value
    log(f"palette dimuat: {len(palette)} warna dari {os.path.relpath(PALETTE, ROOT)}")
    return palette, True


def make_material(country: dict, palette: dict[str, str], has_palette: bool) -> bpy.types.Material:
    hex_color = palette.get(country["id"], NEUTRAL_COLOR)
    if has_palette and country["id"] not in palette:
        log(f"warna untuk {country['id']} tidak ada di palette — memakai {NEUTRAL_COLOR}")
    rgba = hex_to_linear_rgba(hex_color)

    material = bpy.data.materials.new(name=f"mat_{country['iso3']}")
    material.use_nodes = True
    material.diffuse_color = rgba
    principled = material.node_tree.nodes.get("Principled BSDF")
    if principled is not None:
        principled.inputs["Base Color"].default_value = rgba
        principled.inputs["Roughness"].default_value = 0.85
        principled.inputs["Metallic"].default_value = 0.0
    material["source_hex"] = hex_color
    return material


# --------------------------------------------------------------------------- #
# Scene assembly
# --------------------------------------------------------------------------- #


def reset_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"


def fill_curve(polygons: list[dict], name: str) -> bpy.types.Curve:
    """Filled 2D curve; Blender's scanfill resolves outer rings and holes."""
    curve = bpy.data.curves.new(f"curve_{name}", type="CURVE")
    curve.dimensions = "2D"
    curve.fill_mode = "BOTH"
    curve.resolution_u = 1
    curve.offset = 0.0

    for polygon in polygons:
        rings = [polygon["outer"], *polygon["holes"]]
        # Outer CCW, holes CW — keeps scanfill's winding assumptions consistent.
        for ring_index, ring in enumerate(rings):
            area = signed_area(ring)
            want_positive = ring_index == 0
            ordered = ring if (area > 0) == want_positive else list(reversed(ring))
            spline = curve.splines.new("POLY")
            spline.points.add(len(ordered) - 1)
            for point_index, (x, y) in enumerate(ordered):
                spline.points[point_index].co = (x, y, 0.0, 1.0)
            spline.use_cyclic_u = True

    return curve


def build_country(country: dict, polygons: list[dict], palette: dict[str, str], has_palette: bool) -> dict:
    curve = fill_curve(polygons, country["iso3"])
    curve_object = bpy.data.objects.new(country["iso3"], curve)
    bpy.context.collection.objects.link(curve_object)

    depsgraph = bpy.context.evaluated_depsgraph_get()
    depsgraph.update()
    mesh = bpy.data.meshes.new_from_object(curve_object.evaluated_get(depsgraph))

    bpy.data.objects.remove(curve_object, do_unlink=True)
    bpy.data.curves.remove(curve)

    if len(mesh.polygons) == 0:
        fail(f"curve fill menghasilkan 0 face untuk {country['iso3']}")

    bm = bmesh.new()
    bm.from_mesh(mesh)
    bm.verts.ensure_lookup_table()
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-6)

    cap_faces = bm.faces[:]
    extrude = bmesh.ops.extrude_face_region(bm, geom=cap_faces)
    raised_verts = [element for element in extrude["geom"] if isinstance(element, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=raised_verts, vec=(0.0, 0.0, country["height"]))

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bmesh.ops.triangulate(
        bm,
        faces=bm.faces[:],
        quad_method="BEAUTY",
        ngon_method="EAR_CLIP",
    )
    bm.to_mesh(mesh)
    bm.free()

    for polygon in mesh.polygons:
        polygon.use_smooth = False

    mesh.materials.append(make_material(country, palette, has_palette))

    obj = bpy.data.objects.new(country["iso3"], mesh)
    obj["iso_a3"] = country["iso3"]
    obj["id"] = country["id"]
    obj["country"] = country["name"]
    obj["height"] = float(country["height"])
    bpy.context.collection.objects.link(obj)

    triangles = len(mesh.polygons)
    if triangles == 0:
        fail(f"triangulasi menghasilkan 0 triangle untuk {country['iso3']}")

    return {
        "id": country["id"],
        "iso3": country["iso3"],
        "name": country["name"],
        "triangles": triangles,
        "vertices": len(mesh.vertices),
        "height": country["height"],
    }


def build_scene(tolerance: float, palette: dict[str, str], has_palette: bool) -> list[dict]:
    reset_scene()
    polygons_by_iso3 = load_polygons(tolerance)

    stats = []
    for country in COUNTRIES:
        stats.append(build_country(country, polygons_by_iso3[country["iso3"]], palette, has_palette))
        log(
            f"{country['iso3']} ({country['id']}): "
            f"verts={stats[-1]['vertices']} tris={stats[-1]['triangles']} height={country['height']}"
        )

    scene_objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if len(scene_objects) != len(COUNTRIES):
        fail(f"jumlah objek mesh {len(scene_objects)} != {len(COUNTRIES)}")

    present = sorted(obj.get("iso_a3", "") for obj in scene_objects)
    missing = sorted(set(ISO3_LIST) - set(present))
    if missing:
        fail(f"negara hilang dari scene: {', '.join(missing)}")

    total_triangles = sum(item["triangles"] for item in stats)
    total_vertices = sum(item["vertices"] for item in stats)
    log(
        f"TOTAL objek={len(scene_objects)} triangle={total_triangles} "
        f"vertex={total_vertices} tolerance={tolerance}"
    )
    return stats


def export_glb() -> None:
    os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=OUT_GLB,
        export_format="GLB",
        export_apply=True,
        export_extras=True,
        export_texcoords=False,
        export_normals=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_yup=True,
        use_selection=False,
        export_cameras=False,
        export_lights=False,
    )
    size = os.path.getsize(OUT_GLB)
    log(f"GLB ditulis: {os.path.relpath(OUT_GLB, ROOT)} ({size} bytes)")


def write_manifest(stats: list[dict]) -> None:
    manifest = [
        {
            "id": item["id"],
            "iso3": item["iso3"],
            "name": item["name"],
            "triangles": item["triangles"],
            "height": item["height"],
        }
        for item in stats
    ]
    os.makedirs(os.path.dirname(OUT_MANIFEST), exist_ok=True)
    with open(OUT_MANIFEST, "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    log(f"manifest ditulis: {os.path.relpath(OUT_MANIFEST, ROOT)} ({len(manifest)} entri)")


def main() -> None:
    palette, has_palette = load_palette()

    stats = None
    for tolerance in TOLERANCE_STEPS:
        log(f"membangun scene dengan tolerance={tolerance}")
        candidate = build_scene(tolerance, palette, has_palette)
        total_triangles = sum(item["triangles"] for item in candidate)
        if total_triangles <= MAX_TRIANGLES:
            stats = candidate
            break
        log(f"triangle {total_triangles} > batas {MAX_TRIANGLES} — menaikkan tolerance")

    if stats is None:
        fail(f"tidak bisa menurunkan triangle ke <= {MAX_TRIANGLES} dalam {len(TOLERANCE_STEPS)} percobaan")

    if len(stats) != len(COUNTRIES):
        fail(f"jumlah entri manifest {len(stats)} != {len(COUNTRIES)}")

    export_glb()
    write_manifest(stats)
    log("selesai")


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception:  # noqa: BLE001 - surface the real traceback, then exit hard
        traceback.print_exc()
        sys.exit(1)
