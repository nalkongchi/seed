// ============================================================
// data.js - 종자검사원 문제 데이터 (v15)
// 스테이지 1,2,3,4,6은 규격 기반 랜덤 생성형으로 재구성했습니다.
// 스테이지 5는 기존 고정 문제를 유지합니다.
// ============================================================

var NODES = [
  {
    "id": 0,
    "label": "새싹의\n들판",
    "emoji": "",
    "enemy": "수상한 씨앗지기",
    "enemyEmoji": "",
    "enemyImage": "images/enemy_01.png",
    "enemySprite": "images/enemy_01_dot.png",
    "desc": "씨앗지기가 수확물을 통과시켜 달라고 요구한다.",
    "maxHp": 3,
    "type": "normal",
    "x": 195,
    "y": 638,
    "bossLine": null,
    "questions": []
  },
  {
    "id": 1,
    "label": "황금 물결\n평원",
    "emoji": "",
    "enemy": "황금들판의 장로",
    "enemyEmoji": "",
    "enemyImage": "images/enemy_02.png",
    "enemySprite": "images/enemy_02_dot.png",
    "desc": "황금들판의 장로가 풍요의 수확을 인정해 달라고 요구한다...",
    "maxHp": 3,
    "type": "normal",
    "x": 195,
    "y": 533,
    "bossLine": null,
    "questions": []
  },
  {
    "id": 2,
    "label": "혼돈의\n연금실",
    "emoji": "",
    "enemy": "혼합의 연금술사",
    "enemyEmoji": "",
    "enemyImage": "images/enemy_03.png",
    "enemySprite": "images/enemy_03_dot.png",
    "desc": "연금술사가 뒤섞인 시료로 당신의 판정을 흐리려 한다...",
    "maxHp": 3,
    "type": "normal",
    "x": 195,
    "y": 428,
    "bossLine": null,
    "questions": []
  },
  {
    "id": 3,
    "label": "혈통의\n성소",
    "emoji": "",
    "enemy": "순계의 수호자",
    "enemyEmoji": "",
    "enemyImage": "images/enemy_04.png",
    "enemySprite": "images/enemy_04_dot.png",
    "desc": "순수한 혈통의 기준을 증명할 수 있는지 시험받게 된다...",
    "maxHp": 5,
    "type": "normal",
    "x": 195,
    "y": 323,
    "bossLine": null,
    "questions": []
  },
  {
    "id": 4,
    "label": "규율의\n협곡",
    "emoji": "",
    "enemy": "규율의 감시자",
    "enemyEmoji": "",
    "enemyImage": "images/enemy_05.png",
    "enemySprite": "images/enemy_05_dot.png",
    "desc": "조심해! 규율의 감시자가 당신의 판정을 지켜보고 있다!",
    "maxHp": 5,
    "type": "normal",
    "x": 195,
    "y": 210,
    "bossLine": null,
    "questions": [
      {
        "text": "\"검사 유효기간이 어제 만료됐어요. 보관 상태가 완벽한데 유효하지 않나요?\"",
        "answer": "fail",
        "reason": "검사 유효기간이 경과한 종자는 재검사 없이 합격 처리가 불가합니다."
      },
      {
        "text": "\"지난해 합격 종자인데, 올해 재검사 없이 유통해도 되죠?\"",
        "answer": "fail",
        "reason": "유효기간 내라도 재검사 규정이 있으면 따라야 합니다. 임의 유통은 법령 위반입니다."
      },
      {
        "text": "\"검사 성적서에 수분 함량을 잘못 기재했어요. 실제 수치는 기준 이내예요. 괜찮죠?\"",
        "answer": "fail",
        "reason": "검사 성적서의 오기재는 행정상 하자입니다. 실제 수치와 무관하게 재발급이 필요합니다."
      },
      {
        "text": "\"종자관리사가 현장에 없었지만 검사는 진행했어요. 결과는 정상이에요.\"",
        "answer": "fail",
        "reason": "검사는 자격을 갖춘 종자관리사가 실시해야 합니다. 절차 위반으로 검사 결과가 무효입니다."
      },
      {
        "text": "\"검사 기록부를 3년간 보관했어요. 법령상 보관 기간 충족이죠?\"",
        "answer": "pass",
        "reason": "종자 검사 기록부 보관 기간 기준을 충족합니다. 적합합니다."
      },
      {
        "text": "\"원산지를 국내산으로 정확히 표기했고 품질 기준도 다 충족했어요.\"",
        "answer": "pass",
        "reason": "원산지 표기 정확, 품질 기준 충족. 법령상 문제 없습니다. 합격입니다."
      },
      {
        "text": "\"반올림하면 기준치 이내인데, 감사에서 문제가 될까요?\"",
        "answer": "fail",
        "reason": "기준 수치는 반올림을 적용하지 않습니다. 감사 시 기준 초과로 지적 대상이 됩니다."
      }
    ]
  },
  {
    "id": 5,
    "label": "심판의 성",
    "emoji": "",
    "enemy": "기준왜곡 대심판관",
    "enemyEmoji": "",
    "enemyImage": "images/enemy_06.png",
    "enemySprite": "images/enemy_06_dot.png",
    "desc": "최후의 심판이 시작된다. 왜곡된 기준을 바로잡아라!",
    "maxHp": 7,
    "type": "boss",
    "x": 195,
    "y": 90,
    "bossLine": "진정한 검사원인지... 마지막으로 시험하겠다. 모든 기준을 꿰뚫어 보아라!",
    "bossOpenIcon": "images/node_06_open.png",
    "bossClearIcon": "images/node_06_clear.png",
    "questions": []
  }
];

