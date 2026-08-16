from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

import pdfplumber
import pypdfium2 as pdfium


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def render_pages(pdf_path: Path, render_dir: Path, dpi: int) -> list[str]:
    render_dir.mkdir(parents=True, exist_ok=True)
    document = pdfium.PdfDocument(str(pdf_path))
    rendered: list[str] = []
    scale = dpi / 72.0

    try:
        for index in range(len(document)):
            page = document[index]
            bitmap = page.render(scale=scale)
            image = bitmap.to_pil()
            output = render_dir / f"page_{index + 1:03d}.png"
            image.save(output)
            rendered.append(str(output))
            bitmap.close()
            page.close()
    finally:
        document.close()

    return rendered


def compact_word(word: dict[str, Any]) -> dict[str, Any]:
    return {
        "text": str(word.get("text", "")),
        "x0": round(float(word.get("x0", 0)), 2),
        "top": round(float(word.get("top", 0)), 2),
        "x1": round(float(word.get("x1", 0)), 2),
        "bottom": round(float(word.get("bottom", 0)), 2),
    }


def inspect_pdf(pdf_path: Path, render_dir: Path | None = None, dpi: int = 150) -> dict[str, Any]:
    if not pdf_path.exists():
        raise FileNotFoundError(pdf_path)

    rendered_paths: list[str] = []
    if render_dir is not None:
        rendered_paths = render_pages(pdf_path, render_dir, dpi)

    pages: list[dict[str, Any]] = []

    with pdfplumber.open(pdf_path) as document:
        for index, page in enumerate(document.pages):
            words = page.extract_words(
                x_tolerance=2,
                y_tolerance=2,
                keep_blank_chars=False,
                use_text_flow=False,
            ) or []

            pages.append(
                {
                    "page": index + 1,
                    "width_pt": round(float(page.width), 2),
                    "height_pt": round(float(page.height), 2),
                    "objects": {
                        "words": len(words),
                        "lines": len(page.lines),
                        "rects": len(page.rects),
                        "curves": len(page.curves),
                        "images": len(page.images),
                    },
                    "text_items": [compact_word(word) for word in words],
                    "render_path": rendered_paths[index] if index < len(rendered_paths) else None,
                }
            )

    return {
        "schema_version": "pdf_inspector_v1",
        "source_file": pdf_path.name,
        "sha256": sha256_file(pdf_path),
        "page_count": len(pages),
        "pages": pages,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Inventário técnico rastreável de PDF arquitetônico.")
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--output", type=Path, default=Path("pdf_manifest.json"))
    parser.add_argument("--render-dir", type=Path, default=None)
    parser.add_argument("--dpi", type=int, default=150)
    args = parser.parse_args()

    manifest = inspect_pdf(args.pdf, args.render_dir, args.dpi)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(args.output)


if __name__ == "__main__":
    main()
