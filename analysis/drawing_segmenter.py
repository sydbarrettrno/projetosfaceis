from __future__ import annotations

import argparse
import base64
import json
import os
import urllib.error
import urllib.request
from io import BytesIO
from pathlib import Path
from typing import Any

from PIL import Image

SCHEMA_VERSION = "drawing_regions_v1"
DEFAULT_MODEL = "qwen3-vl:8b"
DEFAULT_OLLAMA_URL = "http://localhost:11434"
MAX_IMAGE_DIMENSION = 4096

ALLOWED_TYPES = {
    "planta_baixa",
    "corte",
    "elevacao",
    "implantacao_cobertura",
    "situacao_localizacao",
    "tratamento_esgoto",
    "quadro_estatistico",
    "carimbo",
    "outro",
}

SYSTEM_PROMPT = """Você é um segmentador visual de pranchas arquitetônicas.
Sua única tarefa é localizar desenhos/regiões principais da prancha.
Não analise legislação, conformidade, documentação ou erros de projeto.
Não explique nada. Não invente regiões que não estejam visíveis.
Retorne somente JSON válido, sem markdown.
"""

USER_PROMPT = """Identifique e delimite as regiões principais desta prancha arquitetônica.

Tipos permitidos:
- planta_baixa
- corte
- elevacao
- implantacao_cobertura
- situacao_localizacao
- tratamento_esgoto
- quadro_estatistico
- carimbo
- outro

Regras:
1. Uma região por desenho distinto.
2. Se houver dois cortes, retorne duas regiões do tipo corte.
3. bbox deve usar coordenadas normalizadas de 0 a 1000 no formato [x0, y0, x1, y1].
4. confidence deve ficar entre 0 e 1.
5. label deve reproduzir o título visível quando houver; se não houver, use uma descrição curta.
6. Não inclua elementos pequenos internos a outro desenho.
7. O carimbo pode ser localizado, mas não deve ser confundido com desenho técnico.

Formato obrigatório:
{
  "regions": [
    {
      "type": "planta_baixa",
      "label": "PLANTA BAIXA",
      "bbox": [0, 0, 1000, 1000],
      "confidence": 0.95
    }
  ]
}
"""


def prepare_image(image_path: Path, max_dimension: int = MAX_IMAGE_DIMENSION) -> tuple[bytes, dict[str, int]]:
    with Image.open(image_path) as source:
        image = source.convert("RGB")
        original_width, original_height = image.size
        longest = max(original_width, original_height)
        if longest > max_dimension:
            scale = max_dimension / longest
            resized = image.resize(
                (max(1, round(original_width * scale)), max(1, round(original_height * scale))),
                Image.Resampling.LANCZOS,
            )
        else:
            resized = image

        buffer = BytesIO()
        resized.save(buffer, format="JPEG", quality=90, optimize=True)
        return buffer.getvalue(), {
            "original_width_px": original_width,
            "original_height_px": original_height,
            "model_width_px": resized.width,
            "model_height_px": resized.height,
        }


def extract_json_object(text: str) -> dict[str, Any]:
    stripped = text.strip()
    try:
        parsed = json.loads(stripped)
    except json.JSONDecodeError:
        start = stripped.find("{")
        end = stripped.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("O modelo não retornou um objeto JSON.")
        parsed = json.loads(stripped[start : end + 1])

    if not isinstance(parsed, dict):
        raise ValueError("A resposta do modelo deve ser um objeto JSON.")
    return parsed


def validate_bbox(value: Any) -> list[int]:
    if not isinstance(value, list) or len(value) != 4:
        raise ValueError("bbox inválida")
    coords = [int(round(float(item))) for item in value]
    x0, y0, x1, y1 = coords
    if not (0 <= x0 < x1 <= 1000 and 0 <= y0 < y1 <= 1000):
        raise ValueError("bbox fora do intervalo normalizado")
    return coords


def normalize_regions(raw: dict[str, Any]) -> list[dict[str, Any]]:
    values = raw.get("regions", [])
    if not isinstance(values, list):
        raise ValueError("regions deve ser uma lista")

    regions: list[dict[str, Any]] = []
    for index, item in enumerate(values, start=1):
        if not isinstance(item, dict):
            continue
        region_type = str(item.get("type", "outro")).strip().lower()
        if region_type not in ALLOWED_TYPES:
            region_type = "outro"

        label = str(item.get("label", "")).strip() or region_type
        bbox = validate_bbox(item.get("bbox"))
        confidence = float(item.get("confidence", 0.0))
        confidence = max(0.0, min(1.0, confidence))

        regions.append(
            {
                "id": f"region_{index:03d}",
                "type": region_type,
                "label": label,
                "bbox_norm_1000": bbox,
                "confidence": round(confidence, 4),
            }
        )
    return regions


def ollama_chat(
    image_bytes: bytes,
    model: str = DEFAULT_MODEL,
    base_url: str = DEFAULT_OLLAMA_URL,
    timeout: int = 300,
) -> str:
    endpoint = base_url.rstrip("/") + "/api/chat"
    payload = {
        "model": model,
        "stream": False,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": USER_PROMPT,
                "images": [base64.b64encode(image_bytes).decode("ascii")],
            },
        ],
        "options": {"temperature": 0},
    }

    request = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as exc:
        raise RuntimeError(
            f"Não foi possível acessar o Ollama em {base_url}. "
            "Confirme se o Ollama está instalado e em execução."
        ) from exc

    message = body.get("message", {})
    content = message.get("content") if isinstance(message, dict) else None
    if not isinstance(content, str) or not content.strip():
        raise RuntimeError("Ollama retornou uma resposta vazia.")
    return content


def segment_image(
    image_path: Path,
    model: str = DEFAULT_MODEL,
    base_url: str = DEFAULT_OLLAMA_URL,
) -> dict[str, Any]:
    if not image_path.exists():
        raise FileNotFoundError(image_path)

    image_bytes, image_info = prepare_image(image_path)
    response_text = ollama_chat(image_bytes, model=model, base_url=base_url)
    parsed = extract_json_object(response_text)
    regions = normalize_regions(parsed)

    return {
        "schema_version": SCHEMA_VERSION,
        "source_image": image_path.name,
        "model": model,
        "image": image_info,
        "regions": regions,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Segmenta visualmente os desenhos de uma prancha arquitetônica usando Ollama + Qwen3-VL."
    )
    parser.add_argument("image", type=Path)
    parser.add_argument("--output", type=Path, default=Path("drawing_regions.json"))
    parser.add_argument("--model", default=os.getenv("DRAWING_VLM_MODEL", DEFAULT_MODEL))
    parser.add_argument("--ollama-url", default=os.getenv("OLLAMA_URL", DEFAULT_OLLAMA_URL))
    args = parser.parse_args()

    result = segment_image(args.image, model=args.model, base_url=args.ollama_url)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(args.output)


if __name__ == "__main__":
    main()
