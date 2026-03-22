// ============================================================
// game.js - 종자검사원 게임 로직 (ver17 rebuild)
// ============================================================

const SOUND_FILES = {
  bgm_title:   'sounds/bgm_title.mp3',
  bgm_battle:  'sounds/bgm_battle.mp3',
  bgm_boss:    'sounds/bgm_boss.mp3',
  bgm_ending:  'sounds/bgm_ending.mp3',
  bgm_study:   'sounds/bgm_study.mp3',
  se_correct:  'sounds/se_correct.wav',
  se_wrong:    'sounds/se_wrong.wav',
  se_stamp:    'sounds/se_stamp.wav',
  se_clear:    'sounds/se_clear.wav',
  se_gameover: 'sounds/se_gameover.wav',
  se_click:    'sounds/se_click.wav',
  se_node:     'sounds/se_node.wav',
  se_hit:      'sounds/se_hit.wav',
};

const Sound = (() => {
  let bgmEl = null;
  let currentBgmKey = null;
  const settings = { bgm: true, se: true, bgmVolume: 0.5, seVolume: 0.7 };

  function loadSettings() {
    try {
      const saved = localStorage.getItem('seedGame_sound');
      if (saved) Object.assign(settings, JSON.parse(saved));
    } catch (e) {}
  }

  function saveSettings() {
    try { localStorage.setItem('seedGame_sound', JSON.stringify(settings)); } catch (e) {}
  }

  function playBGM(key) {
    if (!key) return;
    currentBgmKey = key;
    if (!settings.bgm) return;
    if (bgmEl && bgmEl.dataset && bgmEl.dataset.key === key) {
      bgmEl.volume = settings.bgmVolume ?? 0.5;
      if (bgmEl.paused) bgmEl.play().catch(() => {});
      return;
    }
    if (bgmEl) {
      bgmEl.pause();
      bgmEl = null;
    }
    try {
      bgmEl = new Audio(SOUND_FILES[key]);
      bgmEl.loop = true;
      bgmEl.volume = settings.bgmVolume ?? 0.5;
      bgmEl.dataset.key = key;
      bgmEl.play().catch(() => {});
    } catch (e) {}
  }

  function stopBGM() {
    if (bgmEl) bgmEl.pause();
    bgmEl = null;
  }

  function playSE(key) {
    if (!settings.se) return;
    try {
      const a = new Audio(SOUND_FILES[key]);
      a.volume = settings.seVolume ?? 0.7;
      a.play().catch(() => {});
    } catch (e) {}
  }

  function toggleBGM() {
    settings.bgm = !settings.bgm;
    if (!settings.bgm) stopBGM();
    else if (currentBgmKey) playBGM(currentBgmKey);
    saveSettings();
    return settings.bgm;
  }

  function toggleSE() {
    settings.se = !settings.se;
    saveSettings();
    return settings.se;
  }

  function isBGMOn() { return settings.bgm; }
  function isSEOn() { return settings.se; }

  function setBGMVol(val) {
    const v = parseInt(val, 10) / 100;
    settings.bgmVolume = v;
    settings.bgm = v > 0;
    const el = document.getElementById('bgm-val');
    if (el) el.textContent = String(val);
    if (bgmEl) {
      bgmEl.volume = v;
      if (!settings.bgm) bgmEl.pause();
      else bgmEl.play().catch(() => {});
    } else if (settings.bgm && currentBgmKey) {
      playBGM(currentBgmKey);
    }
    saveSettings();
  }

  function setSEVol(val) {
    const v = parseInt(val, 10) / 100;
    settings.seVolume = v;
    settings.se = v > 0;
    const el = document.getElementById('se-val');
    if (el) el.textContent = String(val);
    saveSettings();
  }

  return { playBGM, stopBGM, playSE, toggleBGM, toggleSE, isBGMOn, isSEOn, loadSettings, setBGMVol, setSEVol };
})();

const WrongNote = (() => {
  const KEY = 'seedGame_wrongnote';

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  }

  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  function trimExamples(examples) {
    return (Array.isArray(examples) ? examples : []).filter(Boolean).slice(0, 3);
  }

  function add(q) {
    if (!q || typeof q !== 'object') return;
    const list = load();
    const now = Date.now();

    if (!q.ruleKey) {
      const legacyKey = 'legacy::' + (q.text || '');
      if (!list.find(item => item.ruleKey === legacyKey || item.text === q.text)) {
        list.unshift({
          ruleKey: legacyKey,
          title: q.text || '오답 문제',
          criterionLabel: q.criterionLabel || '',
          examples: trimExamples(q.exampleText ? [q.exampleText] : []),
          wrongCount: 1,
          lastWrongAt: now,
          answer: q.answer,
          reason: q.reason || '',
          text: q.text || ''
        });
        if (list.length > 50) list.length = 50;
        save(list);
      }
      return;
    }

    const idx = list.findIndex(item => item.ruleKey === q.ruleKey);
    if (idx >= 0) {
      const item = list[idx];
      item.title = q.mistakeType || item.title || '오답 유형';
      item.criterionLabel = q.criterionLabel || item.criterionLabel || '';
      item.answer = q.answer || item.answer;
      item.reason = q.reason || item.reason || '';
      item.text = q.text || item.text || '';
      item.wrongCount = (Number(item.wrongCount) || 0) + 1;
      item.lastWrongAt = now;
      const examples = Array.isArray(item.examples) ? item.examples.slice() : [];
      if (q.exampleText) item.examples = trimExamples([q.exampleText].concat(examples.filter(v => v !== q.exampleText)));
      else item.examples = trimExamples(examples);
      list.splice(idx, 1);
      list.unshift(item);
    } else {
      list.unshift({
        ruleKey: q.ruleKey,
        title: q.mistakeType || '오답 유형',
        criterionLabel: q.criterionLabel || '',
        examples: trimExamples(q.exampleText ? [q.exampleText] : []),
        wrongCount: 1,
        lastWrongAt: now,
        answer: q.answer,
        reason: q.reason || '',
        text: q.text || ''
      });
    }

    if (list.length > 50) list.length = 50;
    save(list);
  }

  function clear() { save([]); }

  return { load, add, clear };
})();

let G = {
  playerName: '용사',
  nodeStatus: Array(NODES.length).fill('locked'),
  currentNode: 0,
  currentQ: 0,
  questionTurn: 1,
  shuffledQ: [],
  hp: 3,
  enemyHp: 3,
  enemyMaxHp: 3,
  correct: 0,
  wrong: 0,
  totalCorrect: 0,
  totalWrong: 0,
  stage1TutorialShown: false,
  pendingDamage: false,
  pendingDamageOutcome: null,
  damageTimer: null,
  mode: 'story'
};
G.nodeStatus[0] = 'available';

const STUDY = {
  active: false,
  pool: [],
  idx: 0,
  turn: 1,
  correct: 0,
  wrong: 0,
  current: null
};

let uiModalOk = null;
let uiModalCancel = null;

const PLAYER_FLAVOR_LINES = ['........', '.....네?', '확인해 볼게요.', '뭐라구요?'];

