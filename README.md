# 노블레스 제로 · NOBLESSE ZERO

**진짜 부의 완성은, 남의 빚을 지우는 품격입니다.** 기업 오너·자산가의 후원이 100% 그대로
채무자의 빚을 지우고, 그 이름이 아너스 명예의 전당에 영구 등재되는 구조를 체험하는
**인터랙티브 컨셉 프로토타입**입니다.

- 라이브: https://dollgap.github.io/debt-zero-hall/
- 순수 HTML5 + CSS3 + Vanilla JS (빌드 도구 없음)
- PWA: `manifest.webmanifest` + `sw.js` 오프라인 캐싱, 홈 화면 추가 지원
- 모든 인물·기관·금액은 **가상 예시**이며, 실제 결제·송금·개인정보 수집은 없습니다.

## 화면

| 탭 | 내용 |
| --- | --- |
| 🏛️ 명예의 전당 | 대리석·황금 명패 카드, 필터(전체/기업/개인/최근 참여), 디지털 명예 인증서 모달(`NZ-2026-…`) |
| 💳 탕감 보드 | 공익기관 확인 배지, 사연별 목표·잔액·달성률, “대신 갚아주기 체험” 후 ZERO 연출·명패 등재(`localStorage` 유지) |
| 💼 수익 모델 | 슬라이더 3종 수익 시뮬레이터, 자금 흐름, 위험/현실 모델 비교, 아너스 참여 이유 |

## 구조

```
index.html
assets/css/styles.css
assets/js/data.js      # 예시 데이터
assets/js/app.js       # 상태·렌더링·상호작용
assets/icons/          # PWA 아이콘
manifest.webmanifest
sw.js
```

## 로컬 실행

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## 주의

이 프로토타입은 사업 구조 설명용 시뮬레이션이며 법률·투자 자문이 아닙니다.
실제 서비스에는 기부금품 모집·전자금융·개인정보·세무 검토가 선행되어야 합니다.
