"""Check the shared layout's files and references, not the full Herdr schema."""

import json
from pathlib import Path
import re
import struct
import unittest
import xml.etree.ElementTree as ET
import zlib


ROOT = Path(__file__).resolve().parent.parent
BUILT_INS = {"workspace-chrome", "workspace-status", "pane", "files", "changes"}
CUSTOM = {"compact-spaces", "compact-agents", "compact-footer", "compact-tabs"}


class LayoutTests(unittest.TestCase):
    def test_layout_tree_and_mod_references(self):
        layout = json.loads((ROOT / "layouts/herdquarters.json").read_text())
        ids = set()
        mods = set()

        def walk(node):
            self.assertIn(node["type"], {"row", "column", "block", "stack"})
            self.assertTrue(node["id"])
            self.assertNotIn(node["id"], ids)
            ids.add(node["id"])
            if node["type"] == "block":
                content = node["content"]
                self.assertNotIn("terminal", content, "Do not bundle terminal addresses")
                if "mod" in content:
                    mods.add(content["mod"])
                if "pane" in content:
                    mods.add(content["pane"]["header"]["content"]["mod"])
            else:
                self.assertTrue(node["children"])
                if node["type"] == "stack":
                    self.assertIn(node["active"], {n["id"] for n in node["children"]})
                for child in node["children"]:
                    walk(child)

        walk(layout)
        self.assertEqual(mods, BUILT_INS | CUSTOM)
        self.assertEqual(layout["preview"], "layouts/herdquarters.svg")
        ET.parse(ROOT / layout["preview"])
        self.assertEqual(layout["theme"], {"light": "paper", "dark": "night-owl"})
        self.assertEqual(layout["cloned_from"], {"name": "main", "version": "0.1.9"})
        for mod in CUSTOM:
            folder = ROOT / "mods" / mod
            manifest = json.loads((folder / "mod.json").read_text())
            self.assertEqual(manifest["place"], "none")
            self.assertIn("version", manifest["cloned_from"])
            self.assertIn("extends View", (folder / "main.js").read_text())

    def test_theme_colors(self):
        theme = json.loads((ROOT / "themes/night-owl.json").read_text())
        self.assertEqual(len(theme["ansi"]), 16)
        colors = theme["ansi"] + list(theme["colors"].values())
        colors += [theme[key] for key in ("background", "foreground", "selection", "cursor")]
        for color in colors:
            self.assertRegex(color, r"^#[0-9a-fA-F]{6}$")

    def test_recipe_sections(self):
        recipe = (ROOT / "RECIPE.md").read_text()
        headings = re.findall(r"^#{1,2} (.+)$", recipe, re.MULTILINE)
        self.assertEqual(headings, ["herdquarters", "What you see", "How it behaves",
                                    "Built from", "Watch out", "Done when"])
        self.assertIn("![herdquarters](preview.png)", recipe)

    def test_preview_has_no_embedded_text_or_exif(self):
        data = (ROOT / "preview.png").read_bytes()
        self.assertEqual(data[:8], b"\x89PNG\r\n\x1a\n")
        offset = 8
        chunks = []
        while offset < len(data):
            length = struct.unpack_from(">I", data, offset)[0]
            kind = data[offset + 4:offset + 8]
            payload = data[offset + 8:offset + 8 + length]
            crc = struct.unpack_from(">I", data, offset + 8 + length)[0]
            self.assertEqual(zlib.crc32(kind + payload) & 0xFFFFFFFF, crc)
            self.assertNotIn(kind, {b"tEXt", b"zTXt", b"iTXt", b"eXIf"})
            chunks.append(kind)
            offset += length + 12
            if kind == b"IEND":
                break
        self.assertEqual(offset, len(data), "Unexpected data after PNG image")
        self.assertEqual(chunks[0], b"IHDR")
        self.assertIn(b"IDAT", chunks)
        self.assertEqual(chunks[-1], b"IEND")


if __name__ == "__main__":
    unittest.main()
