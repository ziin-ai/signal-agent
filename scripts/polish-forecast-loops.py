#!/usr/bin/env python3
"""Replace thin seeded loops. August kospi: score from the next print. Themes: keep pending."""

from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1] / "src" / "content" / "posts"
LOOP_RE = re.compile(r"^loop:\n(?:  .+\n){5}", re.M)

AUGUST: dict[str, dict[str, str]] = {
    "2026-08-13-kospi-6800-chip-inflow.md": {
        "prior": "6800이 CPI·공급대책의 선인가",
        "result": "장중 6808.86. 외인 +1.49조, 닉스·삼전이 본체",
        "score": "hit",
        "note": "밀려도 외인 현물이 선을 샀다",
        "next": "연휴 앞에도 외인 부호가 6800 종가를 남기는가",
    },
    "2026-08-14-kospi-6800-holiday-cash.md": {
        "prior": "연휴 앞 외인 현물이 6800을 남기는가",
        "result": "시가 6995·고점 7010. 장중 외인 +4343억. 종가 6977.94는 다음날 글",
        "score": "hit",
        "note": "7천은 열렸고 본체는 외인 창구",
        "next": "종가 6977이 7천 안착인가, 창구 종가인가",
    },
    "2026-08-15-kospi-6977-holiday-gap.md": {
        "prior": "종가 6977이 7천 안착인가",
        "result": "금요일 종가 6977.94(+2.42%). 고점 7010 반납. 휴장",
        "score": "hit",
        "note": "7천 안착이 아니라 창구 종가",
        "next": "화요일 첫 현금이 6800을 재시험하거나 전기전자를 파나",
    },
    "2026-08-16-kospi-kosdaq-week2-rotation.md": {
        "prior": "주간 외인 +6.6조와 코스닥 매도가 같은 로테인가",
        "result": "휴장. 주간 숫자는 그대로",
        "score": "pending",
        "note": "연휴 둘째 날. 현물 없음",
        "next": "화요일 첫 현금이 6800을 재시험하거나 전기전자를 파나",
    },
    "2026-08-17-kospi-ceasefire-expiry-gap.md": {
        "prior": "시한 만료가 화요일 창구보다 월요일 뉴욕이 먼저인가",
        "result": "휴장. 호르무즈 16일 통행 0척",
        "score": "pending",
        "note": "대체휴일. 현물 없음",
        "next": "화요일 첫 현금이 6800을 재시험하거나 전기전자를 파나",
    },
    "2026-08-18-kospi-brent-90-memory-split.md": {
        "prior": "화요일 첫 현금이 6800을 재시험하거나 전기전자를 파나",
        "result": "시가 7127.77, 장중 7216. 전기전자 +5765억, 외인 +1.46조",
        "score": "miss",
        "note": "재시험·순매도 가드레일은 꺼졌다",
        "next": "종가 7000이 창구 확인으로 남나",
    },
    "2026-08-19-kospi-adr-dump-window.md": {
        "prior": "종가 7000이 창구 확인으로 남나",
        "result": "8/18 종가 6869.83. 다음날 시가 6528.77, 저점 6400. 전기전자 −1.19조",
        "score": "miss",
        "note": "7000 종가는 반납됐고 시가에서 6800이 깨졌다",
        "next": "ADR 번역이 종가까지인가, 6869 위 갭 소화인가",
    },
    "2026-08-20-kospi-buyback-hynix-window.md": {
        "prior": "ADR 번역이 종가까지인가",
        "result": "외인 −에서 +3346억. 매수 사이드카. 장중 6796.65",
        "score": "partial",
        "note": "창구 부호는 뒤집혔고 6869 종가는 아직이다",
        "next": "종가 6869 위·외인 순매수가 8/18 소화인가",
    },
    "2026-08-21-kospi-yield-fade.md": {
        "prior": "종가 6869 위가 8/18 소화인가",
        "result": "시가 6759.95. 6869는 시가에서 꺼짐. 장중 6680은 유지. 외인 +1063억",
        "score": "miss",
        "note": "소화 레벨은 시가에서 끝났고 규모도 전일이 아니다",
        "next": "종가 6680이 남나",
    },
    "2026-08-22-kospi-samsung-110t-gap.md": {
        "prior": "종가 6680이 남나",
        "result": "금요일 종가 6912.95(+0.88%). 외인 −1707억. 코스닥은 사이드카 종가",
        "score": "hit",
        "note": "6680은 남고 종가는 삼전 기대로 올라왔다",
        "next": "월요일 삼전 281500을 잃고 전기전자 외인이 다시 팔면 6912는 기대 종가인가",
    },
    "2026-08-23-kospi-night-futures-gap.md": {
        "prior": "야간선물 −2.29%가 하락 확정인가",
        "result": "현물 전. 아직 없음",
        "score": "pending",
        "note": "월요일 개장 전",
        "next": "갭 유지 vs 메움을 외인 창구로 가른다. 15조 취득이 현물에서 시작되나",
    },
    "2026-08-24-kospi-samsung-15t-open.md": {
        "prior": "15조 취득과 281500이 월요일 현금의 바닥인가",
        "result": "첫 현금 전. 종가는 다음날 글",
        "score": "pending",
        "note": "08:00 장전. 세션 미인쇄",
        "next": "15조가 현물에서 시작되고 281500이 현금으로 만나나",
    },
    "2026-08-25-kospi-samsung-257k-buffer.md": {
        "prior": "15조·281500이 월요일 현금의 바닥인가",
        "result": "281500 이탈. 기타법인 약 5300억. 외인 삼전 −1.81조",
        "score": "miss",
        "note": "15조 창구는 바닥이 아니었고 외인이 삼켰다",
        "next": "25만7천원 종가를 현물이 받나",
    },
    "2026-08-26-kospi-6742-nvda-eve.md": {
        "prior": "25만7천원 종가를 현물이 받나",
        "result": "화요일 저점 6408에서 6742. 삼전 245000까지 밀린 뒤 257000 보합",
        "score": "hit",
        "note": "257000을 종가로 받았고 지수도 돌아왔다",
        "next": "야간선물 +1.20%가 엔비디아 실적 선할인인가",
    },
    "2026-08-27-kospi-6808-nvda-print.md": {
        "prior": "야간선물 +1.20%가 엔비디아 실적 선할인인가",
        "result": "수요일 종가 6808.21(+0.97%). 엔비디아 매출 비트, 시간외 +4.4%",
        "score": "partial",
        "note": "6800은 다시 찍었고 실적 비트는 갭 뒤에 더 붙었다",
        "next": "가이던스 1080억·마진 74%를 현물이 같은 부호로 받나",
    },
    "2026-08-28-kospi-6912-nvda-cash.md": {
        "prior": "가이던스를 현물이 같은 부호로 받나",
        "result": "목요일 시가 6996.12, 종가 6912.37(+1.53%). 엔비디아 정규장 +8.74%",
        "score": "hit",
        "note": "같은 부호로 열었고 7천 시가를 한 번 열어봤다",
        "next": "열어본 7천을 6912 위에서 다시 받나",
    },
    "2026-08-29-kospi-6788-warsh-overlay.md": {
        "prior": "열어본 7천을 6912 위에서 다시 받나",
        "result": "금요일 시가 6846, 고점 6901, 종가 6788.88(−1.79%). 삼전 257000",
        "score": "miss",
        "note": "7천은 토했고 종가는 6788",
        "next": "이미 토한 6788을 월요 현물이 받나",
    },
    "2026-08-30-kospi-sox-week-ahead.md": {
        "prior": "월요일은 워시 주인가",
        "result": "휴장. 주간 외인 −8.3조·SOX −3.47%는 이미 있던 숫자",
        "score": "pending",
        "note": "일요일. 현물 없음",
        "next": "주간 삼성·닉스 매도 부호가 첫 현금에서 이어지나",
    },
    "2026-08-31-kospi-6788-first-cash.md": {
        "prior": "주간 외인 매도 부호가 첫 현금에서 이어지나",
        "result": "첫 현금 전. 야간선물 세션 없음",
        "score": "pending",
        "note": "08:00 장전. 한 주는 9/5에서 이어 채점",
        "next": "주간 삼성·닉스 매도 부호가 월요일 창구에서 같은가",
    },
}

