#!/usr/bin/env python3
"""Insert forecast-loop YAML into market/research posts. Skip 교육 guides."""

from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1] / "src" / "content" / "posts"

CURATED: dict[str, dict[str, str]] = {
    "2026-09-13-kospi-fomc-week-open.md": {
        "prior": "6,909가 물가·유가의 첫 현물인가",
        "result": "휴장. 아직 없음",
        "score": "pending",
        "note": "월요일 초반 30분에 채점",
        "next": "월요일은 금리 주의 첫 거래. 외인이 금요일처럼 같이 팔면 조정 지속",
    },
    "2026-09-12-kospi-6909-cpi-monday.md": {
        "prior": "7,000이 유가·PPI 갭을 첫 현금에서 받는가",
        "result": "금요일 종가 6,909.91(−1.76%). 7,000 반납",
        "score": "hit",
        "note": "갭을 종가에서 받았고 7,000을 내줬다",
        "next": "월요일은 6,909를 CPI·유가 되돌림의 다음 현물로 쓰는가",
    },
    "2026-09-11-kospi-7033-ppi-cpi.md": {
        "prior": "7,051이 만기·ETF 캡 종가에서 남는가",
        "result": "목요일 종가 7,033.92. 7,000선은 닫힘",
        "score": "partial",
        "note": "7,000은 남고 7,051은 반납",
        "next": "금요일 7,000을 유가·PPI 갭이 첫 현금에서 받는가",
    },
    "2026-09-10-kospi-7051-witching-etf.md": {
        "prior": "노동절 현금 6,995가 미국 첫 봉 앞에서 남는가",
        "result": "수요일 종가 7,051.64(+1.40%). 33거래일 만에 7,000 종가",
        "score": "hit",
        "note": "6,995 위 7,000 종가로 닫힘",
        "next": "7,051을 동시만기·반도체 ETF 캡이 같은 종가에서 받는가",
    },
    "2026-09-08-kospi-6995-us-reopen.md": {
        "prior": "주간 외인 매도 부호가 첫 현금에서 열리는가",
        "result": "월요일 종가 6,995.39(+4.61%). 하루 만에 부호 반전",
        "score": "miss",
        "note": "외인 매도 지속 전망은 하루 만에 뒤집힘",
        "next": "6,995를 미국 정규장 개장 전에 현물이 받는가",
    },
    "2026-09-07-kospi-6687-first-cash.md": {
        "prior": "월요일은 한 주의 결정이 아니다",
        "result": "첫 현금. 미국 노동절 휴장, 야간선물 추가 봉 없음",
        "score": "pending",
        "note": "질문은 주간 결정이 아님. 당일 창구로 확인",
        "next": "6,687을 고용 다음이 아닌 노동절 현금으로 여는가",
    },
    "2026-09-06-kospi-expiry-cpi-week.md": {
        "prior": "금요일 6,687이 고용 전 현금인가",
        "result": "휴장. 월요일 현물·미국 노동절",
        "score": "pending",
        "note": "일요일 시점 미채점",
        "next": "월요일은 한 주의 결정이 아니다",
    },
    "2026-09-05-kospi-6687-nfp-labor.md": {
        "prior": "금요일 6,687을 고용 다음 현물로 다시 쓰는가",
        "result": "휴장. 월요일 미국 정규장 휴장",
        "score": "pending",
        "note": "토요일 시점 미채점",
        "next": "6,687은 고용 전 종가. 월요일 1순위는 그 종가를 다시 쓰는지",
    },
    "2026-08-29-korea-jan-may-forecast-scorecard.md": {
        "prior": "코스피 5200·연내 1만·하반기 연준 인하",
        "result": "8/29 종가 6,788. 6월 고점 9,106 아래. 한은 3.00%",
        "score": "partial",
        "note": "방향(슈퍼사이클·인하 종료)은 남고 레벨은 깨짐",
        "next": "레벨보다 달력·조건이 찍힌 문장부터 이어서 채점",
    },
    "2026-08-30-jan-may-calendar-forecast-scorecard.md": {
        "prior": "삼성 37만원·4월 6100·한두 달 1400원·워시 비둘기",
        "result": "37만원은 6/19 장중 한 번. 교보 6100은 5월에 이미 낮음. 종가 6,788.88",
        "score": "miss",
        "note": "기한이 찍힌 문장이 연간 상단보다 먼저 깨짐",
        "next": "이익·수출 숫자 채점으로 이어 읽기",
    },
    "2026-08-31-jan-may-earnings-forecast-scorecard.md": {
        "prior": "삼성 연간 180조·하이닉스 140조·수출 7400억달러",
        "result": "상반기에 이익은 거의 찼고 1~7월 수출 5951억. 종가 6,788.88",
        "score": "partial",
        "note": "이익 레벨은 앞당겨졌고 수출 목표는 낮다",
        "next": "그 이익을 더 높은 금리로 나눈 가격이 유지되는지",
    },
    "2026-09-05-jan-may-flow-fx-scorecard.md": {
        "prior": "WGBI가 주식을 사고 하반기 연준 인하, 원/달러 1350",
        "result": "원/달러 1,350.4. WGBI는 채권. 종가 6,687.21",
        "score": "partial",
        "note": "1350 밴드·상고하저는 남고 주식 매수·인하는 깨짐",
        "next": "1350 위 환율이 반도체 창구를 누르는지",
    },
    "2026-09-06-jan-may-valuation-scorecard.md": {
        "prior": "아시아 신흥 14.5배·5년 평균 10배 리레이팅",
        "result": "12개월 선행 PER 5.19~5.2배. 종가 6,687.21",
        "score": "miss",
        "note": "리레이팅은 오지 않고 지수가 이익보다 먼저 내려왔다",
        "next": "5.2배가 이익 상향으로 열리는지, 할인율로 더 눌리는지",
    },
    "2026-09-07-jan-may-sector-cycle-scorecard.md": {
        "prior": "8월 반도체 정점·비반도체가 지수를 이끈다",
        "result": "8월 수출 467억은 정점 통과 전. 주가 정점은 6/19. 종가 6,687.21",
        "score": "miss",
        "note": "실물 정점은 안 왔고 주가 정점은 이미 지났다",
        "next": "반도체 창구가 지수를 계속 쓰는지",
    },
    "2026-09-08-jan-may-governance-scorecard.md": {
        "prior": "밸류업·상법·자사주로 K디스카운트 종료",
        "result": "법은 통과, 소각·공시는 실행. 종가 6,995.39는 오픈AI 반도체",
        "score": "partial",
        "note": "실행은 남고 종료선언은 성립하지 않음",
        "next": "거버넌스가 시가의 1순위가 되는지 계속 분리",
    },
    "2026-09-09-jan-may-aidc-power-scorecard.md": {
        "prior": "특별법이 국내 전력을 켠다",
        "result": "법 통과·수출 수주는 남고 국내 전력은 2027년. 종가 6,954.52",
        "score": "partial",
        "note": "법과 수주는 맞고 전기 확보는 밀렸다",
        "next": "2027 전력 일정과 수출 수주를 따로 채점",
    },
    "2026-09-10-jan-may-housing-scorecard.md": {
        "prior": "서울 연간 1~5%·강남 주도·전세가 먼저",
        "result": "1~7월 서울 아파트 6.40%. 전세 축소 순서는 남음. 종가 7,051.64",
        "score": "partial",
        "note": "방향·순서는 남고 1~5%와 강남 주도는 7월에 끝남",
        "next": "연간 박스보다 월간 누적을 계속 채점",
    },
    "2026-09-11-jan-may-battery-ess-scorecard.md": {
        "prior": "ESS 믹스·연간 적자·2027년 회복·56만원",
        "result": "ESS 믹스·1분기 바닥은 남고 연간 적자·2027은 7/30에 끝남",
        "score": "partial",
        "note": "믹스는 맞고 목표 연도와 목표가는 깨짐",
        "next": "흑자를 목표가·지수로 환산하지 않고 실적 칸만 보기",
    },
    "2026-09-12-jan-may-defense-scorecard.md": {
        "prior": "루마니아 4조·180만원·파이프라인 60조",
        "result": "잔고 실행은 남고 루마니아·180만원은 4/29에 달력을 잃음. 종가 6,909.91",
        "score": "partial",
        "note": "이미 따 둔 잔고는 남고 신규 대형 수주·목표가는 끝남",
        "next": "잔고 실적과 신규 수주 헤드라인을 분리",
    },
}


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


