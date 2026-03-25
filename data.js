// ============================================================
// data.js - 종자검사원 문제 데이터 (v0.6)
// 스테이지 1,2,3,4,6은 규격 기반 랜덤 생성형 문제를 사용합니다.
// 스테이지 5는 종자검사요령 O/X 전용 문제로 재구성합니다.
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
    "questions": []
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
    "y": 105,
    "bossLine": "진정한 검사원인지... 마지막으로 시험하겠다. 모든 기준을 꿰뚫어 보아라!",
    "bossOpenIcon": "images/node_06_open.png",
    "bossClearIcon": "images/node_06_clear.png",
    "questions": []
  }
];

(function seedQuestionFactory() {
  const GENERATOR_CONFIG = {
    1: { count: 20, metricsPerQuestion: 1, passChance: 0.56 },
    2: { count: 20, metricsPerQuestion: 3, passChance: 0.55 },
    3: { count: 20, metricsPerQuestion: 3, passChance: 0.52 },
    4: { count: 20, metricsPerQuestion: 3, passChance: 0.50 },
    6: { count: 20, metricsPerQuestion: 5, passChance: 0.46 }
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
      '{prefix}\n{values}예요. 이 정도면 괜찮죠?',
      '{prefix}\n{values}인데요, 한번 봐주세요~',
      '{prefix}\n{values}예요. 맞게 가져온 것 같은데요?',
      '{prefix}\n이번 건 나쁘지 않은 것 같은데요? {values}예요.',
      '{prefix}\n처음 가져와 본 건데요... {values}면 괜찮지 않나요?',
      '{prefix}\n제가 보기엔 괜찮아 보여요. {values}예요.'
    ],
    2: [
      '{prefix}\n정성껏 골라온 물량이에요. {values}예요. 한번 봐주세요.',
      '{prefix}\n이번 건 꽤 잘 나온 편이에요~ {values}예요. 어떠세요?',
      '{prefix}\n상태는 꽤 안정적인 것 같은데요~ {values}예요.',
      '{prefix}\n이번 물량은 자신 있어요. {values}예요. 판정 부탁드릴게요.',
      '{prefix}\n기준에 크게 어긋나진 않을 것 같은데요? {values}예요.',
      '{prefix}\n전체적으로 잘 나왔어요. {values}예요. 한번 보시죠.'
    ],
    3: [
      '{prefix}\n꽤 그럴듯하지? {values}야. 어디 판정해 봐.',
      '{prefix}\n이번 건 제법 괜찮아 보여. {values}야.',
      '{prefix}\n정성은 충분히 들였어. {values}다.',
      '{prefix}\n수치만 보고도 틀리진 않겠지? {values}야.',
      '{prefix}\n헷갈리라고 만든 건 아니야. 그래도 {values}다.',
      '{prefix}\n눈으로는 잘 안 보일걸? {values}다. 판단해 봐.'
    ],
    4: [
      '{prefix}\n기준에 맞춰 정리했어. {values}다. 확인해 봐.',
      '{prefix}\n이 정도면 빠질 데 없지. {values}야.',
      '{prefix}\n수치는 충분히 보여줬어. {values}다.',
      '{prefix}\n기준은 이미 맞춰 두었다. {values}다.',
      '{prefix}\n판정은 네 몫이다. {values}다.',
      '{prefix}\n불필요한 말은 하지 않지. {values}다. 답해 봐.'
    ],
    6: [
      '{prefix}\n숫자는 다 보여줬다. {values}다. 자, 판정해 봐.',
      '{prefix}\n이 정도 수치면 쉽게 말하긴 어렵겠지. {values}다.',
      '{prefix}\n전부 확인하고도 같은 판정을 내릴 수 있겠나? {values}다.',
      '{prefix}\n판정할 수 있다면 해 보아라. {values}다.',
      '{prefix}\n잘못된 기준으로는 누구도 통과시킬 수 없다. {values}다.',
      '{prefix}\n망설이지 마라. 지금 이 수치로 결론을 내려라. {values}다.'
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
  function shuffleLocal(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
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
    return prefix + '\n' + valuesText + '일 때 판정은?';
  }


function buildReferenceLine(entries) {
  return '(참고) ' + entries.map(e => e.metric.label + ' ' + formatNumber(e.metric.threshold, e.metric.format) + (e.metric.unit || '')).join(', ');
}

function buildReason(prefix, entries, answer) {
  const failed = entries.filter(e => !e.pass);
  const parts = [];
  if (answer === 'pass') {
    if (entries.length === 1) {
      const e = entries[0];
      parts.push(prefix + '의 ' + e.metric.label + ' 기준은 ' + formatThreshold(e.metric) + '입니다. ' + formatValue(e.metric, e.value) + '는 기준을 충족하므로 합격입니다.');
    } else {
      parts.push(prefix + '의 제시 항목은 모두 기준을 충족하므로 합격입니다.');
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
  }
  parts.push(buildReferenceLine(entries));
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

  function buildGeneratedWrongNoteMeta(prefix, profile, selected, entries, answer, valuesText) {
    const failedEntries = entries.filter(e => !e.pass);
    if (answer === 'fail' && failedEntries.length === 1) {
      const target = failedEntries[0];
      return {
        ruleKey: 'metric:' + profile.id + ':' + target.metric.label + ':' + target.metric.type + ':' + target.metric.threshold,
        mistakeType: target.metric.label + ' 기준 ' + (target.metric.type === 'min' ? '미달' : '초과'),
        ruleSummary: prefix + ' · ' + target.metric.label + ' ' + formatThreshold(target.metric),
        noteExample: target.metric.label + ' ' + formatValue(target.metric, target.value)
      };
    }
    if (answer === 'pass' && selected.length === 1) {
      const target = entries[0];
      return {
        ruleKey: 'metricpass:' + profile.id + ':' + target.metric.label + ':' + target.metric.type + ':' + target.metric.threshold,
        mistakeType: target.metric.label + ' 기준 충족 판정',
        ruleSummary: prefix + ' · ' + target.metric.label + ' ' + formatThreshold(target.metric),
        noteExample: target.metric.label + ' ' + formatValue(target.metric, target.value)
      };
    }
    const relevant = answer === 'fail' && failedEntries.length ? failedEntries : entries;
    const labels = relevant.map(e => e.metric.label).sort().join('|');
    const summary = relevant.map(e => e.metric.label + ' ' + formatThreshold(e.metric)).join(', ');
    const example = relevant.map(e => e.metric.label + ' ' + formatValue(e.metric, e.value)).join(', ');
    return {
      ruleKey: (answer === 'fail' ? 'combofail:' : 'combopass:') + profile.id + ':' + labels,
      mistakeType: answer === 'fail' ? '복합 기준 위반' : '복합 기준 충족 판정',
      ruleSummary: prefix + ' · ' + summary,
      noteExample: example || valuesText
    };
  }

  const STAGE5_STORY_LEADS = {
    deadline: [
      '기한 하나 틀리면 전부 틀리는 거다.',
      '날짜 하루 차이로 판정이 갈린다.',
      '며칠 차이인지 정확히 따져 봐.'
    ],
    procedure: [
      '절차를 틀리면 전부 무효다.',
      '순서를 모르면 기준도 못 지킨다.',
      '원칙대로인지 아닌지만 봐.'
    ],
    period: [
      '기간은 외우는 게 아니라 기준으로 남겨야 한다.',
      '언제부터인지, 언제까지인지 분명히 봐라.',
      '숫자 하나, 연도 하나가 판정을 바꾼다.'
    ],
    numeric: [
      '규정은 숫자로 증명하는 거야.',
      '기억으로 답하지 마. 수치로 판단해.',
      '숫자는 거짓말하지 않는다.'
    ]
  };

  function makeStage5Question(category, storyLead, statement, answer, reason, ruleKey, mistakeType, ruleSummary, noteExample) {
    const prefix = '(종자검사요령)';
    const leadPool = STAGE5_STORY_LEADS[category] || [];
    const lead = pick(leadPool) || storyLead || '기준으로 판단해.';
    const storyText = lead + ' ' + prefix + ' ' + statement + ' ' + (answer === 'pass' ? 'O냐 X냐?' : '자, O냐 X냐?');
    const studyText = prefix + '\n' + statement;
    return {
      text: storyText,
      storyText,
      studyText,
      answer,
      reason,
      uiMode: 'ox',
      stage5Category: category,
      ruleKey,
      mistakeType,
      ruleSummary,
      noteExample: noteExample || statement
    };
  }

  function buildStage5QuestionBank() {
    return [
      makeStage5Question('deadline', '기한 하나 틀리면 전부 틀리는 거다.', '포장검사 신청은 검사희망일 10일 전까지 해야 한다.', 'pass', '포장검사 신청은 검사희망일 10일 전까지 해야 하므로 맞는 진술입니다.', 'stage5:field-apply-deadline', '포장검사 신청 기한', '검사희망일 10일 전까지', '포장검사 신청 10일 전'),
      makeStage5Question('deadline', '날짜 하루 차이로 판정이 갈린다.', '포장검사 신청은 검사희망일 7일 전까지 하면 된다.', 'fail', '포장검사 신청은 검사희망일 10일 전까지 해야 합니다. 7일 전까지라고 한 진술은 틀립니다.', 'stage5:field-apply-deadline', '포장검사 신청 기한', '검사희망일 10일 전까지', '포장검사 신청 7일 전'),
      makeStage5Question('deadline', '기억이 아니라 기준으로 답해.', '희망일이 4월 20일일 때, 4월 10일 포장검사 신청은 적절하다.', 'pass', '포장검사 신청은 검사희망일 10일 전까지 해야 합니다. 희망일이 4월 20일이면 4월 10일까지 신청할 수 있으므로 적절합니다.', 'stage5:field-apply-case-pass', '포장검사 신청 사례 판정', '희망일 기준 10일 전까지', '4월 20일 희망일 / 4월 10일 신청'),
      makeStage5Question('deadline', '기한 계산은 감으로 하는 게 아니다.', '희망일이 4월 20일일 때, 4월 12일 포장검사 신청은 적절하다.', 'fail', '포장검사 신청은 검사희망일 10일 전까지 해야 합니다. 희망일이 4월 20일이면 4월 10일까지 신청해야 하므로 4월 12일 신청은 부적절합니다.', 'stage5:field-apply-case-fail', '포장검사 신청 사례 판정', '희망일 기준 10일 전까지', '4월 20일 희망일 / 4월 12일 신청'),
      makeStage5Question('deadline', '통보 기한도 규정으로 본다.', '포장검사 결과는 검사완료 후 7일 이내 신청자에게 통지해야 한다.', 'pass', '포장검사 결과 통지는 검사완료 후 7일 이내여야 하므로 맞는 진술입니다.', 'stage5:field-result-notice', '포장검사 결과통지 기한', '검사완료 후 7일 이내', '포장검사 결과통지 7일 이내'),
      makeStage5Question('procedure', '재관리 횟수도 숫자로 묶인다.', '규격에 미달한 포장은 재관리를 2회까지 요구할 수 있다.', 'fail', '재관리는 1회에 한하여 요구할 수 있습니다. 2회까지 가능하다는 진술은 틀립니다.', 'stage5:remanage-count', '재관리 횟수', '재관리 1회 한정', '재관리 2회'),
      makeStage5Question('procedure', '한 번 더 준다고 두 번 더 주는 건 아니다.', '규격에 미달한 포장은 재관리를 1회에 한하여 요구할 수 있다.', 'pass', '재관리는 1회 한정이므로 맞는 진술입니다.', 'stage5:remanage-count', '재관리 횟수', '재관리 1회 한정', '재관리 1회'),
      makeStage5Question('deadline', '신청서는 날짜를 맞춰야 효력이 있다.', '종자검사 신청서는 검사희망일 3일 전까지 제출해야 한다.', 'pass', '종자검사 신청은 검사희망일 3일 전까지 해야 하므로 맞는 진술입니다.', 'stage5:seed-apply-deadline', '종자검사 신청 기한', '검사희망일 3일 전까지', '종자검사 신청 3일 전'),
      makeStage5Question('deadline', '숫자 하나 바꾸면 규정도 바뀌는 줄 아나.', '종자검사 신청은 검사희망일 5일 전까지 하면 된다.', 'fail', '종자검사 신청은 검사희망일 3일 전까지 해야 합니다. 5일 전까지라고 한 진술은 공식 기준과 다릅니다.', 'stage5:seed-apply-deadline', '종자검사 신청 기한', '검사희망일 3일 전까지', '종자검사 신청 5일 전'),
      makeStage5Question('deadline', '맞는 날짜를 찍어야 통과한다.', '희망일이 4월 20일일 때, 4월 17일 종자검사 신청은 적절하다.', 'pass', '종자검사 신청은 검사희망일 3일 전까지 가능합니다. 희망일이 4월 20일이면 4월 17일 신청은 적절합니다.', 'stage5:seed-apply-case-pass', '종자검사 신청 사례 판정', '희망일 기준 3일 전까지', '4월 20일 희망일 / 4월 17일 신청'),
      makeStage5Question('deadline', '하루 밀리면 바로 틀린 거다.', '희망일이 4월 20일일 때, 4월 18일 종자검사 신청은 적절하다.', 'fail', '종자검사 신청은 검사희망일 3일 전까지 해야 합니다. 희망일이 4월 20일이면 4월 17일까지 신청해야 하므로 4월 18일 신청은 부적절합니다.', 'stage5:seed-apply-case-fail', '종자검사 신청 사례 판정', '희망일 기준 3일 전까지', '4월 20일 희망일 / 4월 18일 신청'),
      makeStage5Question('deadline', '재검사도 기간을 놓치면 끝이다.', '재검사 신청은 결과 통보일부터 15일 이내에 해야 한다.', 'pass', '재검사 신청 기한은 결과 통보일부터 15일 이내이므로 맞는 진술입니다.', 'stage5:reinspect-deadline', '재검사 신청 기한', '결과 통보일부터 15일 이내', '재검사 신청 15일 이내'),
      makeStage5Question('deadline', '날짜를 세는 건 기본이다.', '5월 1일 결과를 통보받고 5월 14일 재검사를 신청했다. 기한 내 신청이다.', 'pass', '재검사 신청은 결과 통보일부터 15일 이내에 해야 합니다. 5월 14일 신청은 기한 내이므로 맞는 진술입니다.', 'stage5:reinspect-case-pass', '재검사 신청 사례 판정', '결과 통보일부터 15일 이내', '5월 1일 통보 / 5월 14일 신청'),
      makeStage5Question('deadline', '늦은 신청은 이유가 있어도 늦은 거다.', '5월 1일 결과를 통보받고 5월 18일 재검사를 신청했다. 기한 내 신청이다.', 'fail', '재검사 신청은 결과 통보일부터 15일 이내에 해야 합니다. 5월 18일 신청은 기한을 넘겼으므로 틀린 진술입니다.', 'stage5:reinspect-case-fail', '재검사 신청 사례 판정', '결과 통보일부터 15일 이내', '5월 1일 통보 / 5월 18일 신청'),
      makeStage5Question('period', '보관기간도 종별로 다르다.', '원원종 제출시료의 보관기간은 3년이다.', 'pass', '제출시료 보관기간은 원원종 3년, 원종 2년, 보급종 1년, 기타 종자 6개월입니다. 원원종 3년은 맞는 진술입니다.', 'stage5:sample-storage-breeder', '제출시료 보관기간', '원원종 3년', '원원종 3년'),
      makeStage5Question('period', '기준표를 뒤집어 읽으면 바로 틀린다.', '보급종 제출시료의 보관기간은 2년이다.', 'fail', '보급종 제출시료의 보관기간은 1년입니다. 2년이라고 한 진술은 틀립니다.', 'stage5:sample-storage-supply', '제출시료 보관기간', '보급종 1년', '보급종 2년'),
      makeStage5Question('period', '기간은 짧아도 기준은 확실하다.', '기타 종자 제출시료의 보관기간은 6개월이다.', 'pass', '기타 종자 제출시료의 보관기간은 6개월이므로 맞는 진술입니다.', 'stage5:sample-storage-other', '제출시료 보관기간', '기타 종자 6개월', '기타 종자 6개월'),
      makeStage5Question('period', '시행일 하나도 정확히 기억해야 한다.', '이 고시의 시행일은 2026년 1월 8일이다.', 'pass', '고시 시행일은 2026년 1월 8일이므로 맞는 진술입니다.', 'stage5:notice-effective-date', '고시 시행일', '2026년 1월 8일 시행', '시행일 2026.1.8'),
      makeStage5Question('period', '재검토기한도 마음대로 줄일 수 없다.', '이 고시는 2026년 7월 1일 기준으로 매 2년마다 재검토한다.', 'fail', '재검토기한은 2026년 7월 1일을 기준으로 매 3년마다입니다. 매 2년마다라는 진술은 틀립니다.', 'stage5:review-cycle', '재검토기한', '2026년 7월 1일 기준 매 3년', '재검토 2년마다'),
      makeStage5Question('procedure', '절차는 원칙부터 맞춰라.', '포장검사는 원칙적으로 필지별로 한다.', 'pass', '포장검사는 원칙적으로 필지별로 실시하므로 맞는 진술입니다.', 'stage5:field-by-lot', '포장검사 원칙', '포장검사는 필지별 검사 원칙', '필지별 검사'),
      makeStage5Question('procedure', '분명한 결과 앞에서는 절차도 달라진다.', '달관검사 결과만으로 합격 또는 불합격이 분명해도 표본검사를 반드시 해야 한다.', 'fail', '달관검사 결과만으로 합격 또는 불합격이 분명하면 표본검사를 생략할 수 있습니다. 반드시 해야 한다는 진술은 틀립니다.', 'stage5:field-visual-skip-sampling', '달관검사와 표본검사', '달관검사로 판정이 분명하면 표본검사 생략 가능', '달관검사 후 표본검사 필수'),
      makeStage5Question('procedure', '절차는 출발점부터 제한된다.', '종자검사는 포장검사에 합격한 포장에서 생산된 종자를 대상으로 한다.', 'pass', '종자검사는 포장검사 합격 포장에서 생산된 종자를 대상으로 하므로 맞는 진술입니다.', 'stage5:seed-test-source', '종자검사 대상', '포장검사 합격 포장 생산 종자', '포장검사 합격 포장 종자'),
      makeStage5Question('numeric', '소집단 숫자도 헷갈리면 안 된다.', '감자류 소집단의 최대중량은 40톤이다.', 'pass', '감자류 소집단 최대중량은 40톤이므로 맞는 진술입니다.', 'stage5:seed-lot-potato', '소집단 최대중량', '감자류 40톤', '감자류 40톤'),
      makeStage5Question('numeric', '무게 기준을 부풀리면 바로 틀린다.', '15kg 미만 소형 포장물은 150kg으로 재구성하면 된다.', 'fail', '15kg 미만 소형 포장물은 100kg으로 재구성합니다. 150kg이라는 진술은 틀립니다.', 'stage5:small-pack-rebuild', '소형 포장물 재구성', '15kg 미만은 100kg 재구성', '소형 포장물 150kg 재구성'),
      makeStage5Question('numeric', '숫자는 반복까지 기억해야 한다.', '발아검정에서 정립종자 100립씩 4반복이면 총 400립이다.', 'pass', '정립종자 100립씩 4반복이면 총 400립이므로 맞는 진술입니다.', 'stage5:germination-count', '발아검정 반복수', '100립 × 4반복 = 400립', '100립 × 4반복'),
      makeStage5Question('numeric', 'TR 기준은 한 자리 차이로 갈린다.', '순도분석에서 0.05% 이하는 TR로 적는다.', 'fail', 'TR 표기는 0.05% 미만일 때 적용합니다. 0.05% 이하는 TR이라는 진술은 틀립니다.', 'stage5:purity-tr', 'TR 표기 기준', '0.05% 미만 = TR', '0.05% 이하 = TR'),
      makeStage5Question('numeric', '합계가 틀리면 분석도 흔들린다.', '순도분석 전체 합은 100.0이 되어야 한다.', 'pass', '순도분석 결과의 전체 합은 100.0이 되어야 하므로 맞는 진술입니다.', 'stage5:purity-total', '순도분석 전체 합', '전체 합 100.0', '전체 합 100.0'),
      makeStage5Question('numeric', '재분석 기준은 낮게 잡히지 않는다.', '분석값 차이가 3% 이상이면 재분석한다.', 'fail', '분석값 차이가 5% 이상이면 재분석합니다. 3% 이상이라는 진술은 틀립니다.', 'stage5:reanalysis-gap', '재분석 기준', '차이 5% 이상 재분석', '차이 3% 이상 재분석'),
      makeStage5Question('numeric', '계산착오 의심 기준도 숫자로 고정된다.', '순도분석 전체 합이 100.0에서 0.1%를 넘게 벗어나면 계산착오를 의심한다.', 'pass', '전체 합이 100.0에서 0.1%를 넘게 벗어나면 계산착오를 의심하므로 맞는 진술입니다.', 'stage5:calc-error', '계산착오 의심 기준', '100.0에서 0.1% 넘게 벗어나면 계산착오 의심', '100.0 ± 0.1% 초과'),
      makeStage5Question('deadline', '기한을 못 맞추면 중간통보가 따라온다.', '종자검사는 희망일로부터 20일 이내에 완료해야 하며, 20일 내 완료하지 못하면 중간통보를 해야 한다.', 'pass', '종자검사는 희망일로부터 20일 이내 완료가 원칙이며, 그 기간 내 완료하지 못하면 중간통보를 해야 하므로 맞는 진술입니다.', 'stage5:seed-complete-notice', '종자검사 완료와 중간통보', '희망일로부터 20일 이내 완료, 미완료 시 중간통보', '20일 내 완료 / 미완료 시 중간통보'),
      makeStage5Question('deadline', '중간통보를 빼먹어도 되는 규정은 없다.', '종자검사는 20일을 넘겨도 별도 중간통보 없이 진행할 수 있다.', 'fail', '희망일로부터 20일 이내 완료하지 못하면 중간통보를 해야 합니다. 별도 중간통보 없이 진행할 수 있다는 진술은 틀립니다.', 'stage5:seed-complete-notice', '종자검사 완료와 중간통보', '희망일로부터 20일 이내 완료, 미완료 시 중간통보', '20일 초과 / 중간통보 없음'),
      makeStage5Question('numeric', '시간 기준도 외워서 끝낼 일이 아니다.', '수분측정용 시료는 건조기에 넣은 뒤 2분 후에 칭량한다.', 'pass', '수분측정에서는 시료를 건조기에 넣은 뒤 2분 후에 칭량하므로 맞는 진술입니다.', 'stage5:moisture-weigh-2min', '수분측정 칭량 시점', '건조기에 넣은 뒤 2분', '2분 후 칭량'),
      makeStage5Question('numeric', '30초를 넘기면 기준도 빗나간다.', '수분측정 시 칭량은 건조기에서 꺼낸 뒤 1분 이내면 된다.', 'fail', '칭량은 건조기에서 꺼낸 뒤 30초 이내에 해야 합니다. 1분 이내라는 진술은 틀립니다.', 'stage5:moisture-weigh-30sec', '수분측정 칭량 시간', '건조기에서 꺼낸 뒤 30초 이내', '1분 이내 칭량'),
      makeStage5Question('numeric', '시료 수분이 높으면 전처리 기준이 붙는다.', '순도분석 의뢰시료의 수분이 17% 이상이면 전처리를 검토한다.', 'pass', '순도분석 의뢰시료의 수분이 17% 이상이면 전처리 기준을 적용하므로 맞는 진술입니다.', 'stage5:purity-moisture-17', '순도분석 전처리 기준', '수분 17% 이상', '수분 17% 이상 전처리'),
      makeStage5Question('numeric', '작물별 수분 한도도 다르게 기억해야 한다.', '벼 정립종자의 수분 한도는 13%다.', 'pass', '벼 정립종자의 수분 한도는 13%이므로 맞는 진술입니다.', 'stage5:rice-moisture-limit', '정립종자 수분 한도', '벼 13%', '벼 13%'),
      makeStage5Question('numeric', '작물별 숫자를 섞으면 바로 틀린다.', '콩 정립종자의 수분 한도는 12%다.', 'fail', '콩 정립종자의 수분 한도는 10%입니다. 12%라는 진술은 틀립니다.', 'stage5:soy-moisture-limit', '정립종자 수분 한도', '콩 10%', '콩 12%'),
      makeStage5Question('numeric', '건조 조건은 온도와 시간이 함께 맞아야 한다.', '고온건조법은 103±2℃에서 17±1시간 처리한다.', 'pass', '고온건조법 조건은 103±2℃, 17±1시간이므로 맞는 진술입니다.', 'stage5:drying-temp-time', '고온건조법 조건', '103±2℃ / 17±1시간', '103±2℃, 17±1시간'),
      makeStage5Question('numeric', '침지시간은 작물에 따라 다르다.', '침지시간은 옥수수 4시간, 다른 곡류 2시간, 기타 종자 1시간이다.', 'pass', '침지시간 기준은 옥수수 4시간, 다른 곡류 2시간, 기타 종자 1시간이므로 맞는 진술입니다.', 'stage5:soak-time', '침지시간 기준', '옥수수 4시간 / 다른 곡류 2시간 / 기타 종자 1시간', '옥수수 4시간 / 곡류 2시간 / 기타 1시간')
    ];
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
    const noteMeta = buildGeneratedWrongNoteMeta(prefix, profile, selected, entries, answer, valuesText);
    return {
      text: storyText,
      storyText,
      studyText,
      answer,
      reason,
      ruleKey: noteMeta.ruleKey,
      mistakeType: noteMeta.mistakeType,
      ruleSummary: noteMeta.ruleSummary,
      noteExample: noteMeta.noteExample
    };
  }

  function generateStageQuestions(stage, countOverride) {
    const cfg = GENERATOR_CONFIG[stage];
    const targetCount = Math.max(1, Number(countOverride) || cfg.count);
    const out = [];
    const seen = new Set();
    let guard = 0;
    while (out.length < targetCount && guard < targetCount * 24) {
      guard++;
      const q = makeQuestion(stage);
      const key = q.studyText;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(q);
    }
    return out;
  }

  function generateNodeQuestions(nodeIdx, countOverride) {
    const node = NODES[nodeIdx];
    if (!node) return [];
    const stage = nodeIdx + 1;
    if (stage === 5) {
      const bank = buildStage5QuestionBank();
      return shuffleLocal(bank).slice(0, Math.min(bank.length, Math.max(1, Number(countOverride) || 20)));
    }
    return generateStageQuestions(stage, countOverride);
  }

  window.SeedQuestionFactory = {
    generateStageQuestions,
    buildStage5QuestionBank,
    generateNodeQuestions
  };
})();