(function seedQuestionFactory() {
  const GENERATOR_CONFIG = {
    1: { count: 14, metricsPerQuestion: 1, passChance: 0.56 },
    2: { count: 16, metricsPerQuestion: 3, passChance: 0.55 },
    3: { count: 16, metricsPerQuestion: 3, passChance: 0.52 },
    4: { count: 16, metricsPerQuestion: 3, passChance: 0.50 },
    6: { count: 18, metricsPerQuestion: 5, passChance: 0.46 }
  };

  const DIFFICULTY_PICK = {
    1: { easy: 8, medium: 3, hard: 1 },
    2: { easy: 6, medium: 4, hard: 2 },
    3: { easy: 3, medium: 5, hard: 4 },
    4: { easy: 2, medium: 4, hard: 6 },
    6: { easy: 1, medium: 4, hard: 7 }
  };

  const FAIL_WEIGHTS = {
    1: { easy: 5, medium: 3, hard: 2 },
    2: { easy: 4, medium: 4, hard: 3 },
    3: { easy: 2, medium: 5, hard: 5 },
    4: { easy: 1, medium: 4, hard: 6 },
    6: { easy: 0.5, medium: 4, hard: 8 }
  };

  const STORY_TEMPLATES = {
    1: [
      '{prefix}. {values}예요. 이 정도면 괜찮죠?',
      '{prefix}. {values}인데요, 한번 봐주세요~',
      '{prefix}. {values}예요. 맞게 가져온 것 같은데요?'
    ],
    2: [
      '{prefix}. 정성껏 골라온 물량이에요. {values}예요. 한번 봐주세요.',
      '{prefix}. 이번 건 꽤 잘 나온 편이에요~ {values}예요. 어떠세요?',
      '{prefix}. 상태는 꽤 안정적인 것 같은데요~ {values}예요.'
    ],
    3: [
      '{prefix}. 꽤 그럴듯하지? {values}야. 어디 판정해 봐.',
      '{prefix}. 이번 건 제법 괜찮아 보여. {values}야.',
      '{prefix}. 정성은 충분히 들였어. {values}다.'
    ],
    4: [
      '{prefix}. 기준에 맞춰 정리했어. {values}다. 확인해 봐.',
      '{prefix}. 이 정도면 빠질 데 없지. {values}야.',
      '{prefix}. 수치는 충분히 보여줬어. {values}다.'
    ],
    6: [
      '{prefix}. 숫자는 다 보여줬다. {values}다. 자, 판정해 봐.',
      '{prefix}. 이 정도 수치면 쉽게 말하긴 어렵겠지. {values}다.',
      '{prefix}. 전부 확인하고도 같은 판정을 내릴 수 있겠나? {values}다.'
    ]
  };

  function metric(label, type, threshold, format, range, difficulty, unit = '%', opts = {}) {
    return Object.assign({ label, type, threshold, format, range, difficulty, unit }, opts);
  }

  const PROFILES = [
    { id:'rice_supply_seed', examType:'종자검사', label:'벼 보급종', stages:[1,2,3], metrics:[
      metric('발아율','min',85,'int',[75,99],'easy'),
      metric('정립','min',98.0,'decimal1',[96.0,99.9],'easy'),
      metric('수분','max',14.0,'decimal1',[10.5,16.0],'easy'),
      metric('이품종','max',0.10,'decimal2',[0.00,0.35],'hard'),
      metric('이종종자','max',0.05,'decimal2',[0.00,0.20],'hard'),
      metric('기타해초','max',0.10,'decimal2',[0.00,0.20],'medium'),
      metric('잡초종자계','max',0.20,'decimal2',[0.00,0.35],'medium'),
      metric('피해립','max',3.0,'decimal1',[0.5,6.5],'medium'),
      metric('특정병','max',5.0,'decimal1',[0.0,7.5],'hard'),
      metric('기타병','max',10.0,'decimal1',[0.0,16.0],'medium'),
      metric('이물','max',2.0,'decimal1',[0.0,3.4],'medium'),
      metric('메성배유개체출현율','max',0.6,'decimal1',[0.0,1.1],'hard')
    ]},
    { id:'barley_supply_seed', examType:'종자검사', label:'겉보리 보급종', stages:[1,2,3], metrics:[
      metric('발아율','min',85,'int',[75,99],'easy'),
      metric('정립','min',98.0,'decimal1',[96.0,99.9],'easy'),
      metric('수분','max',14.0,'decimal1',[10.5,16.0],'easy'),
      metric('이품종','max',0.20,'decimal2',[0.00,0.45],'hard'),
      metric('이종종자','max',0.20,'decimal2',[0.00,0.45],'hard'),
      metric('기타해초','max',0.10,'decimal2',[0.00,0.20],'medium'),
      metric('잡초종자계','max',0.20,'decimal2',[0.00,0.35],'medium'),
      metric('피해립','max',5.0,'decimal1',[0.5,7.0],'medium'),
      metric('특정병','max',4.0,'decimal1',[0.0,6.0],'hard'),
      metric('기타병','max',10.0,'decimal1',[0.0,16.0],'medium'),
      metric('이물','max',2.0,'decimal1',[0.0,3.2],'medium'),
      metric('메성배유개체출현율','max',0.6,'decimal1',[0.0,1.1],'hard')
    ]},
    { id:'wheat_supply_seed', examType:'종자검사', label:'밀 보급종', stages:[1,2,3], metrics:[
      metric('발아율','min',85,'int',[75,99],'easy'),
      metric('정립','min',98.0,'decimal1',[96.0,99.9],'easy'),
      metric('수분','max',12.0,'decimal1',[9.5,14.5],'easy'),
      metric('이품종','max',0.20,'decimal2',[0.00,0.45],'hard'),
      metric('이종종자','max',0.10,'decimal2',[0.00,0.25],'hard'),
      metric('기타해초','max',0.10,'decimal2',[0.00,0.20],'medium'),
      metric('잡초종자계','max',0.20,'decimal2',[0.00,0.35],'medium'),
      metric('피해립','max',5.0,'decimal1',[0.5,7.0],'medium'),
      metric('특정병','max',0.2,'decimal2',[0.00,0.45],'hard'),
      metric('기타병','max',10.0,'decimal1',[0.0,16.0],'medium'),
      metric('이물','max',2.0,'decimal1',[0.0,3.2],'medium')
    ]},
    { id:'soy_supply_seed', examType:'종자검사', label:'콩 보급종', stages:[1,2,3], metrics:[
      metric('발아율','min',85,'int',[75,99],'easy'),
      metric('정립','min',98.0,'decimal1',[96.0,99.9],'easy'),
      metric('수분','max',14.0,'decimal1',[10.5,16.0],'easy'),
      metric('이품종','max',0.50,'decimal2',[0.00,0.90],'hard'),
      metric('이종종자','max',0.10,'decimal2',[0.00,0.25],'hard'),
      metric('잡초종자계','max',0.05,'decimal2',[0.00,0.15],'medium'),
      metric('피해립','max',5.0,'decimal1',[0.5,7.0],'medium'),
      metric('특정병','max',5.0,'decimal1',[0.0,7.5],'hard'),
      metric('기타병','max',10.0,'decimal1',[0.0,16.0],'medium'),
      metric('이물','max',2.0,'decimal1',[0.0,3.2],'medium')
    ]},
    { id:'rice_foundation_seed', examType:'종자검사', label:'벼 원종', stages:[3,4,6], metrics:[
      metric('발아율','min',85,'int',[76,99],'easy'),
      metric('정립','min',99.0,'decimal1',[97.0,99.9],'easy'),
      metric('수분','max',14.0,'decimal1',[10.5,16.0],'easy'),
      metric('이품종','max',0.05,'decimal2',[0.00,0.18],'hard'),
      metric('이종종자','max',0.03,'decimal2',[0.00,0.15],'hard'),
      metric('기타해초','max',0.10,'decimal2',[0.00,0.18],'medium'),
      metric('잡초종자계','max',0.10,'decimal2',[0.00,0.20],'medium'),
      metric('피해립','max',3.0,'decimal1',[0.5,5.5],'medium'),
      metric('특정병','max',5.0,'decimal1',[0.0,7.0],'hard'),
      metric('기타병','max',10.0,'decimal1',[0.0,15.0],'medium'),
      metric('이물','max',1.0,'decimal1',[0.0,2.5],'medium'),
      metric('메성배유개체출현율','max',0.4,'decimal1',[0.0,0.9],'hard')
    ]},
    { id:'rice_breeder_seed', examType:'종자검사', label:'벼 원원종', stages:[4,6], metrics:[
      metric('발아율','min',85,'int',[78,99],'easy'),
      metric('정립','min',99.0,'decimal1',[97.5,99.9],'easy'),
      metric('수분','max',14.0,'decimal1',[10.5,15.5],'easy'),
      metric('이품종','max',0.02,'decimal2',[0.00,0.10],'hard'),
      metric('이종종자','max',0.02,'decimal2',[0.00,0.10],'hard'),
      metric('기타해초','max',0.03,'decimal2',[0.00,0.12],'medium'),
      metric('잡초종자계','max',0.05,'decimal2',[0.00,0.12],'medium'),
      metric('피해립','max',2.0,'decimal1',[0.0,4.0],'medium'),
      metric('특정병','max',2.0,'decimal1',[0.0,4.5],'hard'),
      metric('기타병','max',5.0,'decimal1',[0.0,10.0],'medium'),
      metric('이물','max',1.0,'decimal1',[0.0,2.0],'medium'),
      metric('메성배유개체출현율','max',0.2,'decimal1',[0.0,0.6],'hard')
    ]},
    { id:'wheat_foundation_seed', examType:'종자검사', label:'밀 원종', stages:[4,6], metrics:[
      metric('발아율','min',85,'int',[78,99],'easy'),
      metric('정립','min',99.0,'decimal1',[97.0,99.9],'easy'),
      metric('수분','max',12.0,'decimal1',[9.5,14.0],'easy'),
      metric('이품종','max',0.10,'decimal2',[0.00,0.30],'hard'),
      metric('이종종자','max',0.06,'decimal2',[0.00,0.18],'hard'),
      metric('기타해초','max',0.05,'decimal2',[0.00,0.15],'medium'),
      metric('잡초종자계','max',0.10,'decimal2',[0.00,0.20],'medium'),
      metric('피해립','max',3.0,'decimal1',[0.0,5.0],'medium'),
      metric('특정병','max',0.10,'decimal2',[0.00,0.30],'hard'),
      metric('기타병','max',10.0,'decimal1',[0.0,15.0],'medium'),
      metric('이물','max',1.0,'decimal1',[0.0,2.4],'medium')
    ]},
    { id:'barley_foundation_seed', examType:'종자검사', label:'겉보리 원종', stages:[4,6], metrics:[
      metric('발아율','min',85,'int',[78,99],'easy'),
      metric('정립','min',99.0,'decimal1',[97.0,99.9],'easy'),
      metric('수분','max',14.0,'decimal1',[10.5,15.8],'easy'),
      metric('이품종','max',0.10,'decimal2',[0.00,0.25],'hard'),
      metric('이종종자','max',0.12,'decimal2',[0.00,0.28],'hard'),
      metric('기타해초','max',0.05,'decimal2',[0.00,0.15],'medium'),
      metric('잡초종자계','max',0.10,'decimal2',[0.00,0.22],'medium'),
      metric('피해립','max',3.0,'decimal1',[0.0,5.5],'medium'),
      metric('특정병','max',2.0,'decimal1',[0.0,4.5],'hard'),
      metric('기타병','max',10.0,'decimal1',[0.0,15.0],'medium'),
      metric('이물','max',1.0,'decimal1',[0.0,2.4],'medium'),
      metric('메성배유개체출현율','max',0.4,'decimal1',[0.0,0.9],'hard')
    ]},
    { id:'soy_foundation_seed', examType:'종자검사', label:'콩 원종', stages:[4,6], metrics:[
      metric('발아율','min',85,'int',[78,99],'easy'),
      metric('정립','min',99.0,'decimal1',[97.0,99.9],'easy'),
      metric('수분','max',14.0,'decimal1',[10.5,15.8],'easy'),
      metric('이품종','max',0.20,'decimal2',[0.00,0.45],'hard'),
      metric('잡초종자계','max',0.02,'decimal2',[0.00,0.08],'medium'),
      metric('피해립','max',3.0,'decimal1',[0.0,5.5],'medium'),
      metric('특정병','max',5.0,'decimal1',[0.0,8.0],'hard'),
      metric('기타병','max',10.0,'decimal1',[0.0,15.0],'medium'),
      metric('이물','max',1.0,'decimal1',[0.0,2.3],'medium')
    ]},
    { id:'barley_field_gen1', examType:'포장검사', label:'겉보리 채종포 1세대', stages:[4,6], metrics:[
      metric('품종순도','min',99.7,'decimal1',[97.5,100.0],'medium'),
      metric('포장격리','min',1.0,'decimal1',[0.3,4.5],'medium','m'),
      metric('이종종자주','max',0.05,'decimal2',[0.00,0.18],'hard'),
      metric('특정병','max',0.40,'decimal2',[0.00,0.90],'hard'),
      metric('기타병','max',20.0,'decimal1',[4.0,28.0],'medium')
    ]},
    { id:'wheat_field_gen1', examType:'포장검사', label:'밀 채종포 1세대', stages:[4,6], metrics:[
      metric('품종순도','min',99.7,'decimal1',[97.5,100.0],'medium'),
      metric('포장격리','min',1.0,'decimal1',[0.3,4.5],'medium','m'),
      metric('이종종자주','max',0.05,'decimal2',[0.00,0.18],'hard'),
      metric('특정병','max',0.02,'decimal2',[0.00,0.08],'hard'),
      metric('기타병','max',20.0,'decimal1',[4.0,28.0],'medium')
    ]},
    { id:'soy_field_gen1', examType:'포장검사', label:'콩 채종포 1세대', stages:[4,6], metrics:[
      metric('품종순도','min',99.7,'decimal1',[97.5,100.0],'medium'),
      metric('포장격리','min',1.0,'decimal1',[0.3,4.5],'medium','m'),
      metric('이종종자주','max',0.20,'decimal2',[0.00,0.60],'hard'),
      metric('특정병','max',10.0,'decimal1',[1.0,16.0],'hard'),
      metric('기타병','max',20.0,'decimal1',[4.0,28.0],'medium')
    ]},
    { id:'rice_field_gen2', examType:'포장검사', label:'벼 채종포 2세대', stages:[4,6], metrics:[
      metric('품종순도','min',99.0,'decimal1',[97.0,100.0],'medium'),
      metric('포장격리','min',1.0,'decimal1',[0.3,4.5],'medium','m'),
      metric('특정해초','max',0.01,'decimal2',[0.00,0.05],'hard'),
      metric('특정병','max',0.02,'decimal2',[0.00,0.08],'hard'),
      metric('기타병','max',20.0,'decimal1',[4.0,28.0],'medium')
    ]}
  ];

  const STAGE_PROFILE_IDS = {
    1: ['rice_supply_seed','barley_supply_seed','wheat_supply_seed','soy_supply_seed'],
    2: ['rice_supply_seed','barley_supply_seed','wheat_supply_seed','soy_supply_seed'],
    3: ['rice_supply_seed','barley_supply_seed','wheat_supply_seed','soy_supply_seed','rice_foundation_seed'],
    4: ['rice_foundation_seed','rice_breeder_seed','wheat_foundation_seed','barley_foundation_seed','soy_foundation_seed','barley_field_gen1','wheat_field_gen1','soy_field_gen1','rice_field_gen2'],
    6: ['rice_foundation_seed','rice_breeder_seed','wheat_foundation_seed','barley_foundation_seed','soy_foundation_seed','barley_field_gen1','wheat_field_gen1','soy_field_gen1','rice_field_gen2']
  };

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function roundByFormat(v, format) {
    if (format === 'int') return Math.round(v);
    if (format === 'decimal1') return Math.round(v * 10) / 10;
    return Math.round(v * 100) / 100;
  }
  function formatNumber(v, format) {
    if (format === 'int') return String(Math.round(v));
    if (format === 'decimal1') return Number(v).toFixed(1);
    return Number(v).toFixed(2);
  }
  function formatValue(metric, value) {
    return formatNumber(value, metric.format) + (metric.unit || '');
  }
  function formatThreshold(metric) {
    return formatNumber(metric.threshold, metric.format) + (metric.unit || '') + (metric.type === 'min' ? ' 이상' : ' 이하');
  }
  function weightedPick(items, weightFn) {
    const pool = items.map(item => ({ item, w: Math.max(0, Number(weightFn(item)) || 0) })).filter(x => x.w > 0);
    if (!pool.length) return items[0];
    const total = pool.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    for (const entry of pool) {
      r -= entry.w;
      if (r <= 0) return entry.item;
    }
    return pool[pool.length - 1].item;
  }
  function weightedSample(items, count, weightFn) {
    const copy = items.slice();
    const picked = [];
    while (copy.length && picked.length < count) {
      const choice = weightedPick(copy, weightFn);
      picked.push(choice);
      copy.splice(copy.indexOf(choice), 1);
    }
    return picked;
  }
  function getNearBand(metric) {
    if (metric.near != null) return metric.near;
    if (metric.format === 'int') return 2;
    if (metric.format === 'decimal1') return metric.threshold >= 10 ? 0.3 : 0.2;
    if (metric.threshold <= 0.1) return 0.02;
    return 0.05;
  }
  function generateValue(metric, shouldPass, preferBoundary) {
    const lo = metric.range[0], hi = metric.range[1], t = metric.threshold, near = getNearBand(metric);
    let value;
    if (metric.type === 'min') {
      if (shouldPass) {
        const start = preferBoundary ? t : Math.min(hi, t + near + 0.001);
        const end = preferBoundary ? Math.min(hi, t + near) : hi;
        value = rand(start, Math.max(start, end));
      } else {
        const start = preferBoundary ? Math.max(lo, t - near) : lo;
        const end = preferBoundary ? Math.max(lo, t - 0.001) : Math.max(lo, t - near - 0.001);
        value = rand(Math.min(start, end), Math.max(start, end));
      }
    } else {
      if (shouldPass) {
        const start = preferBoundary ? Math.max(lo, t - near) : lo;
        const end = preferBoundary ? t : Math.max(lo, t - near - 0.001);
        value = rand(Math.min(start, end), Math.max(start, end));
      } else {
        const start = preferBoundary ? t + 0.001 : Math.min(hi, t + near + 0.001);
        const end = preferBoundary ? Math.min(hi, t + near) : hi;
        value = rand(Math.min(start, end), Math.max(start, end));
      }
    }
    value = clamp(value, lo, hi);
    value = roundByFormat(value, metric.format);
    if (metric.type === 'min' && shouldPass && value < t) value = roundByFormat(t, metric.format);
    if (metric.type === 'min' && !shouldPass && value >= t) value = roundByFormat(Math.max(lo, t - (metric.format === 'int' ? 1 : (metric.format === 'decimal1' ? 0.1 : 0.01))), metric.format);
    if (metric.type === 'max' && shouldPass && value > t) value = roundByFormat(t, metric.format);
    if (metric.type === 'max' && !shouldPass && value <= t) value = roundByFormat(Math.min(hi, t + (metric.format === 'int' ? 1 : (metric.format === 'decimal1' ? 0.1 : 0.01))), metric.format);
    return value;
  }

  function buildMeasurements(entries) {
    return entries.map(e => e.metric.label + ' ' + formatValue(e.metric, e.value)).join(', ');
  }

  function buildStoryText(stage, prefix, valuesText) {
    const tpl = pick(STORY_TEMPLATES[stage]);
    return tpl.replace('{prefix}', prefix).replace('{values}', valuesText);
  }

  function buildStudyText(prefix, valuesText) {
    return prefix + '. ' + valuesText + '일 때 판정은?';
  }

  function buildReason(prefix, entries, answer) {
    const failed = entries.filter(e => !e.pass);
    const passed = entries.filter(e => e.pass);
    const parts = [];
    if (answer === 'pass') {
      if (entries.length === 1) {
        const e = entries[0];
        parts.push(prefix + '의 ' + e.metric.label + ' 기준은 ' + formatThreshold(e.metric) + '입니다. ' + formatValue(e.metric, e.value) + '는 기준을 충족하므로 합격입니다.');
      } else {
        parts.push(prefix + '의 제시 항목은 모두 기준을 충족하므로 합격입니다.');
        const refs = passed.map(e => e.metric.label + ' ' + formatValue(e.metric, e.value) + '는 기준에 맞습니다');
        parts.push('(참고) ' + refs.join(', ') + '.');
      }
    } else {
      if (failed.length === 1) {
        const e = failed[0];
        const verdict = e.metric.type === 'min' ? '기준에 미달하므로' : '기준을 넘었으므로';
        parts.push(prefix + '의 ' + e.metric.label + ' 기준은 ' + formatThreshold(e.metric) + '입니다. ' + formatValue(e.metric, e.value) + '는 ' + verdict + ' 불합격입니다.');
      } else {
        const failTexts = failed.map(e => e.metric.label + ' ' + formatValue(e.metric, e.value));
        parts.push(prefix + '에서는 ' + failTexts.join(', ') + '가 각각 해당 기준을 벗어나 불합격입니다.');
      }
      if (passed.length) {
        const refs = passed.map(e => e.metric.label + ' ' + formatValue(e.metric, e.value) + '는 기준에 맞습니다');
        parts.push('(참고) ' + refs.join(', ') + '.');
      }
    }
    return parts.join('\n\n');
  }

  function chooseProfile(stage) {
    const ids = STAGE_PROFILE_IDS[stage];
    const candidates = PROFILES.filter(p => ids.includes(p.id));
    return pick(candidates);
  }

  function chooseMetrics(stage, profile, count) {
    const diffWeight = DIFFICULTY_PICK[stage];
    let pool = profile.metrics.slice();
    if (stage === 1) {
      const easyOnly = pool.filter(m => m.difficulty === 'easy');
      if (easyOnly.length) pool = easyOnly;
    }
    return weightedSample(pool, count, m => diffWeight[m.difficulty] || 1);
  }

  function chooseCulprits(stage, selected, count) {
    const diffWeight = FAIL_WEIGHTS[stage];
    return weightedSample(selected, count, m => diffWeight[m.difficulty] || 1);
  }

  function makeQuestion(stage) {
    const cfg = GENERATOR_CONFIG[stage];
    const profile = chooseProfile(stage);
    const selected = chooseMetrics(stage, profile, cfg.metricsPerQuestion);
    const answer = Math.random() < cfg.passChance ? 'pass' : 'fail';
    const failCount = answer === 'fail' ? ((stage === 6 && Math.random() < 0.22) ? 2 : 1) : 0;
    const culprits = answer === 'fail' ? chooseCulprits(stage, selected, Math.min(failCount, selected.length)) : [];
    const entries = selected.map(metric => {
      const shouldPass = answer === 'pass' ? true : !culprits.includes(metric);
      const boundaryChance = shouldPass ? 0.28 : 0.34;
      const value = generateValue(metric, shouldPass, Math.random() < boundaryChance);
      return { metric, value, pass: shouldPass };
    });
    const prefix = `(${profile.examType}) ${profile.label}`;
    const valuesText = buildMeasurements(entries);
    const storyText = buildStoryText(stage, prefix, valuesText);
    const studyText = buildStudyText(prefix, valuesText);
    const reason = buildReason(prefix, entries, answer);
    return { text: storyText, storyText, studyText, answer, reason };
  }

  function generateStageQuestions(stage) {
    const cfg = GENERATOR_CONFIG[stage];
    const out = [];
    const seen = new Set();
    let guard = 0;
    while (out.length < cfg.count && guard < cfg.count * 20) {
      guard++;
      const q = makeQuestion(stage);
      const key = q.studyText;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(q);
    }
    return out;
  }

  NODES[0].questions = generateStageQuestions(1);
  NODES[1].questions = generateStageQuestions(2);
  NODES[2].questions = generateStageQuestions(3);
  NODES[3].questions = generateStageQuestions(4);
  NODES[5].questions = generateStageQuestions(6);
})();