def first_sentence(summary: str) -> str:
    summary = summary.strip().strip('"')
    parts = re.split(r"(?<=다\.)\s+", summary, maxsplit=1)
    return (parts[0] if parts else summary)[:160]


def default_loop(text: str, name: str) -> dict[str, str]:
    title = re.search(r'^title:\s*"(.*)"', text, re.M)
    summary = re.search(r'^summary:\s*"(.*)"', text, re.M)
    title_s = title.group(1) if title else name
    summary_s = first_sentence(summary.group(1) if summary else title_s)
    return {
        "prior": title_s,
        "result": "해당일 본문에서 확인",
        "score": "pending",
        "note": "당시 기록. 다음 글에서 이어 읽기",
        "next": summary_s,
    }


def insert_loop(text: str, block: str) -> str:
    if re.search(r"^loop:", text, re.M):
        return text
    pattern = re.compile(r"^(draft:\s*(?:true|false)\s*\n)", re.M)
    if not pattern.search(text):
        raise SystemExit("missing draft field")
    return pattern.sub(r"\1" + block, text, count=1)


def main() -> None:
    updated = 0
    skipped = 0
    for path in sorted(ROOT.glob("*.md")):
        text = path.read_text()
        if is_guide(text):
            skipped += 1
            continue
        fields = CURATED.get(path.name) or default_loop(text, path.name)
        new = insert_loop(text, loop_block(fields))
        if new != text:
            path.write_text(new)
            updated += 1
    print(f"updated={updated} skipped_guides={skipped}")


if __name__ == "__main__":
    main()