const OP_SCENES = [
  { image: 'images/scene1.png', lightning: false, lines: [
    '오래전, 종자 왕국의 질서가 무너졌다.',
    '태초에 생명의 계약을 맺었던 비옥한 땅은\n이제 저주받은 듯 숨을 죽였다.',
    '어리석은 자들은 풍요를 탐하며\n검증되지 않은 씨앗을 심었고,\n대지는 그 거짓된 생명을 받아들이지 않았다.'
  ]},
  { image: 'images/scene2.png', lightning: false, lines: [
    '그러나 거짓을 가려낼 눈이\n완전히 사라진 것은 아니었다.',
    '모든 질서가 무너진 지금,\n거짓 속의 진실을 꿰뚫어 볼 수 있는 자들...',
    '뒤엉킨 생명의 근원을 바로잡고,\n타락한 종자에 ‘불합격’의 심판을 내릴 존재.',
    '사람들은 그들을\n‘종자검사원’이라 불렀다.'
  ]},
  { image: 'images/scene3.png', lightning: false, lines: [
    '아직은 수습생에 불과한 당신은\n정식 종자검사원이 되기 위해\n긴 여정에 오른다.',
    '죽어가는 들판, 낯선 성소,\n그리고 모든 악의 근원이 기다리는\n심판의 성을 향해.'
  ]},
  { image: 'images/scene4.png', lightning: true, lines: [
    '왕국의 끝, 안개 너머에서는\n거짓의 세상을 지키려는 최종 보스가\n당신의 의지를 시험하려 기다리고 있다.',
    '당신의 날카로운 감각과\n올바른 판단만이\n이 세상을 구할 수 있다.',
    '두려워하지 마라.',
    '지금부터... __NAME__의 모험이 시작된다.'
  ]}
];

const ENDING_SCENES = [
  {
    image: 'images/ending_01.png',
    fallback: 'radial-gradient(circle at 50% 38%, rgba(120,32,20,0.45), rgba(8,4,4,0.98) 72%)',
    lines: [
      '거짓의 심판은 마침내 무너졌다.',
      '붉게 뒤엉킨 기준과 오염된 질서도\n서서히 힘을 잃기 시작했다.'
    ]
  },
  {
    image: 'images/ending_02.png',
    fallback: 'linear-gradient(180deg, #172616 0%, #0a160a 100%)',
    lines: [
      '죽어가던 들판에는 다시 푸른 숨결이 깃들었다.',
      '왕국의 대지는 올바른 생명을\n다시 받아들일 준비를 마쳤다.'
    ]
  },
  {
    image: 'images/ending_03.png',
    fallback: 'linear-gradient(180deg, #17110a 0%, #050404 100%)',
    lines: [
      '당신은 거짓을 가려내고,\n타락한 종자에 올바른 심판을 내렸다.',
      '왕국은 이제 당신을\n정식 종자검사원으로 인정한다.'
    ]
  },
  {
    image: 'images/ending_04.png',
    fallback: 'linear-gradient(180deg, #292010 0%, #0a0906 100%)',
    lines: [
      '왕국의 질서는 다시 세워졌고,',
      '정식 종자검사원 __NAME__.\n그 위대한 판정은, 이제부터가 시작이다.'
    ]
  }
];

let opSceneIdx = 0, opLineIdx = 0, opTyping = false, opFullLine = '', opTypingTimer = null, opSceneEls = [];
let endingSceneIdx = 0, endingLineIdx = 0, endingTyping = false, endingFullLine = '', endingTypingTimer = null;
let endingAwaitingRank = false, endingRankPopupShown = false, endingRankData = null;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

function playUIClick() { Sound.playSE('se_click'); }

function disableResultNext(disabled) {
  const nextBtn = document.querySelector('.result-next-btn');
  if (nextBtn) nextBtn.disabled = !!disabled;
}

function highlightNumbers(text) {
  return String(text).replace(/(\d+(?:\.\d+)?(?:%|m|일|회|주|년|세대|단계)?)(?![\d])/g, '<span class="highlight">$1</span>');
}

function formatQuestion(text) {
  return String(text || '').replace(/([.?!~…])\s+/g, '$1\n');
}

function cleanStudyText(text) {
  let cleaned = String(text || '').replace(/^\s*["“”']+/, '').replace(/["“”']+\s*$/, '');
  if (!/\n/.test(cleaned)) {
    const m = cleaned.match(/^(\([^\n)]+\)\s+[^.]+?)\.\s+(.+)$/);
    if (m) cleaned = m[1] + '\n' + m[2];
  }
  return cleaned;
}

function formatStudyQuestionHtml(text) {
  const lines = cleanStudyText(text).split(/\n+/).map(v => v.trim()).filter(Boolean);
  if (!lines.length) return '';
  const labelLine = lines[0];
  const bodyLines = lines.slice(1);
  const head = '<div class="study-line-label">' + highlightNumbers(escapeHtml(labelLine)) + '</div>';
  const body = bodyLines.map(line => '<div class="study-line-body">' + highlightNumbers(escapeHtml(line)) + '</div>').join('');
  return head + body;
}

function formatReasonHtml(text, labelClass = 'reason-line-label') {
  const lines = String(text || '').split(/\n/);
  const chunks = [];
  let firstLabelDone = false;
  let inRefs = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      chunks.push('<div class="reason-gap"></div>');
      continue;
    }
    if (!firstLabelDone) {
      chunks.push('<div class="' + labelClass + '">' + highlightNumbers(escapeHtml(line)) + '</div>');
      firstLabelDone = true;
      continue;
    }
    if (/^\(?참고\)?/.test(line)) {
      inRefs = true;
      chunks.push('<div class="reason-ref-title">참고)</div>');
      continue;
    }
    const cls = inRefs ? 'reason-ref-line' : 'reason-main-line';
    chunks.push('<div class="' + cls + '">' + highlightNumbers(escapeHtml(line)) + '</div>');
  }
  return chunks.join('');
}

function normalizeNodeStatus(statuses) {
  const norm = Array.isArray(statuses) ? statuses.slice(0, NODES.length) : [];
  while (norm.length < NODES.length) norm.push('locked');
  const progressed = new Set(['available', 'cleared']);
  let furthest = -1;
  for (let i = 0; i < norm.length; i++) if (progressed.has(norm[i])) furthest = i;
  if (furthest < 0) {
    norm.fill('locked');
    norm[0] = 'available';
    return norm;
  }
  for (let i = 0; i < furthest; i++) norm[i] = 'cleared';
  if (norm[furthest] !== 'cleared') norm[furthest] = 'available';
  for (let i = furthest + 1; i < norm.length; i++) if (norm[i] !== 'cleared') norm[i] = 'locked';
  return norm;
}

function saveGame() {
  try {
    localStorage.setItem('seedGame_v3', JSON.stringify({
      playerName: G.playerName,
      nodeStatus: normalizeNodeStatus(G.nodeStatus),
      totalCorrect: G.totalCorrect,
      totalWrong: G.totalWrong,
      stage1TutorialShown: G.stage1TutorialShown
    }));
  } catch (e) {}
}

