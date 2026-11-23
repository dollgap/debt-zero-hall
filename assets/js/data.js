/* ZEROED — GLOBAL HONOR LEDGER · DEMO DATA
   Every person, organization and amount is fictional. No real payments or transfers. */
(function (global) {
  'use strict';

  var BASE = {
    totalRelief: 128460000000,   // cumulative debt zeroed, KRW (demo)
    households: 38412,           // households given a fresh start (demo)
    sponsors: 1247               // honor members · sponsors (demo)
  };

  // KRW → USD rate used only for the English display (fixed demo rate)
  var USD_RATE = 1355;

  // Honor Wall plaques (sorted by amount in the app)
  var SPONSORS = [
    {
      id: 's1', type: 'corp',
      name: '한빛그룹', nameEn: 'Hanbit Group',
      title: '그룹 ESG 위원회', titleEn: 'Group ESG Committee',
      amount: 4820000000, count: 1284, joined: '2026-03-04',
      message: '한 사람의 빚이 다음 세대로 넘어가지 않기를 바랍니다.',
      messageEn: 'We hope one person\u2019s debt never passes to the next generation.',
      badge: '공익신탁 연동', badgeEn: 'Public Trust',
      badge2: '신용회복 연동', badge2En: 'Credit Recovery'
    },
    {
      id: 's2', type: 'corp',
      name: '서연재단', nameEn: 'Seoyeon Foundation',
      title: '공익사업본부', titleEn: 'Public Programs Division',
      amount: 3150000000, count: 902, joined: '2026-03-19',
      message: '빚은 숫자일 뿐, 사람의 하루를 끝내지는 못합니다.',
      messageEn: 'Debt is only a number. It should never end someone\u2019s day.',
      badge: '공익재단 연동', badgeEn: 'Public Foundation'
    },
    {
      id: 's3', type: 'person',
      name: '정우석', nameEn: 'Jung Woo-seok',
      title: '개인 고액기부자 · 前 제조업', titleEn: 'Major individual donor · former manufacturing',
      amount: 2500000000, count: 611, joined: '2026-02-11',
      message: '저도 빚 때문에 밤을 새운 적이 있습니다. 이제는 제가 갚아드립니다.',
      messageEn: 'I have lost nights to debt too. Now I pay it down for someone else.',
      badge: '신용회복 연동', badgeEn: 'Credit Recovery'
    },
    {
      id: 's4', type: 'corp',
      name: '밴스 패밀리오피스', nameEn: 'Vance Family Office',
      title: '패밀리오피스 파트너스', titleEn: 'Family office partners',
      amount: 1873000000, count: 488, joined: '2026-05-08',
      message: '품격은 남의 어려움을 조용히 덜어주는 데서 완성됩니다.',
      messageEn: 'Dignity is completed by quietly lifting another person\u2019s burden.',
      badge: '법률구조 연동', badgeEn: 'Legal Aid'
    },
    {
      id: 's5', type: 'person',
      name: '엘레나 로스토바', nameEn: 'Elena Rostova',
      title: '개인 고액기부자 · 작가', titleEn: 'Major individual donor · author',
      amount: 1200000000, count: 351, joined: '2026-04-02',
      message: '누군가의 마지막 등록금이 되고 싶었습니다.',
      messageEn: 'I wanted to be someone\u2019s last tuition payment.',
      badge: '장학재단 연동', badgeEn: 'Scholarship'
    },
    {
      id: 's6', type: 'corp',
      name: '오름테크', nameEn: 'Oreum Tech',
      title: '테크 기업', titleEn: 'Technology company',
      amount: 940000000, count: 276, joined: '2026-06-15',
      message: '기술은 사람을 기다리게 하지 않아야 합니다.',
      messageEn: 'Technology should never make people wait.',
      badge: '공익신탁 연동', badgeEn: 'Public Trust'
    },
    {
      id: 's7', type: 'corp',
      name: '케스트럴 캐피털', nameEn: 'Kestrel Capital',
      title: '투자 파트너스', titleEn: 'Investment partners',
      amount: 725000000, count: 198, joined: '2026-07-21',
      message: '수익이 한 가정의 새 출발에 닿을 때 가장 값집니다.',
      messageEn: 'Returns mean the most when they reach a household\u2019s fresh start.',
      badge: '공익신탁 연동', badgeEn: 'Public Trust'
    },
    {
      id: 's8', type: 'corp',
      name: '청람장학회', nameEn: 'Cheongram Scholarship Foundation',
      title: '교육 공익재단', titleEn: 'Education foundation',
      amount: 580000000, count: 412, joined: '2026-01-27',
      message: '학자금 때문에 진로를 바꾸는 청년이 없도록.',
      messageEn: 'So that no young person changes course because of tuition.',
      badge: '장학재단 연동', badgeEn: 'Scholarship'
    },
    {
      id: 's9', type: 'person',
      name: '김서현', nameEn: 'Seohyun Kim',
      title: '개인 고액기부자 · 건축가', titleEn: 'Major individual donor · architect',
      amount: 310000000, count: 88, joined: '2026-08-09',
      message: '제가 설계한 집보다 오래 남는 일을 하고 싶었습니다.',
      messageEn: 'I wanted to build something that outlasts the houses I design.',
      badge: '법률구조 연동', badgeEn: 'Legal Aid'
    },
    {
      id: 's10', type: 'corp',
      name: '미래바이오', nameEn: 'Mirae Bio',
      title: '바이오 벤처', titleEn: 'Biotech venture',
      amount: 245000000, count: 71, joined: '2026-09-30',
      message: '첫 캠페인을 이 명패로 시작합니다.',
      messageEn: 'We begin our first campaign with this plaque.',
      badge: '공익신탁 연동', badgeEn: 'Public Trust'
    }
  ];

  // Relief Board cases (raised = amount collected at demo start)
  var CASES = [
    {
      id: 'c1', cat: 'smallbiz', urgency: 'urgent',
      title: '25년 장사를 접은 자영업자의 남은 보증금 채무',
      titleEn: 'A shopkeeper\u2019s remaining deposit debt after 25 years in business',
      story: '가게 문을 닫은 뒤에도 임대 보증금 반환 채무가 남았습니다. 신용회복 지원 대상으로 확인된 사연입니다.',
      storyEn: 'The store closed, but a deposit-repayment debt remained. Verified as eligible for credit-recovery support.',
      org: '신용회복 공익기금 확인(예시)', orgEn: 'Credit Recovery Public Fund (example)',
      household: '1가구 · 자영업 25년', householdEn: '1 household · 25 years in business',
      target: 38000000, raised: 24100000
    },
    {
      id: 'c2', cat: 'smallbiz', urgency: 'urgent',
      title: '전세사기 피해 뒤 시작된 사업자대출 연체',
      titleEn: 'Business-loan arrears that began after a rental-fraud loss',
      story: '보증금을 돌려받지 못한 채 사업자대출 연체가 시작됐습니다. 남은 금액이 적어 조금만 채우면 ZERO에 닿습니다.',
      storyEn: 'The deposit never came back, and business-loan arrears followed. Only a little remains before ZERO.',
      org: '법률구조 공익신탁 확인(예시)', orgEn: 'Legal Aid Public Trust (example)',
      household: '1가구 · 3인 가족', householdEn: '1 household · family of 3',
      target: 21000000, raised: 19400000
    },
    {
      id: 'c3', cat: 'smallbiz', urgency: 'normal',
      title: '재기를 준비하는 청년 창업자의 마지막 카드 채무',
      titleEn: 'A young founder\u2019s last credit-card debt while preparing a comeback',
      story: '폐업 후 재기를 준비하며 남은 카드 채무를 정리하지 못했습니다. 신용회복 상담을 거쳐 확인된 사연입니다.',
      storyEn: 'After closing the business, one card debt went unresolved. Verified through credit-recovery counseling.',
      org: '신용회복 공익기금 확인(예시)', orgEn: 'Credit Recovery Public Fund (example)',
      household: '1가구 · 31세', householdEn: '1 household · age 31',
      target: 9800000, raised: 3200000
    },
    {
      id: 'c4', cat: 'education', urgency: 'normal',
      title: '학자금 대출에 막힌 청년 가장의 복학 등록금',
      titleEn: 'A young breadwinner\u2019s tuition, blocked by student-loan limits',
      story: '휴학 중 대출 한도를 모두 사용해 이번 학기 등록이 불가능해졌습니다. 재단이 소득·재학 사실을 확인했습니다.',
      storyEn: 'Loan limits were exhausted during a leave of absence, making this semester impossible. The foundation verified income and enrollment.',
      org: '청년장학 공익재단 확인(예시)', orgEn: 'Youth Scholarship Foundation (example)',
      household: '1가구 · 28세', householdEn: '1 household · age 28',
      target: 12000000, raised: 7650000
    },
    {
      id: 'c5', cat: 'education', urgency: 'urgent',
      title: '간호학과 편입생의 마지막 학기 등록금',
      titleEn: 'Final-semester tuition for a transfer student in nursing',
      story: '마지막 학기 등록금 640만원. 3주 안에 등록하지 않으면 편입 학기가 소멸합니다.',
      storyEn: 'Final-semester tuition of 6.4 million won. Without enrollment within three weeks, the transfer term lapses.',
      org: '청년장학 공익재단 확인(예시)', orgEn: 'Youth Scholarship Foundation (example)',
      household: '1가구 · 25세', householdEn: '1 household · age 25',
      target: 6400000, raised: 5900000
    },
    {
      id: 'c6', cat: 'education', urgency: 'normal',
      title: '취업 준비생의 자격증 응시료와 교재비',
      titleEn: 'Exam fees and textbooks for a job seeker',
      story: '응시료와 교재비를 모으느라 6개월을 미뤘습니다. 이번 분기 시험에 꼭 응시하고 싶다는 사연입니다.',
      storyEn: 'Six months of delays while saving for fees and books. This quarter\u2019s exam is the one that matters.',
      org: '온누리청년센터 확인(예시)', orgEn: 'Onnuri Youth Center (example)',
      household: '1가구 · 24세', householdEn: '1 household · age 24',
      target: 2400000, raised: 850000
    },
    {
      id: 'c7', cat: 'living', urgency: 'urgent',
      title: '갑작스러운 소득 단절로 밀린 월세와 전기요금',
      titleEn: 'Rent and utility arrears after a sudden loss of income',
      story: '일하던 가게가 문을 닫으면서 두 달치 월세와 전기요금이 밀렸습니다. 퇴거 위기에 놓인 상태로 복지재단이 확인했습니다.',
      storyEn: 'When the shop closed, two months of rent and utilities went unpaid. The family faces eviction; a welfare foundation verified the case.',
      org: '온누리복지재단 확인(예시)', orgEn: 'Onnuri Welfare Foundation (example)',
      household: '1가구 · 2인 가족', householdEn: '1 household · family of 2',
      target: 4800000, raised: 3950000
    },
    {
      id: 'c8', cat: 'living', urgency: 'normal',
      title: '한부모 가정의 겨울 난방·생계비',
      titleEn: 'Winter heating and living costs for a single-parent family',
      story: '아이 둘과 사는 한부모 가정. 겨울 난방비와 두 달치 생계비가 동시에 필요합니다.',
      storyEn: 'A single parent raising two children needs heating and two months of living costs at once.',
      org: '온누리복지재단 확인(예시)', orgEn: 'Onnuri Welfare Foundation (example)',
      household: '1가구 · 3인 가족', householdEn: '1 household · family of 3',
      target: 7200000, raised: 2100000
    }
  ];

  var CATEGORY_LABEL = {
    smallbiz: { ko: '소상공인·재기', en: 'Small Business · Restart' },
    education: { ko: '청년·학자금', en: 'Youth · Student Debt' },
    living: { ko: '긴급 생계·주거', en: 'Emergency Living · Housing' }
  };

  global.ZEROED_DATA = {
    BASE: BASE,
    USD_RATE: USD_RATE,
    SPONSORS: SPONSORS,
    CASES: CASES,
    CATEGORY_LABEL: CATEGORY_LABEL
  };
})(window);