PLACEHOLDER_RESULT = "해당일 본문에서 확인"


def yaml_escape(value: str) -> str:
    return value.replace('"', '\\"')


def loop_block(fields: dict[str, str]) -> str:
    return (
        "loop:\n"
        f'  prior: "{yaml_escape(fields["prior"])}"\n'
        f'  result: "{yaml_escape(fields["result"])}"\n'
        f'  score: "{fields["score"]}"\n'
        f'  note: "{yaml_escape(fields["note"])}"\n'
        f'  next: "{yaml_escape(fields["next"])}"\n'
    )


def is_guide(text: str) -> bool:
    return bool(re.search(r'^\s*-\s*"교육"', text, re.M))


def is_scorecard(name: str, text: str) -> bool:
    title = re.search(r'^title:\s*"(.*)"', text, re.M)
    return "scorecard" in name or (bool(title) and "채점" in title.group(1))


def compact(text: str, limit: int = 90) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    cut = text[: limit - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut.rstrip(" ,.") + "…"


def theme_fields(text: str, name: str) -> dict[str, str]:
    title = re.search(r'^title:\s*"(.*)"', text, re.M)
    summary = re.search(r'^summary:\s*"(.*)"', text, re.M)
    title_s = title.group(1) if title else name
    summary_s = summary.group(1) if summary else title_s
    question = re.sub(r"^\d{4}년\s*", "", title_s)
    question = re.sub(r"^\d{1,2}/\d{1,2}\s*", "", question)
    question = re.sub(r"^(장중|휴장|장전)[:：]\s*", "", question)
    if question.endswith("?") or question.endswith("인가") or question.endswith("나") or question.endswith("까"):
        pass
    else:
        question = question.rstrip(".다요임") + "인가"
    sentences = [p.strip() for p in re.split(r"(?<=다\.)\s+", summary_s) if p.strip()]
    fact = next((p for p in sentences if re.search(r"\d", p)), sentences[0] if sentences else summary_s)
    guard = re.search(r"가드레일[:：]\s*([^.]+\.)", summary_s)
    nxt = guard.group(1).strip() if guard else (sentences[1] if len(sentences) > 1 else sentences[0] if sentences else summary_s)
    return {
        "prior": compact(question, 80),
        "result": compact(fact, 100),
        "score": "pending",
        "note": "당일 기록. 이후 세션으로 채점하지 않음",
        "next": compact(nxt, 100),
    }


def replace_loop(text: str, fields: dict[str, str]) -> str:
    block = loop_block(fields)
    if LOOP_RE.search(text):
        return LOOP_RE.sub(block, text, count=1)
    raise SystemExit("missing loop block")


def main() -> None:
    curated = 0
    polished = 0
    skipped = 0
    for path in sorted(ROOT.glob("*.md")):
        text = path.read_text()
        if is_guide(text):
            skipped += 1
            continue
        if path.name in AUGUST:
            path.write_text(replace_loop(text, AUGUST[path.name]))
            curated += 1
            continue
        if is_scorecard(path.name, text):
            skipped += 1
            continue
        note = re.search(r'^  note:\s*"(.*)"', text, re.M)
        result = re.search(r'^  result:\s*"(.*)"', text, re.M)
        thin = bool(result and result.group(1) == PLACEHOLDER_RESULT) or bool(
            note and note.group(1) == "당일 기록. 이후 세션으로 채점하지 않음"
        )
        if not thin:
            skipped += 1
            continue
        path.write_text(replace_loop(text, theme_fields(text, path.name)))
        polished += 1
    print(f"august={curated} themes={polished} skipped={skipped}")


if __name__ == "__main__":
    main()