function loadSave() {
  try {
    const raw = localStorage.getItem('seedGame_v3');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function resetWholeGame() {
  G = {
    playerName: '용사',
    nodeStatus: Array(NODES.length).fill('locked'),
    currentNode: 0,
    currentQ: 0,
    questionTurn: 1,
    shuffledQ: [],
    hp: 3,
    enemyHp: 3,
    enemyMaxHp: 3,
    correct: 0,
    wrong: 0,
    totalCorrect: 0,
    totalWrong: 0,
    stage1TutorialShown: false,
    pendingDamage: false,
    pendingDamageOutcome: null,
    damageTimer: null,
    mode: 'story'
  };
  G.nodeStatus[0] = 'available';
}

function resetNodeBattle(idx) {
  if (G.damageTimer) {
    clearTimeout(G.damageTimer);
    G.damageTimer = null;
  }
  G.pendingDamage = false;
  G.pendingDamageOutcome = null;
  G.currentNode = idx;
  G.currentQ = 0;
  G.questionTurn = 1;
  G.hp = 3;
  G.enemyMaxHp = NODES[idx].maxHp;
  G.enemyHp = NODES[idx].maxHp;
  G.correct = 0;
  G.wrong = 0;
  G.shuffledQ = shuffle(NODES[idx].questions || []);
}

function getRandomPlayerFlavor() {
  return PLAYER_FLAVOR_LINES[Math.floor(Math.random() * PLAYER_FLAVOR_LINES.length)];
}

function updatePlayerFlavorLine() {
  const lineEl = document.getElementById('battle-player-line');
  if (lineEl) lineEl.textContent = getRandomPlayerFlavor();
}

function closeUIModal() {
  const modal = document.getElementById('ui-modal');
  if (modal) modal.classList.remove('show');
  uiModalOk = null;
  uiModalCancel = null;
}

function showAlertModal(title, desc, onOk) {
  const modal = document.getElementById('ui-modal');
  const titleEl = document.getElementById('ui-modal-title');
  const descEl = document.getElementById('ui-modal-desc');
  const okBtn = document.getElementById('ui-modal-ok');
  const cancelBtn = document.getElementById('ui-modal-cancel');
  if (!modal || !titleEl || !descEl || !okBtn || !cancelBtn) return;
  titleEl.textContent = title;
  descEl.innerHTML = desc;
  cancelBtn.style.display = 'none';
  okBtn.textContent = '확인';
  uiModalOk = onOk || null;
  uiModalCancel = null;
  okBtn.onclick = () => {
    playUIClick();
    const cb = uiModalOk;
    closeUIModal();
    if (cb) cb();
  };
  cancelBtn.onclick = () => { playUIClick(); closeUIModal(); };
  modal.classList.add('show');
}

function showConfirmModal(title, desc, onOk, onCancel) {
  const modal = document.getElementById('ui-modal');
  const titleEl = document.getElementById('ui-modal-title');
  const descEl = document.getElementById('ui-modal-desc');
  const okBtn = document.getElementById('ui-modal-ok');
  const cancelBtn = document.getElementById('ui-modal-cancel');
  if (!modal || !titleEl || !descEl || !okBtn || !cancelBtn) return;
  titleEl.textContent = title;
  descEl.innerHTML = desc;
  cancelBtn.style.display = 'inline-flex';
  cancelBtn.textContent = '취소';
  okBtn.textContent = '확인';
  uiModalOk = onOk || null;
  uiModalCancel = onCancel || null;
  okBtn.onclick = () => {
    playUIClick();
    const cb = uiModalOk;
    closeUIModal();
    if (cb) cb();
  };
  cancelBtn.onclick = () => {
    playUIClick();
    const cb = uiModalCancel;
    closeUIModal();
    if (cb) cb();
  };
  modal.classList.add('show');
}

function updateSettingUI() {
  const bgmSlider = document.getElementById('bgm-slider');
  const seSlider = document.getElementById('se-slider');
  const bgmVal = document.getElementById('bgm-val');
  const seVal = document.getElementById('se-val');
  let soundCfg = {};
  try { soundCfg = JSON.parse(localStorage.getItem('seedGame_sound') || '{}') || {}; } catch (e) {}
  if (bgmSlider) {
    const bgmVolume = Number(soundCfg.bgmVolume ?? 0.5);
    const v = Math.round((Sound.isBGMOn() ? bgmVolume : 0) * 100);
    bgmSlider.value = v || 0;
    if (bgmVal) bgmVal.textContent = String(v || 0);
  }
  if (seSlider) {
    const seVolume = Number(soundCfg.seVolume ?? 0.7);
    const v = Math.round((Sound.isSEOn() ? seVolume : 0) * 100);
    seSlider.value = v || 0;
    if (seVal) seVal.textContent = String(v || 0);
  }
}

function initTitle() {
  const saved = loadSave();
  const primaryBtn = document.getElementById('primary-btn');
  const restartBtn = document.getElementById('restart-btn');
  const studyBtn = document.getElementById('study-btn');
  const wrongBtn = document.getElementById('wrongnote-btn');
  const settingBtn = document.getElementById('setting-btn');
  const applyTop = (el, value) => { if (el) el.style.top = value; };
  if (saved && saved.playerName) {
    primaryBtn.querySelector('.tmenu-label').textContent = '이어하기';
    restartBtn.style.display = 'flex';
    applyTop(primaryBtn, '21%');
    applyTop(restartBtn, '38.5%');
    applyTop(studyBtn, '47.0%');
    applyTop(wrongBtn, '55.5%');
    applyTop(settingBtn, '64.0%');
  } else {
    primaryBtn.querySelector('.tmenu-label').textContent = '모험 시작';
    restartBtn.style.display = 'none';
    applyTop(primaryBtn, '24%');
    applyTop(studyBtn, '44.0%');
    applyTop(wrongBtn, '52.5%');
    applyTop(settingBtn, '61.0%');
  }
  updateSettingUI();
  Sound.playBGM('bgm_title');
}

function handlePrimaryAction() {
  const saved = loadSave();
  if (saved && saved.playerName) continueGame();
  else goToNameInput();
}

function goToNameInput() {
  playUIClick();
  G.mode = 'story';
  const input = document.getElementById('player-name-input');
  if (input) input.value = '';
  showScreen('name-screen');
}

function goBackToTitle() {
  playUIClick();
  showScreen('title-screen');
  initTitle();
}

function continueGame() {
  playUIClick();
  const saved = loadSave();
  if (!saved) return;
  G.mode = 'story';
  G.playerName = saved.playerName || '용사';
  G.nodeStatus = normalizeNodeStatus(saved.nodeStatus);
  G.totalCorrect = saved.totalCorrect || 0;
  G.totalWrong = saved.totalWrong || 0;
  G.stage1TutorialShown = !!saved.stage1TutorialShown;
  showScreen('map-screen');
  renderMap();
  Sound.playBGM('bgm_title');
}

function confirmName() {
  playUIClick();
  const val = (document.getElementById('player-name-input')?.value || '').trim();
  if (val.length > 7) {
    showAlertModal('이름 입력', '이름은 7글자 이하로 입력해주세요');
    return;
  }
  resetWholeGame();
  G.mode = 'story';
  G.playerName = val || '용사';
  saveGame();
  startOpening();
}

function goTitle() {
  resetWholeGame();
  showScreen('title-screen');
  initTitle();
}

function confirmGoTitle() {
  playUIClick();
  showConfirmModal('타이틀로 돌아가기', '현재 진행 상황은 저장되어 있습니다.<br>타이틀로 돌아가시겠습니까?', () => {
    Sound.stopBGM();
    showScreen('title-screen');
    initTitle();
  });
}

function opRenderLine(line) {
  const safe = escapeHtml(line).replace(/\n/g, '<br>');
  return safe
    .replace(/__NAME__/g, '<span class="op-player-name">' + escapeHtml(G.playerName || '용사') + '</span>')
    .replace(/불합격/g, '<span class="op-keyword-fail">불합격</span>')
    .replace(/종자검사원/g, '<span class="op-keyword-inspector">종자검사원</span>');
}

function opTypeLine(line) {
  clearTimeout(opTypingTimer);
  opTyping = true;
  opFullLine = line;
  const plain = line.replace(/__NAME__/g, G.playerName || '용사');
  const textEl = document.getElementById('op-text');
  if (!textEl) { opTyping = false; return; }
  let i = 0;
  textEl.innerHTML = '';
  function tick() {
    const s = escapeHtml(plain.slice(0, i)).replace(/\n/g, '<br>');
    textEl.innerHTML = s;
    i++;
    if (i <= plain.length) opTypingTimer = setTimeout(tick, 32);
    else {
      textEl.innerHTML = opRenderLine(line);
      opTyping = false;
    }
  }
  tick();
}

function opSetScene(idx) {
  opSceneEls.forEach((el, i) => {
    const isCurrent = i === idx;
    if (isCurrent) {
      el.classList.add('active', 'wipe-in');
      el.classList.remove('wipe-out');
      const bg = el.querySelector('.op-scene-bg');
      if (bg) {
        bg.style.animation = 'none';
        void bg.offsetWidth;
        bg.style.animation = 'op-slow-pan 11s ease-in-out forwards';
      }
      setTimeout(() => {
        el.classList.remove('wipe-in');
        el.style.webkitMaskImage = 'none';
        el.style.maskImage = 'none';
      }, 620);
    } else if (el.classList.contains('active')) {
      el.classList.add('wipe-out');
      setTimeout(() => {
        el.classList.remove('active', 'wipe-out');
        el.style.webkitMaskImage = 'none';
        el.style.maskImage = 'none';
      }, 620);
    }
  });
  if (OP_SCENES[idx].lightning) {
    const flash = opSceneEls[idx]?.querySelector('.op-flash');
    if (flash) {
      [640, 1100, 1560].forEach((delay, n) => {
        setTimeout(() => {
          flash.classList.add('active');
          setTimeout(() => flash.classList.remove('active'), n === 2 ? 420 : 280);
        }, delay);
      });
    }
  }
}

function opShowLine() { opTypeLine(OP_SCENES[opSceneIdx].lines[opLineIdx]); }

function opNextStep() {
  if (opTyping) {
    clearTimeout(opTypingTimer);
    document.getElementById('op-text').innerHTML = opRenderLine(opFullLine);
    opTyping = false;
    return;
  }
  const scene = OP_SCENES[opSceneIdx];
  if (opLineIdx < scene.lines.length - 1) {
    opLineIdx++;
    opShowLine();
    return;
  }
  if (opSceneIdx < OP_SCENES.length - 1) {
    opSceneIdx++;
    opLineIdx = 0;
    opSetScene(opSceneIdx);
    opShowLine();
    return;
  }
  opFinish();
}

function opFinish() {
  const arrow = document.getElementById('op-arrow');
  const endBtn = document.getElementById('op-end-btn');
  const tap = document.getElementById('op-tap');
  const skip = document.getElementById('op-skip');
  if (arrow) arrow.style.visibility = 'hidden';
  if (endBtn) endBtn.style.display = 'block';
  if (tap) {
    tap.disabled = true;
    tap.style.pointerEvents = 'none';
  }
  if (skip) skip.style.display = 'block';
}

function opSkipAll() {
  playUIClick();
  clearTimeout(opTypingTimer);
  opSceneIdx = OP_SCENES.length - 1;
  opLineIdx = OP_SCENES[opSceneIdx].lines.length - 1;
  opSetScene(opSceneIdx);
  const textEl = document.getElementById('op-text');
  if (textEl) textEl.innerHTML = opRenderLine(OP_SCENES[opSceneIdx].lines[opLineIdx]);
  opTyping = false;
  opFinish();
}

function startOpening() {
  showScreen('opening-screen');
  const container = document.getElementById('op-scene-container');
  if (!container) return;
  container.innerHTML = '';
  opSceneEls = OP_SCENES.map((scene, idx) => {
    const layer = document.createElement('div');
    layer.className = 'op-scene-layer' + (idx === 0 ? ' active' : '');
    layer.innerHTML = '<img class="op-scene-bg" src="' + scene.image + '" alt=""><div class="op-scene-overlay"></div><div class="op-flash"></div>';
    container.appendChild(layer);
    return layer;
  });
  opSceneIdx = 0;
  opLineIdx = 0;
  opTyping = false;
  const arrow = document.getElementById('op-arrow');
  const endBtn = document.getElementById('op-end-btn');
  const skip = document.getElementById('op-skip');
  const tap = document.getElementById('op-tap');
  if (arrow) arrow.style.visibility = 'visible';
  if (endBtn) {
    endBtn.style.display = 'none';
    endBtn.onclick = startGame;
  }
  if (skip) {
    skip.style.display = 'block';
    skip.onclick = opSkipAll;
  }
  if (tap) {
    tap.disabled = false;
    tap.style.pointerEvents = 'auto';
    tap.onclick = opNextStep;
  }
  opSetScene(0);
  opShowLine();
}

function startGame() {
  playUIClick();
  showScreen('map-screen');
  renderMap();
  Sound.playBGM('bgm_title');
}

function renderMap() {
  renderNodes();
  renderPaths();
  const cleared = G.nodeStatus.filter(s => s === 'cleared').length;
  const progress = document.getElementById('map-progress-text');
  if (progress) progress.textContent = '정화된 구역: ' + cleared + ' / ' + NODES.length;
  const journey = document.getElementById('map-player-journey');
  if (journey) journey.innerHTML = '<strong>' + escapeHtml(G.playerName || '용사') + '</strong>님의 모험';
}

function renderNodes() {
  const container = document.getElementById('nodes-container');
  if (!container) return;
  container.innerHTML = '';
  const mapArea = container.parentElement;
  const mapH = mapArea ? mapArea.offsetHeight : 720;
  const mapW = mapArea ? mapArea.offsetWidth : 390;
  const scaleY = mapH / 750;
  const scaleX = mapW / 390;

  NODES.forEach((node, i) => {
    const status = G.nodeStatus[i] || 'locked';
    const isBoss = node.type === 'boss';
    const el = document.createElement('div');
    el.className = 'map-node stage-' + i + ' ' + status + (isBoss ? ' boss' : '');
    el.style.left = (node.x * scaleX) + 'px';
    el.style.top = (node.y * scaleY) + 'px';

    const icon = document.createElement('div');
    icon.className = 'node-icon';
    if (isBoss && status !== 'locked') {
      const src = status === 'cleared' ? node.bossClearIcon : node.bossOpenIcon;
      if (src) {
        icon.classList.add('custom-boss-icon');
        icon.style.backgroundImage = 'url(' + src + ')';
      }
    }
    el.appendChild(icon);

    if (isBoss && status !== 'locked') {
      const tag = document.createElement('div');
      tag.className = 'boss-tag';
      tag.textContent = 'BOSS';
      el.appendChild(tag);
    }

    if (status === 'available' || status === 'cleared') {
      el.addEventListener('click', () => openNodePopup(i));
    }
    container.appendChild(el);
  });
}

function renderPaths() {
  const svg = document.getElementById('path-svg');
  const mapArea = document.querySelector('.map-area');
  if (!svg || !mapArea) return;
  const w = mapArea.offsetWidth || 390;
  const h = mapArea.offsetHeight || 720;
  svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  svg.innerHTML = '';
  const points = NODES.map(node => ({ x: node.x * (w / 390), y: node.y * (h / 750) }));
  for (let i = 0; i < points.length - 1; i++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', points[i].x);
    line.setAttribute('y1', points[i].y);
    line.setAttribute('x2', points[i + 1].x);
    line.setAttribute('y2', points[i + 1].y);
    line.setAttribute('stroke', 'rgba(232,200,74,0.55)');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-dasharray', '5 7');
    svg.appendChild(line);
  }
}

function openNodePopup(idx) {
  playUIClick();
  const status = G.nodeStatus[idx];
  if (status !== 'available' && status !== 'cleared') return;
  G.currentNode = idx;
  const node = NODES[idx];
  document.getElementById('popup-enemy').textContent = node.enemy;
  document.getElementById('popup-desc').textContent = node.desc || '';
  document.getElementById('popup-hp').textContent = '내 체력 3 · 적 체력 ' + node.maxHp;
  document.getElementById('node-popup').classList.add('show');
}

function closeNodePopup() {
  playUIClick();
  document.getElementById('node-popup').classList.remove('show');
}

function showWrongnote() {
  playUIClick();
  const list = WrongNote.load();
  const body = document.getElementById('wrongnote-body');
  if (!body) return;
  body.innerHTML = '';
  body.classList.toggle('is-empty', list.length === 0);
  if (list.length === 0) {
    body.innerHTML = '<div class="wrongnote-empty">아직 틀린 문제가 없습니다.<br>모험을 시작하세요!</div>';
  } else {
    list.forEach(item => {
      const div = document.createElement('div');
      div.className = 'wrongnote-item';
      const title = item.title || item.text || '오답 문제';
      const criterion = item.criterionLabel ? '<div class="wrongnote-item-criterion">기준: ' + highlightNumbers(escapeHtml(item.criterionLabel)) + '</div>' : '';
      const examples = Array.isArray(item.examples) && item.examples.length
        ? '<div class="wrongnote-item-examples"><div class="wrongnote-item-examples-title">최근 오답 예시</div><div class="wrongnote-item-examples-list">' + item.examples.map(v => '<span class="wrongnote-example-chip">' + highlightNumbers(escapeHtml(v)) + '</span>').join('') + '</div></div>'
        : '';
      const meta = typeof item.wrongCount === 'number' ? '<div class="wrongnote-item-meta">누적 오답 ' + item.wrongCount + '회</div>' : '';
      const reason = item.reason ? '<div class="wrongnote-item-reason">' + formatReasonHtml(item.reason, 'wrongnote-item-label') + '</div>' : '';
      div.innerHTML = '<div class="wrongnote-item-title">' + highlightNumbers(escapeHtml(title)) + '</div>' + criterion + examples + meta + reason;
      body.appendChild(div);
    });
  }
  document.getElementById('wrongnote-popup').classList.add('show');
}

function closeWrongnote() {
  playUIClick();
  document.getElementById('wrongnote-popup').classList.remove('show');
}

function clearWrongnote() {
  playUIClick();
  showConfirmModal('오답노트 초기화', '오답노트를 모두 지우시겠습니까?', () => {
    WrongNote.clear();
    showWrongnote();
  });
}

function showSetting() {
  playUIClick();
  updateSettingUI();
  document.getElementById('setting-popup').classList.add('show');
}

function closeSetting() {
  playUIClick();
  document.getElementById('setting-popup').classList.remove('show');
}

function showStage1TutorialAndStart(onOk) {
  showAlertModal(
    '전투 안내',
    '상대의 주장을 확인한 뒤 <span class="tut-good">합격</span> 또는 <span class="tut-bad">불합격</span>을 판정하세요.<br><span class="tut-good">정답</span>이면 적 체력이 줄고, <span class="tut-bad">오답</span>이면 내 체력이 줄어듭니다.',
    () => {
      G.stage1TutorialShown = true;
      saveGame();
      if (onOk) onOk();
    }
  );
}

function startBattle() {
  playUIClick();
  document.getElementById('node-popup').classList.remove('show');
  const node = NODES[G.currentNode];
  const isBoss = node.type === 'boss';
  const encImg = document.getElementById('enc-enemy-img');
  const encBtn = document.getElementById('enc-battle-btn');
  const introBox = document.getElementById('boss-intro-box');
  const introText = document.getElementById('boss-intro-text');
  if (encImg) {
    encImg.style.animation = 'none';
    void encImg.offsetWidth;
    encImg.style.backgroundImage = 'url(' + (node.enemyImage || '') + ')';
    encImg.style.animation = 'enemy-img-appear 0.6s ease-out 0.1s forwards';
  }
  document.getElementById('enc-name').textContent = node.enemy;
  if (encBtn) {
    encBtn.style.display = 'none';
    encBtn.classList.remove('show');
  }
  if (isBoss && introBox && introText) {
    introText.textContent = node.bossLine || '마지막 시험이다.';
    introBox.style.display = 'block';
    introBox.onclick = () => {
      playUIClick();
      introBox.style.display = 'none';
      if (encBtn) encBtn.style.display = 'inline-block';
    };
  } else if (introBox) {
    introBox.style.display = 'none';
    introBox.onclick = null;
    setTimeout(() => {
      if (encBtn) encBtn.style.display = 'inline-block';
    }, 720);
  }
  showScreen('encounter-screen');
}

function doStartActualBattle() {
  resetNodeBattle(G.currentNode);
  const node = NODES[G.currentNode];
  const isBoss = node.type === 'boss';
  document.getElementById('battle-enemy-name').textContent = node.enemy;
  document.getElementById('battle-player-name').textContent = G.playerName || '용사';
  document.getElementById('battle-name-badge').textContent = node.enemy;
  const playerBadge = document.getElementById('battle-player-badge');
  if (playerBadge) playerBadge.textContent = G.playerName || '용사';

  const sprite = document.getElementById('battle-card-img');
  const spriteSrc = node.enemySprite || node.enemyImage;
  if (sprite) {
    if (spriteSrc) sprite.innerHTML = '<img src="' + spriteSrc + '" alt="' + escapeHtml(node.enemy) + '">';
    else sprite.innerHTML = '<div class="arena-fallback-enemy">' + escapeHtml(node.enemy) + '</div>';
  }
  const playerSprite = document.getElementById('arena-player-sprite');
  if (playerSprite) playerSprite.innerHTML = '<img src="images/player_back.png" alt="' + escapeHtml(G.playerName || '용사') + '">';

  const bubble = document.getElementById('speech-bubble');
  const enemyBadge = document.getElementById('battle-name-badge');
  if (isBoss) {
    if (bubble) bubble.classList.add('boss-bubble');
    if (enemyBadge) enemyBadge.innerHTML = '<span class="badge-name">' + escapeHtml(node.enemy) + '</span><span class="boss-inline-tag">BOSS</span>';
  } else {
    if (bubble) bubble.classList.remove('boss-bubble');
    if (enemyBadge) enemyBadge.textContent = node.enemy;
  }

  updatePlayerFlavorLine();
  renderHp();
  loadQuestion();
  showScreen('battle-screen');
  Sound.playBGM(isBoss ? 'bgm_boss' : 'bgm_battle');
}

function startActualBattle() {
  playUIClick();
  if (G.currentNode === 0 && !G.stage1TutorialShown) {
    showStage1TutorialAndStart(doStartActualBattle);
    return;
  }
  doStartActualBattle();
}

function renderHp() {
  const pFill = document.getElementById('player-hp-fill');
  const pText = document.getElementById('player-hp-text');
  const eFill = document.getElementById('enemy-hp-fill');
  const eText = document.getElementById('enemy-hp-text');
  const pRatio = Math.max(0, Math.min(1, G.hp / 3));
  const eRatio = Math.max(0, Math.min(1, G.enemyHp / G.enemyMaxHp));
  if (pFill) {
    pFill.style.width = (pRatio * 100) + '%';
    pFill.classList.remove('is-mid', 'is-low');
    if (pRatio <= 0.34) pFill.classList.add('is-low');
    else if (pRatio <= 0.67) pFill.classList.add('is-mid');
  }
  if (eFill) {
    eFill.style.width = (eRatio * 100) + '%';
    eFill.classList.remove('is-mid', 'is-low');
    if (eRatio <= 0.34) eFill.classList.add('is-low');
    else if (eRatio <= 0.67) eFill.classList.add('is-mid');
  }
  if (pText) pText.textContent = G.hp + ' / 3';
  if (eText) eText.textContent = G.enemyHp + ' / ' + G.enemyMaxHp;
}

function loadQuestion() {
  if (!G.shuffledQ.length) return;
  const q = G.shuffledQ[G.currentQ];
  const formatted = formatQuestion(q.text || '');
  document.getElementById('battle-question').innerHTML = highlightNumbers(escapeHtml(formatted)).replace(/\n/g, '<br>');
  document.getElementById('q-counter').textContent = '문제 ' + G.questionTurn;
  updatePlayerFlavorLine();
  document.querySelectorAll('#battle-screen .judge-btn').forEach(b => b.disabled = false);
}

function answer(choice) {
  playUIClick();
  if (G.pendingDamage) return;
  disableResultNext(false);
  document.querySelectorAll('#battle-screen .judge-btn').forEach(b => b.disabled = true);
  const q = G.shuffledQ[G.currentQ];
  const correct = choice === q.answer;
  const userJudge = choice === 'pass' ? '합격' : '불합격';
  const correctJudge = q.answer === 'pass' ? '합격' : '불합격';
  const box = document.getElementById('result-box');
  box.className = 'result-box popup-panel ' + (correct ? 'correct' : 'wrong');
  document.getElementById('result-badge').textContent = '채점 결과';
  document.getElementById('result-title').textContent = correct ? '정답!' : '오답!';
  document.getElementById('result-answer').innerHTML = '당신의 판정: <span class="judge-word ' + (userJudge === '합격' ? 'pass' : 'fail') + '">' + userJudge + '</span>';
  let reasonText = String(q.reason || '').trim();
  const suffix = correct ? (correctJudge + '이 맞습니다.') : (correctJudge + '이 정답입니다.');
  if (!reasonText) reasonText = suffix;
  else if (!reasonText.includes(correctJudge)) reasonText = reasonText.replace(/[.。!?！？]?$/, '') + '. ' + suffix;
  document.getElementById('result-reason').innerHTML = formatReasonHtml(reasonText);
  document.getElementById('result-popup').classList.add('show');
  G.pendingDamage = true;
  G.pendingDamageOutcome = correct;
  if (correct) {
    G.correct++;
    G.totalCorrect++;
    Sound.playSE('se_correct');
  } else {
    G.wrong++;
    G.totalWrong++;
    WrongNote.add(q);
    Sound.playSE('se_wrong');
  }
}

function applyBattleDamageEffects(correct) {
  const arena = document.getElementById('battle-arena-area');
  if (correct) {
    G.enemyHp = Math.max(0, G.enemyHp - 1);
    if (arena) arena.classList.add('enemy-hit-flash');
    Sound.playSE('se_hit');
    Sound.playSE('se_stamp');
    setTimeout(() => { if (arena) arena.classList.remove('enemy-hit-flash'); }, 420);
  } else {
    G.hp = Math.max(0, G.hp - 1);
    if (arena) arena.classList.add('player-hit-flash');
    const screen = document.getElementById('battle-screen');
    if (screen) screen.classList.add('shake');
    Sound.playSE('se_hit');
    setTimeout(() => {
      if (arena) arena.classList.remove('player-hit-flash');
      if (screen) screen.classList.remove('shake');
    }, 420);
  }
  renderHp();
}

function finalizeAfterDamage() {
  G.pendingDamage = false;
  G.pendingDamageOutcome = null;
  if (G.hp <= 0) {
    Sound.playSE('se_gameover');
    Sound.stopBGM();
    showScreen('gameover-screen');
    return;
  }
  if (G.enemyHp <= 0) {
    stageClear();
    return;
  }
  G.currentQ++;
  G.questionTurn++;
  if (G.currentQ >= G.shuffledQ.length) {
    G.shuffledQ = shuffle(NODES[G.currentNode].questions || []);
    G.currentQ = 0;
  }
  loadQuestion();
}

function nextQuestion() {
  playUIClick();
  if (!G.pendingDamage || G.pendingDamageOutcome === null) return;
  const correct = G.pendingDamageOutcome;
  G.pendingDamageOutcome = null;
  document.getElementById('result-popup').classList.remove('show');
  disableResultNext(true);
  if (G.damageTimer) clearTimeout(G.damageTimer);
  G.damageTimer = setTimeout(() => {
    applyBattleDamageEffects(correct);
    G.damageTimer = setTimeout(() => finalizeAfterDamage(), 460);
  }, 30);
}

function showExitConfirm() { playUIClick(); document.getElementById('exit-confirm').classList.add('show'); }
function hideExitConfirm() { playUIClick(); document.getElementById('exit-confirm').classList.remove('show'); }

function exitToMap() {
  playUIClick();
  document.getElementById('exit-confirm').classList.remove('show');
  document.getElementById('result-popup').classList.remove('show');
  Sound.stopBGM();
  Sound.playBGM('bgm_title');
  showScreen('map-screen');
  renderMap();
}

function stageClear() {
  if (G.damageTimer) { clearTimeout(G.damageTimer); G.damageTimer = null; }
  G.pendingDamage = false;
  G.nodeStatus[G.currentNode] = 'cleared';
  if (G.currentNode + 1 < NODES.length && G.nodeStatus[G.currentNode + 1] === 'locked') {
    G.nodeStatus[G.currentNode + 1] = 'available';
  }
  saveGame();
  Sound.playSE('se_clear');
  Sound.stopBGM();
  const node = NODES[G.currentNode];
  const isLast = G.currentNode === NODES.length - 1;
  document.getElementById('clear-title').textContent = isLast ? '최종 보스 격파!' : node.label + ' 클리어!';
  document.getElementById('clear-sub').textContent = isLast ? '왕국의 질서가 되찾아졌다!' : '다음 지역으로 나아가자!';
  document.getElementById('cs-correct').textContent = G.correct + '개';
  document.getElementById('cs-wrong').textContent = G.wrong + '개';
  const hpRow = document.getElementById('clear-hp-row');
  if (hpRow) hpRow.style.display = 'none';
  const clearBtn = document.getElementById('clear-return-btn');
  if (clearBtn) clearBtn.textContent = isLast ? '엔딩 보기' : '지도로 돌아가기';
  showScreen('clear-screen');
}

function afterClear() {
  playUIClick();
  if (G.currentNode === NODES.length - 1) showEnding();
  else {
    showScreen('map-screen');
    renderMap();
    Sound.playBGM('bgm_title');
  }
}

function retryNode() {
  playUIClick();
  showScreen('map-screen');
  renderMap();
  Sound.playBGM('bgm_title');
}

function buildStudyPool() {
  const all = [];
  NODES.forEach((node, nodeIdx) => {
    (node.questions || []).forEach((q, qIdx) => {
      all.push({ ...q, _nodeIdx: nodeIdx, _qIdx: qIdx, _nodeLabel: node.label.split('\n').join(' '), _enemy: node.enemy });
    });
  });
  return shuffle(all);
}

function updateStudyStats() {
  const total = STUDY.correct + STUDY.wrong;
  const rateText = total ? (Math.round((STUDY.correct / total) * 100) + '%') : '- %';
  const inline = document.getElementById('study-stats-inline');
  if (inline) inline.innerHTML = '정답 ' + STUDY.correct + ' · 오답 ' + STUDY.wrong + '<br>정답률 ' + rateText;
}

function showStudyQuestion() {
  if (!STUDY.pool.length) STUDY.pool = buildStudyPool();
  if (STUDY.idx >= STUDY.pool.length) {
    STUDY.pool = buildStudyPool();
    STUDY.idx = 0;
  }
  STUDY.current = STUDY.pool[STUDY.idx++];
  document.getElementById('study-counter').textContent = '문제 ' + STUDY.turn;
  const stageEl = document.getElementById('study-question-stage');
  if (stageEl) stageEl.textContent = '';
  const studyBody = STUDY.current.studyText || STUDY.current.text || '';
  document.getElementById('study-question').innerHTML = formatStudyQuestionHtml(studyBody);
  const box = document.getElementById('study-result-box');
  box.classList.remove('show', 'correct', 'wrong');
  document.getElementById('study-pass-btn').disabled = false;
  document.getElementById('study-fail-btn').disabled = false;
  updateStudyStats();
}

function startStudyMode() {
  playUIClick();
  STUDY.active = true;
  STUDY.pool = buildStudyPool();
  STUDY.idx = 0;
  STUDY.turn = 1;
  STUDY.correct = 0;
  STUDY.wrong = 0;
  STUDY.current = null;
  showScreen('study-screen');
  showStudyQuestion();
  Sound.playBGM('bgm_study');
}

function exitStudyMode() {
  playUIClick();
  showConfirmModal('집중 공부 종료', '집중 공부를 종료하고 타이틀로 돌아가시겠습니까?', () => {
    STUDY.active = false;
    showScreen('title-screen');
    initTitle();
  });
}

function answerStudy(choice) {
  playUIClick();
  if (!STUDY.active || !STUDY.current) return;
  document.getElementById('study-pass-btn').disabled = true;
  document.getElementById('study-fail-btn').disabled = true;
  const correct = choice === STUDY.current.answer;
  const userJudge = choice === 'pass' ? '합격' : '불합격';
  const correctJudge = STUDY.current.answer === 'pass' ? '합격' : '불합격';
  if (correct) {
    STUDY.correct++;
    Sound.playSE('se_correct');
  } else {
    STUDY.wrong++;
    WrongNote.add(STUDY.current);
    Sound.playSE('se_wrong');
  }
  const box = document.getElementById('study-result-box');
  box.className = 'study-result-box show ' + (correct ? 'correct' : 'wrong');
  document.getElementById('study-result-title').textContent = correct ? '정답!' : '오답!';
  document.getElementById('study-result-answer').innerHTML = '당신의 판정: <span class="judge-word ' + (userJudge === '합격' ? 'pass' : 'fail') + '">' + userJudge + '</span>';
  let reasonText = String(STUDY.current.reason || '').trim();
  const suffix = correct ? (correctJudge + '이 맞습니다.') : (correctJudge + '이 정답입니다.');
  if (!reasonText) reasonText = suffix;
  else if (!reasonText.includes(correctJudge)) reasonText = reasonText.replace(/[.。!?！？]?$/, '') + '. ' + suffix;
  document.getElementById('study-result-reason').innerHTML = formatReasonHtml(reasonText, 'study-reason-label');
  updateStudyStats();
}

function nextStudyQuestion() {
  playUIClick();
  if (!STUDY.active) return;
  STUDY.turn++;
  showStudyQuestion();
}

function endingRenderLine(line) {
  return escapeHtml(line).replace(/\n/g, '<br>').replace(/__NAME__/g, '<span class="ending-player-name">' + escapeHtml(G.playerName || '용사') + '</span>');
}

function endingTypeLine(line) {
  clearTimeout(endingTypingTimer);
  endingTyping = true;
  endingFullLine = line;
  const plain = line.replace(/__NAME__/g, G.playerName || '용사');
  const textEl = document.getElementById('ending-text');
  if (!textEl) { endingTyping = false; return; }
  let i = 0;
  textEl.innerHTML = '';
  function tick() {
    textEl.innerHTML = escapeHtml(plain.slice(0, i)).replace(/\n/g, '<br>');
    i++;
    if (i <= plain.length) endingTypingTimer = setTimeout(tick, 28);
    else {
      textEl.innerHTML = endingRenderLine(line);
      endingTyping = false;
    }
  }
  tick();
}

function setEndingBackground(idx) {
  const layer = document.getElementById('ending-bg-layer');
  const flash = document.getElementById('ending-flash');
  if (!layer) return;
  const scene = ENDING_SCENES[idx];
  layer.style.background = scene.fallback;
  layer.style.backgroundSize = 'cover';
  layer.style.backgroundPosition = 'center center';
  layer.style.backgroundRepeat = 'no-repeat';
  const img = new Image();
  img.onload = () => {
    layer.style.background = 'url("' + scene.image + '"), ' + scene.fallback;
    layer.style.backgroundSize = 'cover, cover';
    layer.style.backgroundPosition = 'center center, center center';
    layer.style.backgroundRepeat = 'no-repeat, no-repeat';
  };
  img.src = scene.image;
  if (flash && idx > 0) {
    flash.classList.remove('show');
    void flash.offsetWidth;
    flash.classList.add('show');
  }
}

function endingSetScene(idx, immediate = false) {
  const layer = document.getElementById('ending-bg-layer');
  if (!layer) { setEndingBackground(idx); return; }
  if (immediate) {
    setEndingBackground(idx);
    layer.classList.remove('wipe-in', 'wipe-out');
    layer.style.webkitMaskImage = 'none';
    layer.style.maskImage = 'none';
    return;
  }
  layer.classList.remove('wipe-in');
  layer.classList.add('wipe-out');
  setTimeout(() => {
    setEndingBackground(idx);
    layer.classList.remove('wipe-out');
    layer.classList.add('wipe-in');
    setTimeout(() => {
      layer.classList.remove('wipe-in', 'wipe-out');
      layer.style.webkitMaskImage = 'none';
      layer.style.maskImage = 'none';
    }, 620);
  }, 240);
}

function endingShowLine() { endingTypeLine(ENDING_SCENES[endingSceneIdx].lines[endingLineIdx]); }

function buildEndingParticles() {
  const wrap = document.getElementById('ending-particles');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.className = 'ending-particle';
    p.style.left = (Math.random() * 100) + '%';
    p.style.bottom = (-20 - Math.random() * 80) + 'px';
    p.style.animationDelay = (Math.random() * 4) + 's';
    p.style.animationDuration = (4 + Math.random() * 5) + 's';
    if (Math.random() > 0.7) {
      p.style.width = '2px';
      p.style.height = '2px';
    }
    wrap.appendChild(p);
  }
}

function buildEndingRankParticles() {
  const wrap = document.getElementById('ending-rank-particles');
  if (wrap) {
    wrap.innerHTML = '';
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'ending-rank-particle';
      p.style.left = (8 + Math.random() * 84) + '%';
      p.style.top = (4 + Math.random() * 88) + '%';
      p.style.animationDelay = (Math.random() * 2.5) + 's';
      p.style.animationDuration = (2.8 + Math.random() * 2.2) + 's';
      wrap.appendChild(p);
    }
  }
  const modal = document.getElementById('ending-rank-modal');
  if (!modal) return;
  let bg = document.getElementById('ending-rank-bg-particles');
  if (!bg) {
    bg = document.createElement('div');
    bg.id = 'ending-rank-bg-particles';
    bg.className = 'ending-rank-bg-particles';
    modal.prepend(bg);
  }
  bg.innerHTML = '';
  for (let i = 0; i < 92; i++) {
    const p = document.createElement('div');
    p.className = 'ending-rank-bg-particle';
    p.style.left = (Math.random() * 100) + '%';
    p.style.top = (Math.random() * 100) + '%';
    p.style.animationDelay = (Math.random() * 2.8) + 's';
    p.style.animationDuration = (3.6 + Math.random() * 3.2) + 's';
    const size = Math.random() > 0.7 ? 4 : (Math.random() > 0.35 ? 3 : 2);
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    bg.appendChild(p);
  }
}

