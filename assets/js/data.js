/* ZEROED — THE PRIVATE HONOR LEDGER · DEMO DATA
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

  // Open support community · three categories, seed posts (demo)
  var COMMUNITY_CATS = {
    patron: { ko: '후원자 소감', en: 'Patron Notes' },
    gratitude: { ko: '감사 후기', en: 'Gratitude Letters' },
    support: { ko: '자유 응원', en: 'Open Support' }
  };

  var COMMUNITY_POSTS = [
    {
      id: 'cp1', cat: 'support', respect: 37, joined: '2026-11-23T21:40:00+09:00',
      name: '문하늘', nameEn: 'Haneul Moon', tier: '',
      title: '작은 응원 하나 보태고 갑니다',
      titleEn: 'Leaving one small note of support',
      body: '동생이 학자금 때문에 진로를 바꾼 기억이 있습니다. 그때 이런 곳이 있었다면 어땠을까, 자꾸 생각하게 됩니다. 제 글 한 줄이 누군가에게는 오늘의 힘이 되기를 바랍니다. 다들 잘 지내고 계시길.',
      bodyEn: 'My younger sibling once changed course because of tuition. I keep wondering what it would have been like if a place like this had existed then. I hope one line of mine becomes someone’s strength today. I hope you are all doing well.',
      comments: [
        { name: '임소라', nameEn: 'Sora Lim', at: '2026-11-23T22:05:00+09:00',
          body: '저도 같은 마음으로 왔습니다. 오늘 하루도 무사하시길.',
          bodyEn: 'I came with the same heart. May today pass gently for you all.' },
        { name: '김태오', nameEn: 'Taeo Kim', at: '2026-11-23T22:31:00+09:00',
          body: '이런 글을 읽으러 가끔 들릅니다.',
          bodyEn: 'I drop by now and then just to read notes like this.' }
      ]
    },
    {
      id: 'cp2', cat: 'gratitude', respect: 96, joined: '2026-11-23T09:15:00+09:00',
      name: '박○진', nameEn: 'Mrs. Park', tier: '', verified: true,
      title: '25년 만에 처음으로, 아무것도 남지 않은 달력',
      titleEn: 'The first calendar in 25 years with nothing left over',
      body: '가게 문을 닫고 두 해 동안 잔액을 정리했습니다. 마지막 480만원이 지워진 날, 아내와 아이들과 처음으로 저녁을 먹으러 나갔습니다. 동네 국숫집이었는데, 아무도 계산기를 두드리지 않는 저녁이 그렇게 따뜻한 줄 몰랐습니다. 잊지 않겠습니다. 언젠가 제가 그 자리에 서겠습니다.',
      bodyEn: 'After closing the shop I spent two years settling the balance. The day the last 4.8 million won was cleared, I took my wife and children out to dinner for the first time — a small noodle house, no one tapping at a calculator. I did not know an evening could be that warm. I will not forget it. One day I will stand in that place.',
      comments: [
        { name: '한빛그룹 ESG 위원회', nameEn: 'Hanbit Group ESG Committee', at: '2026-11-23T10:02:00+09:00',
          body: '이 저녁이 오래 이어지기를 바랍니다.',
          bodyEn: 'May that evening last a long time.' },
        { name: '김서현', nameEn: 'Seohyun Kim', at: '2026-11-23T11:48:00+09:00',
          body: '잊지 않으신다는 말이 가장 좋았습니다.',
          bodyEn: 'The line about not forgetting stayed with me.' },
        { name: '윤하늘', nameEn: 'Haneul Yoon', at: '2026-11-23T14:20:00+09:00',
          body: '국숫집 저녁, 저도 기억하겠습니다.',
          bodyEn: 'A noodle-house evening — I will remember it too.' }
      ]
    },
    {
      id: 'cp3', cat: 'patron', respect: 128, joined: '2026-11-22T18:05:00+09:00',
      name: '한빛그룹', nameEn: 'Hanbit Group', tier: 'SOVEREIGN',
      title: '매칭 챌린지로 한 해를 마무리하며',
      titleEn: 'Closing the year with a matching challenge',
      body: '올해 세 번째 매칭 챌린지를 마쳤습니다. 임직원 1,200명이 모은 금액에 그룹이 같은 금액을 더해 1,284가정의 마지막 잔액을 지웠습니다. 숫자보다 오래 남는 것은 잔액이 0이 되는 순간의 조용함이라고 믿습니다. 내년에도 같은 자리에서 기다리겠습니다.',
      bodyEn: 'We have completed our third matching challenge of the year. The group matched what 1,200 colleagues gave, clearing the final balance for 1,284 households. What lasts longer than the figure is the quiet of a balance reaching zero. We will be here again next year.',
      comments: [
        { name: '김도윤', nameEn: 'Doyoon Kim', at: '2026-11-22T19:12:00+09:00',
          body: '현장에서 직접 확인하니 숫자가 아니라 사람이 보였습니다. 내년 캠페인에도 함께하겠습니다.',
          bodyEn: 'Seeing it on site, I saw people rather than numbers. Count me in next year’s campaign.' },
        { name: '밴스 패밀리오피스', nameEn: 'Vance Family Office', at: '2026-11-22T20:40:00+09:00',
          body: '같은 자리에서 만나기를 기대합니다.',
          bodyEn: 'We look forward to meeting you in the same place.' }
      ]
    },
    {
      id: 'cp4', cat: 'patron', respect: 212, joined: '2026-11-21T10:30:00+09:00',
      name: '정우석', nameEn: 'Woo-seok Jung', tier: 'PATRON',
      title: '제가 갚은 것이 아니라, 먼저 건네받은 것입니다',
      titleEn: 'I did not repay it first — it was handed to me',
      body: '스물아홉에 사업을 접고 삼 년을 정리했습니다. 그때 누군가 제 잔액을 대신 지워 주지 않았다면 지금의 저는 없습니다. 빚을 지운다는 것은 숫자를 지우는 일이 아니라, 다시 시작할 수 있다고 믿게 하는 일입니다. 이제는 제가 그 자리에 서 있습니다.',
      bodyEn: 'I closed my business at twenty-nine and spent three years settling it. Without someone clearing my balance then, I would not be here. Zeroing a debt is not erasing a number; it is letting someone believe they can begin again. Now I stand in that place.',
      comments: [
        { name: '박세영', nameEn: 'Seyeong Park', at: '2026-11-21T11:26:00+09:00',
          body: '이 문장을 오래 기억하겠습니다.',
          bodyEn: 'I will carry that line for a long time.' },
        { name: '이준호', nameEn: 'Junho Lee', at: '2026-11-21T13:05:00+09:00',
          body: '저도 그 자리에 서고 싶습니다.',
          bodyEn: 'I want to stand in that place as well.' }
      ]
    },
    {
      id: 'cp5', cat: 'support', respect: 41, joined: '2026-11-20T22:10:00+09:00',
      name: '조민재', nameEn: 'Minjae Cho', tier: '',
      title: '이런 곳이 있다는 것만으로도',
      titleEn: 'Just knowing a place like this exists',
      body: '빚 이야기가 유난히 무섭게 들리던 요즘입니다. 이 사이트를 보고 처음으로 그 무게가 조금 가벼워졌습니다. 직접 후원할 수는 없지만, 이 글을 읽는 누군가가 오늘만큼은 덜 외로웠으면 합니다.',
      bodyEn: 'Lately every story about debt sounds frightening. Reading this site made the weight a little lighter for the first time. I cannot sponsor anyone myself, but I hope whoever reads this is less alone today.',
      comments: [
        { name: '서지안', nameEn: 'Jian Seo', at: '2026-11-20T23:02:00+09:00',
          body: '그 마음, 충분히 닿았습니다.',
          bodyEn: 'That heart reached us — it is enough.' }
      ]
    },
    {
      id: 'cp6', cat: 'gratitude', respect: 87, joined: '2026-11-19T08:45:00+09:00',
      name: '최○민', nameEn: 'Choi M.', tier: '', verified: true,
      title: '복학 신청서를 냈습니다',
      titleEn: 'I filed my readmission papers',
      body: '세 학기 동안 휴학이 길어졌습니다. 등록금 잔액이 지워진 뒤 복학 신청서를 냈고, 이번 주에 승인 문자가 왔습니다. 교수님께 “다시 왔네요”라는 말을 들었을 때, 그냥 울었습니다. 응원해 주신 분들께 꼭 알려드리고 싶었습니다.',
      bodyEn: 'My leave of absence stretched to three semesters. Once the tuition balance was cleared I filed my readmission, and the approval message arrived this week. When my professor said “you’re back”, I simply cried. I wanted to tell everyone who rooted for me.',
      comments: [
        { name: '청람장학회', nameEn: 'Cheongram Scholarship Foundation', at: '2026-11-19T09:30:00+09:00',
          body: '승인 소식 축하드립니다. 마지막 학기까지 함께하겠습니다.',
          bodyEn: 'Congratulations on the approval. We will be with you through the final semester.' },
        { name: '김도윤', nameEn: 'Doyoon Kim', at: '2026-11-19T12:14:00+09:00',
          body: '울었다는 문장에서 저도 잠시 멈췄습니다.',
          bodyEn: 'I paused at the sentence about crying.' }
      ]
    },
    {
      id: 'cp7', cat: 'patron', respect: 73, joined: '2026-11-18T14:20:00+09:00',
      name: '밴스 패밀리오피스', nameEn: 'Vance Family Office', tier: 'PATRON',
      title: '패밀리오피스가 이 캠페인에 서는 이유',
      titleEn: 'Why our family office stands with this campaign',
      body: '다음 세대에 물려줄 것은 잔고가 아니라 판단의 기준이라고 생각합니다. ZEROED는 그 기준을 가장 조용한 방식으로 보여줍니다. 후원금에서 한 푼도 떼지 않는 구조, 기관이 직접 확인하는 절차 — 이것이 저희가 세 번 연속 참여한 이유입니다.',
      bodyEn: 'What we pass to the next generation is not a balance but a standard of judgment. ZEROED shows that standard in the quietest way: a structure that takes nothing from donations, and a process partner institutions verify themselves. That is why we have joined three times.',
      comments: [
        { name: '정우석', nameEn: 'Woo-seok Jung', at: '2026-11-18T15:40:00+09:00',
          body: '판단의 기준, 좋은 표현입니다.',
          bodyEn: '“A standard of judgment” — well put.' },
        { name: '케스트럴 캐피털', nameEn: 'Kestrel Capital', at: '2026-11-18T17:02:00+09:00',
          body: '저희도 같은 이유로 참여합니다.',
          bodyEn: 'We join for the same reason.' }
      ]
    }
  ];

  global.ZEROED_DATA = {
    BASE: BASE,
    USD_RATE: USD_RATE,
    SPONSORS: SPONSORS,
    CASES: CASES,
    CATEGORY_LABEL: CATEGORY_LABEL,
    COMMUNITY_CATS: COMMUNITY_CATS,
    COMMUNITY_POSTS: COMMUNITY_POSTS
  };
})(window);
