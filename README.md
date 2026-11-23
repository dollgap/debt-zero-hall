# ZEROED — THE PRIVATE HONOR LEDGER

**가진 것을 넘어, 남기는 품격으로.**
**Beyond Fortune. Pure Legacy.**

삶에서 지워 준 빚의 무게만큼, 당신의 이름이 아너스 명예의 전당에 영구히 남는 구조를 체험하는
**인터랙티브 컨셉 프로토타입**입니다. 후원금 100%로 한 사람의 빚을 지우고, 그 이름이
프라이빗 아너 레저에 영구 등재되는 흐름을 3개 탭으로 보여줍니다.

- 라이브: https://dollgap.github.io/debt-zero-hall/
- 순수 HTML5 + CSS3 + Vanilla JS (빌드 도구 없음)
- **브랜드 마크**: `assets/img/logo-monogram.png` — Z의 대각선이 O를 가르는 브러시드 골드 모노그램.
  헤더·히어로 엠블럼·PWA 아이콘·명예 카드 PNG에 모두 사용하며, `assets/icons/favicon.svg`는 같은
  기하학의 골드 SVG입니다.
- **서체**: Cinzel · Cormorant Garamond · Noto Serif KR (Google Fonts) + 시스템 명조 폴백.
  UI 본문은 Pretendard.
- **KOR / ENG 이중언어**: 헤더 토글, `?lang=en` 진입, `localStorage`(`zeroed:lang`) 기억
- PWA: `manifest.webmanifest` + `sw.js`(캐시 `zeroed-shell-v4`) 오프라인 캐싱
- 모든 인물·기관·금액은 **가상 예시**이며, 실제 결제·송금·개인정보 수집은 없습니다.

## 화면

| 탭 | 내용 |
| --- | --- |
| 🏛️ Honor Wall (명예의 전당) | 황금 명패 10개, 필터(전체/기업/개인/최근), 명예 등급 범례, 디지털 명예 인증서(`ZRD-2026-…`) |
| 💳 Relief Board (탕감 보드) | 공익기관 확인 배지, 사연 8건, “대신 갚아주기” 체험 후 ZERO 연출·명패 등재(`localStorage` 유지) |
| 💼 Business Model (수익 모델) | 슬라이더 3종 수익 시뮬레이터, 자금 흐름, 위험/현실 모델 비교, 참여 이유 |

## 명예 등급 (Honor Tier)

누적 탕감 금액으로 등급이 정해지며, 명패 카드와 인증서 모달에 배지로 표시됩니다.

| 등급 | 기준 |
| --- | --- |
| SOVEREIGN | 10억 원 / $750K 이상 |
| PATRON | 1억 원 / $75K 이상 |
| LAUREATE | 1,000만 원 / $7.5K 이상 |
| HONOR | 그 외 |

## 명예 카드 PNG

인증서 모달의 **`🖼️ 명예 카드 저장 (PNG)`** 버튼은 `<canvas>` 1200×750으로
다크 옵시디언 · 브러시드 골드 헤어라인 · 모노그램 · 등급 배지 · 이름 · 탕감 금액 ·
한마디 · 시리얼 · 골드 인장을 그려 `ZEROED_Honor_Card_{serial}.png`로 즉시 저장합니다.
카드는 브라우저 안에서만 그려지고 어디에도 전송되지 않으며, 하단에
`PROTOTYPE HONOR CARD · DEMO ONLY`를 작게 표기합니다.

## 언어

- 기본값 `ko`. `?lang=en`으로 진입하면 즉시 영문 모드.
- 우측 상단 `KOR | ENG` 토글로 전환하면 URL(`?lang=`)과 `localStorage`에 함께 저장됩니다.
- 금액은 모드별로 표기 단위가 바뀝니다(원화 ↔ 달러 환산, 예: `1,284억 6,000만원` ↔ `$94.8M`).

## 구조

```
index.html
assets/css/styles.css
assets/js/data.js      # 예시 데이터 (국·영문 필드)
assets/js/i18n.js      # UI 문구 사전 (ko / en)
assets/js/app.js       # 상태·렌더링·상호작용·언어 전환·명예 카드 캔버스
assets/img/            # Z·Ø 모노그램 (투명 PNG)
assets/icons/          # PWA 아이콘 · 골드 SVG 파비콘
manifest.webmanifest
sw.js
make_icons.py          # 모노그램 → PWA 아이콘 생성
```

## 로컬 실행

```bash
python3 -m http.server 8080
# http://localhost:8080  ·  http://localhost:8080/?lang=en
python3 make_icons.py   # 아이콘 재생성 (모노그램 교체 시)
```

## 주의

이 프로토타입은 사업 구조 설명용 시뮬레이션이며 법률·투자 자문이 아닙니다.
실제 서비스에는 기부금품 모집·전자금융·개인정보·세무 검토가 선행되어야 합니다.