function buildEndingRankData() {
  const total = G.totalCorrect + G.totalWrong;
  const rate = total ? Math.round((G.totalCorrect / total) * 100) : 0;
  let grade = 'C';
  let title = '예비 종자검사원';
  let desc = '조금 더 많은 기준을 익히면 훌륭한 검사원이 될 수 있습니다.';
  if (rate >= 95) {
    grade = 'S';
    title = '전설의 종자검사원';
    desc = '완벽에 가까운 판정으로 왕국의 질서를 되찾았습니다.';
  } else if (rate >= 85) {
    grade = 'A';
    title = '정식 종자검사원';
    desc = '탁월한 판정으로 왕국의 질서를 바로 세웠습니다.';
  } else if (rate >= 70) {
    grade = 'B';
    title = '숙련 검사원';
    desc = '충분한 실력을 보여 주었습니다. 이제 더 정교한 판정이 필요합니다.';
  }
  endingRankData = { grade, title, desc, rate };
}

function showEndingRankPopup() {
  if (!endingRankData) buildEndingRankData();
  const modal = document.getElementById('ending-rank-modal');
  document.getElementById('ending-rank-grade').textContent = endingRankData.grade;
  document.getElementById('ending-rank-name').textContent = (G.playerName || '용사') + ' · ' + endingRankData.title;
  document.getElementById('ending-stat-correct').textContent = G.totalCorrect + '개';
  document.getElementById('ending-stat-wrong').textContent = G.totalWrong + '개';
  document.getElementById('ending-stat-rate').textContent = endingRankData.rate + '%';
  document.getElementById('ending-rank-desc').textContent = endingRankData.desc;
  buildEndingRankParticles();
  if (modal) {
    modal.classList.add('show');
    modal.classList.add('ending-rank-standalone');
  }
  endingRankPopupShown = true;
}

