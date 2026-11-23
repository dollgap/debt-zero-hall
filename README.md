# ⚡ ZEROED — GLOBAL HONOR LEDGER

**Wealth is measured in zeros. Greatness is measured in the debts you zero.**

돈은 숫자로 남지만, 누군가의 빚을 0으로 만든 순간은 전설이 됩니다. 후원금 100%로 한 사람의
빚을 지우고, 그 이름이 글로벌 명예의 전당에 영구 등재되는 구조를 체험하는
**인터랙티브 컨셉 프로토타입**입니다.

- 라이브: https://dollgap.github.io/debt-zero-hall/
- 순수 HTML5 + CSS3 + Vanilla JS (빌드 도구 없음)
- **KOR / ENG 이중언어**: 헤더 토글, `?lang=en` 진입, `localStorage`(`zeroed:lang`) 기억
- PWA: `manifest.webmanifest` + `sw.js`(캐시 `zeroed-shell-v3`) 오프라인 캐싱
- 모든 인물·기관·금액은 **가상 예시**이며, 실제 결제·송금·개인정보 수집은 없습니다.

## 화면

| 탭 | 내용 |
| --- | --- |
| 🏛️ Honor Wall (명예의 전당) | 대리석·황금 명패 10개, 필터(전체/기업/개인/최근), 디지털 명예 인증서(`ZRD-2026-…`) |
| 💳 Relief Board (탕감 보드) | 공익기관 확인 배지, 사연 8건, “Zero This Debt” 체험 후 ZERO 연출·명패 등재(`localStorage` 유지) |
| 💼 Business Model (수익 모델) | 슬라이더 3종 수익 시뮬레이터, 자금 흐름, 위험/현실 모델 비교, 참여 이유 |

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
assets/js/app.js       # 상태·렌더링·상호작용·언어 전환
assets/icons/          # PWA 아이콘 (ZEROED 볼트)
manifest.webmanifest
sw.js
```

## 로컬 실행

```bash
python3 -m http.server 8080
# http://localhost:8080  ·  http://localhost:8080/?lang=en
```

## 주의

이 프로토타입은 사업 구조 설명용 시뮬레이션이며 법률·투자 자문이 아닙니다.
실제 서비스에는 기부금품 모집·전자금융·개인정보·세무 검토가 선행되어야 합니다.
