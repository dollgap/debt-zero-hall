/* 노블레스 제로 · NOBLESSE ZERO — DEMO DATA
   모든 인물·기관·금액은 가상의 예시입니다. 실제 결제·송금은 없습니다. */
(function (global) {
  'use strict';

  var BASE = {
    totalRelief: 128460000000,   // 누적 탕감 완료 금액 (예시)
    households: 38412,           // 새 출발을 얻은 가구 (예시)
    sponsors: 1247               // 아너스 멤버 · 스폰서 (예시)
  };

  // 명예의 전당 명패 (후원 금액 내림차순 정렬은 앱에서 처리)
  var SPONSORS = [
    {
      id: 's1', type: 'corp', name: '한빛그룹', title: '그룹 ESG 위원회',
      amount: 4820000000, count: 1284, joined: '2026-03-04',
      message: '한 사람의 빚이 다음 세대로 넘어가지 않기를 바랍니다.',
      badge: '공익신탁 연동', badge2: '신용회복 연동'
    },
    {
      id: 's2', type: 'corp', name: '서연재단', title: '공익사업본부',
      amount: 3150000000, count: 902, joined: '2026-03-19',
      message: '빚은 숫자일 뿐, 사람의 하루를 끝내지는 못합니다.',
      badge: '공익재단 연동'
    },
    {
      id: 's3', type: 'person', name: '정우석', title: '개인 고액기부자 · 前 제조업',
      amount: 2500000000, count: 611, joined: '2026-02-11',
      message: '저도 빚 때문에 밤을 새운 적이 있습니다. 이제는 제가 갚아드립니다.',
      badge: '신용회복 연동'
    },
    {
      id: 's4', type: 'corp', name: '대한패밀리오피스', title: '패밀리오피스 파트너스',
      amount: 1873000000, count: 488, joined: '2026-05-08',
      message: '품격은 남의 어려움을 조용히 덜어주는 데서 완성됩니다.',
      badge: '법률구조 연동'
    },
    {
      id: 's5', type: 'person', name: '김서현', title: '개인 고액기부자 · 작가',
      amount: 1200000000, count: 351, joined: '2026-04-02',
      message: '누군가의 마지막 등록금이 되고 싶었습니다.',
      badge: '장학재단 연동'
    },
    {
      id: 's6', type: 'corp', name: '오름테크', title: '테크 기업',
      amount: 940000000, count: 276, joined: '2026-06-15',
      message: '기술은 사람을 기다리게 하지 않아야 합니다.',
      badge: '공익신탁 연동'
    },
    {
      id: 's7', type: 'person', name: '박정민', title: '개인 고액기부자 · 개발자',
      amount: 725000000, count: 198, joined: '2026-07-21',
      message: '월급의 일부가 누군가의 이자를 지우길 바랐습니다.',
      badge: '신용회복 연동'
    },
    {
      id: 's8', type: 'corp', name: '청람장학회', title: '교육 공익재단',
      amount: 580000000, count: 412, joined: '2026-01-27',
      message: '학자금 때문에 진로를 바꾸는 청년이 없도록.',
      badge: '장학재단 연동'
    },
    {
      id: 's9', type: 'person', name: '이하늘', title: '개인 고액기부자 · 자영업',
      amount: 310000000, count: 88, joined: '2026-08-09',
      message: '작은 가게도 누군가의 빚을 지울 수 있습니다.',
      badge: '법률구조 연동'
    },
    {
      id: 's10', type: 'corp', name: '미래바이오', title: '바이오 벤처',
      amount: 245000000, count: 71, joined: '2026-09-30',
      message: '첫 캠페인을 이 명패로 시작합니다.',
      badge: '공익신탁 연동'
    }
  ];

  // 탕감 보드 사연 (raised = 시연 시작 시점의 모인 금액)
  var CASES = [
    {
      id: 'c1', cat: 'smallbiz', urgency: '긴급',
      title: '25년 장사를 접은 자영업자의 남은 보증금 채무',
      story: '가게 문을 닫은 뒤에도 임대 보증금 반환 채무가 남았습니다. 신용회복 지원 대상으로 확인된 사연입니다.',
      org: '신용회복 공익기금 확인(예시)',
      household: '1가구 · 자영업 25년',
      target: 38000000, raised: 24100000
    },
    {
      id: 'c2', cat: 'smallbiz', urgency: '긴급',
      title: '전세사기 피해 뒤 시작된 사업자대출 연체',
      story: '보증금을 돌려받지 못한 채 사업자대출 연체가 시작됐습니다. 남은 금액이 적어 조금만 채우면 ZERO에 닿습니다.',
      org: '법률구조 공익신탁 확인(예시)',
      household: '1가구 · 3인 가족',
      target: 21000000, raised: 19400000
    },
    {
      id: 'c3', cat: 'smallbiz', urgency: '보통',
      title: '재기를 준비하는 청년 창업자의 마지막 카드 채무',
      story: '폐업 후 재기를 준비하며 남은 카드 채무를 정리하지 못했습니다. 신용회복 상담을 거쳐 확인된 사연입니다.',
      org: '신용회복 공익기금 확인(예시)',
      household: '1가구 · 31세',
      target: 9800000, raised: 3200000
    },
    {
      id: 'c4', cat: 'education', urgency: '보통',
      title: '학자금 대출에 막힌 청년 가장의 복학 등록금',
      story: '휴학 중 대출 한도를 모두 사용해 이번 학기 등록이 불가능해졌습니다. 재단이 소득·재학 사실을 확인했습니다.',
      org: '청년장학 공익재단 확인(예시)',
      household: '1가구 · 28세',
      target: 12000000, raised: 7650000
    },
    {
      id: 'c5', cat: 'education', urgency: '긴급',
      title: '간호학과 편입생의 마지막 학기 등록금',
      story: '마지막 학기 등록금 640만원. 3주 안에 등록하지 않으면 편입 학기가 소멸합니다.',
      org: '청년장학 공익재단 확인(예시)',
      household: '1가구 · 25세',
      target: 6400000, raised: 5900000
    },
    {
      id: 'c6', cat: 'education', urgency: '보통',
      title: '취업 준비생의 자격증 응시료와 교재비',
      story: '응시료와 교재비를 모으느라 6개월을 미뤘습니다. 이번 분기 시험에 꼭 응시하고 싶다는 사연입니다.',
      org: '온누리청년센터 확인(예시)',
      household: '1가구 · 24세',
      target: 2400000, raised: 850000
    },
    {
      id: 'c7', cat: 'living', urgency: '긴급',
      title: '갑작스러운 소득 단절로 밀린 월세와 전기요금',
      story: '일하던 가게가 문을 닫으면서 두 달치 월세와 전기요금이 밀렸습니다. 퇴거 위기에 놓인 상태로 복지재단이 확인했습니다.',
      org: '온누리복지재단 확인(예시)',
      household: '1가구 · 2인 가족',
      target: 4800000, raised: 3950000
    },
    {
      id: 'c8', cat: 'living', urgency: '보통',
      title: '한부모 가정의 겨울 난방·생계비',
      story: '아이 둘과 사는 한부모 가정. 겨울 난방비와 두 달치 생계비가 동시에 필요합니다.',
      org: '온누리복지재단 확인(예시)',
      household: '1가구 · 3인 가족',
      target: 7200000, raised: 2100000
    }
  ];

  var CATEGORY_LABEL = {
    smallbiz: '소상공인·재기',
    education: '청년·학자금',
    living: '긴급 생계·주거'
  };

  global.NZ_DATA = {
    BASE: BASE,
    SPONSORS: SPONSORS,
    CASES: CASES,
    CATEGORY_LABEL: CATEGORY_LABEL
  };
})(window);