function endingSkipToRank() {
  if (!endingRankData) buildEndingRankData();
  endingTyping = false;
  endingAwaitingRank = false;
  const textEl = document.getElementById('ending-text');
  if (textEl) textEl.innerHTML = '';
  const btn = document.getElementById('ending-rank-trigger');
  const arrow = document.getElementById('ending-arrow');
  if (btn) btn.style.display = 'none';
  if (arrow) arrow.style.visibility = 'hidden';
  showEndingRankPopup();
}

function endingFinish() {
  endingAwaitingRank = true;
  const btn = document.getElementById('ending-rank-trigger');
  const arrow = document.getElementById('ending-arrow');
  if (btn) btn.style.display = 'block';
  if (arrow) arrow.style.visibility = 'hidden';
}

function endingNextStep() {
  if (endingRankPopupShown) return;
  if (endingTyping) {
    clearTimeout(endingTypingTimer);
    const textEl = document.getElementById('ending-text');
    if (textEl) textEl.innerHTML = endingRenderLine(endingFullLine);
    endingTyping = false;
    return;
  }
  if (endingAwaitingRank) {
    showEndingRankPopup();
    return;
  }
  const scene = ENDING_SCENES[endingSceneIdx];
  if (endingLineIdx < scene.lines.length - 1) {
    endingLineIdx++;
    endingShowLine();
    return;
  }
  if (endingSceneIdx < ENDING_SCENES.length - 1) {
    endingSceneIdx++;
    endingLineIdx = 0;
    endingSetScene(endingSceneIdx);
    endingShowLine();
    return;
  }
  endingFinish();
}

function showEnding() {
  if (G.damageTimer) { clearTimeout(G.damageTimer); G.damageTimer = null; }
  G.pendingDamage = false;
  endingSceneIdx = 0;
  endingLineIdx = 0;
  endingTyping = false;
  endingAwaitingRank = false;
  endingRankPopupShown = false;
  buildEndingRankData();
  buildEndingParticles();
  const rankModal = document.getElementById('ending-rank-modal');
  const rankBtn = document.getElementById('ending-rank-trigger');
  const arrow = document.getElementById('ending-arrow');
  if (rankModal) rankModal.classList.remove('show');
  const rankParticles = document.getElementById('ending-rank-particles');
  if (rankParticles) rankParticles.innerHTML = '';
  if (rankBtn) rankBtn.style.display = 'none';
  if (arrow) arrow.style.visibility = 'visible';
  showScreen('ending-screen');
  endingSetScene(0, true);
  endingShowLine();
  Sound.playBGM('bgm_ending');
}

document.addEventListener('DOMContentLoaded', () => {
  Sound.loadSettings();
  const saved = loadSave();
  if (saved && saved.playerName) {
    G.playerName = saved.playerName || '용사';
    G.nodeStatus = normalizeNodeStatus(saved.nodeStatus);
    G.totalCorrect = saved.totalCorrect || 0;
    G.totalWrong = saved.totalWrong || 0;
    G.stage1TutorialShown = !!saved.stage1TutorialShown;
  }

  const opTap = document.getElementById('op-tap');
  if (opTap) opTap.onclick = opNextStep;
  const opSkip = document.getElementById('op-skip');
  if (opSkip) opSkip.onclick = opSkipAll;
  const endingWrap = document.getElementById('ending-scene-wrap');
  if (endingWrap) {
    endingWrap.addEventListener('click', (e) => {
      const modal = document.getElementById('ending-rank-modal');
      if (modal && modal.classList.contains('show')) return;
      if (e.target && (e.target.id === 'ending-home' || e.target.id === 'ending-skip' || e.target.id === 'ending-rank-trigger')) return;
      endingNextStep();
    });
  }
  const rankModal = document.getElementById('ending-rank-modal');
  if (rankModal) {
    rankModal.addEventListener('click', (e) => {
      if (e.target === rankModal) rankModal.classList.remove('show');
    });
  }
  initTitle();
});
