// ============================================================
// game.js - 나는야 종자검사원 게임 로직
// ============================================================

// ==============================
// 설정 (사운드 파일 경로)
// 나중에 파일 첨부 시 경로 변경하세요.
// ==============================
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

// ==============================
// 사운드 시스템
// ==============================
const Sound = (() => {
  let bgmEl = null;
  let currentBgmKey = null;
  const settings = { bgm: true, se: true, bgmVolume: 0.5, seVolume: 0.7 };

  function loadSettings() {
    try {
      const s = localStorage.getItem('seedGame_sound');
      if (s) Object.assign(settings, JSON.parse(s));
    } catch(e) {}
  }

  function saveSettings() {
    try { localStorage.setItem('seedGame_sound', JSON.stringify(settings)); } catch(e) {}
  }

  function playBGM(key) {
    if (!key) return;
    currentBgmKey = key;
    if (!settings.bgm) return;
    if (bgmEl && bgmEl.dataset && bgmEl.dataset.key === key) {
      bgmEl.volume = settings.bgmVolume ?? 0.5;
      if (bgmEl.paused) bgmEl.play().catch(()=>{});
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
      bgmEl.play().catch(()=>{});
    } catch(e) {}
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
      a.play().catch(()=>{});
    } catch(e) {}
  }

  function toggleBGM() {
    settings.bgm = !settings.bgm;
    if (!settings.bgm) {
      stopBGM();
    } else if (currentBgmKey) {
      playBGM(currentBgmKey);
    }
    saveSettings();
    return settings.bgm;
  }

  function toggleSE() {
    settings.se = !settings.se;
    saveSettings();
    return settings.se;
  }

  function isBGMOn() { return settings.bgm; }
  function isSEOn()  { return settings.se; }

  function setBGMVol(val) {
    const v = parseInt(val, 10) / 100;
    settings.bgmVolume = v;
    settings.bgm = v > 0;
    if (bgmEl) {
      bgmEl.volume = v;
      if (!settings.bgm) bgmEl.pause();
      else bgmEl.play().catch(()=>{});
    } else if (settings.bgm && currentBgmKey) {
      playBGM(currentBgmKey);
    }
    const el = document.getElementById('bgm-val');
    if (el) el.textContent = val;
    saveSettings();
  }

  function setSEVol(val) {
    const v = parseInt(val, 10) / 100;
    settings.se = v > 0;
    settings.seVolume = v;
    const el = document.getElementById('se-val');
    if (el) el.textContent = val;
    saveSettings();
  }

  return { playBGM, stopBGM, playSE, toggleBGM, toggleSE, isBGMOn, isSEOn, loadSettings, setBGMVol, setSEVol };
})();

// ==============================
// 오답노트 저장소
// ==============================
const WrongNote = (() => {
  const KEY = 'seedGame_wrongnote';

  function normalize(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.map((item, idx) => {
      if (item && item.ruleKey && item.groupTitle) return item;
      if (item && item.text) {
        const legacyText = cleanStudyText(item.text || '');
        return {
          ruleKey: 'legacy:' + idx + ':' + legacyText,
          groupTitle: legacyText || '기존 오답',
          guideText: item.reason || '',
          recentExamples: legacyText ? [legacyText] : [],
          sampleReason: item.reason || '',
          noteMode: item.uiMode === 'ox' ? 'ox' : 'judge',
          updatedAt: Date.now() - idx
        };
      }
      return null;
    }).filter(Boolean).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  function load() {
    try { return normalize(JSON.parse(localStorage.getItem(KEY)) || []); } catch(e) { return []; }
  }

  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch(e) {}
  }

  function add(q) {
    const list = load();
    const ruleKey = q.ruleKey || q.mistakeType || cleanStudyText(q.studyText || q.text || '');
    const groupTitle = q.mistakeType || cleanStudyText((q.studyText || q.text || '').split(/\n+/)[0] || '오답 유형');
    const guideText = q.ruleSummary || (String(q.reason || '').split(/\n\n+/)[0] || '');
    const exampleText = cleanStudyText(q.noteExample || q.studyText || q.text || '');
    const sampleReason = q.reason || '';
    const noteMode = q.uiMode === 'ox' ? 'ox' : 'judge';
    const now = Date.now();

    let item = list.find(entry => entry.ruleKey === ruleKey);
    if (!item) {
      item = {
        ruleKey,
        groupTitle,
        guideText,
        recentExamples: [],
        sampleReason,
        noteMode,
        updatedAt: now
      };
      list.unshift(item);
    }

    item.groupTitle = groupTitle;
    item.guideText = guideText || item.guideText || '';
    item.sampleReason = sampleReason || item.sampleReason || '';
    item.noteMode = noteMode;
    item.updatedAt = now;

    if (exampleText) {
      item.recentExamples = [exampleText].concat((item.recentExamples || []).filter(v => v !== exampleText)).slice(0, 3);
    }

    list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    if (list.length > 50) list.length = 50;
    save(list);
  }

  function clear() { save([]); }

  return { load, add, clear };
})();

// ==============================
// 게임 상태
// ==============================
let G = {
  playerName: '',
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

// ==============================
// 저장 / 불러오기
// ==============================

function normalizeNodeStatus(statuses) {
  const norm = Array.isArray(statuses) ? statuses.slice(0, NODES.length) : [];
  while (norm.length < NODES.length) norm.push('locked');
  const progressed = new Set(['available','cleared']);
  let furthest = -1;
  for (let i = 0; i < norm.length; i++) {
    if (progressed.has(norm[i])) furthest = i;
  }
  if (furthest < 0) {
    norm.fill('locked');
    norm[0] = 'available';
    return norm;
  }
  for (let i = 0; i < furthest; i++) {
    norm[i] = 'cleared';
  }
  if (norm[furthest] !== 'cleared') norm[furthest] = 'available';
  for (let i = furthest + 1; i < norm.length; i++) {
    if (norm[i] !== 'cleared') norm[i] = 'locked';
  }
  if (furthest === norm.length - 1 && norm[furthest] !== 'cleared') {
    norm[furthest] = 'available';
  }
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
  } catch(e) {}
}

function loadSave() {
  try {
    const raw = localStorage.getItem('seedGame_v3');
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function resetWholeGame() {
  G = {
    playerName: '',
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
  G.shuffledQ = shuffle([...NODES[idx].questions]);
}

// ==============================
// 유틸
// ==============================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function hpStr(hp) {
  let s = '';
  for (let i = 0; i < hp; i++) s += '🌾';
  return s || '없음';
}

function highlightNumbers(text) {
  return String(text).replace(/(\d+(?:\.\d+)?(?:%|m))/g, '<span class="highlight">$1</span>');
}

function formatQuestion(text) {
  return String(text).replace(/([.?!~…])\s+/g, '$1\n');
}


function splitLeadLabel(text) {
  const clean = cleanStudyText(text);
  const lines = clean.split(/\n+/).map(v => v.trim()).filter(Boolean);
  if (!lines.length) return { label: '', bodyLines: [] };
  if (lines.length > 1) return { label: lines[0], bodyLines: lines.slice(1) };
  const single = lines[0];
  const legacy = single.match(/^(\([^)]+\)\s*[^.?!~…]+?)\.\s+(.+)$/);
  if (legacy) return { label: legacy[1].trim(), bodyLines: [legacy[2].trim()] };
  return { label: '', bodyLines: [single] };
}

function formatStudyQuestionHtml(text) {
  const parts = splitLeadLabel(text);
  const chunks = [];
  if (parts.label) {
    chunks.push('<div class="study-line-label">' + highlightNumbers(escapeHtml(parts.label)) + '</div>');
  }
  parts.bodyLines.forEach(line => {
    chunks.push('<div class="study-line-body">' + highlightNumbers(escapeHtml(line)) + '</div>');
  });
  return chunks.join('');
}

function formatBattleQuestionHtml(question) {
  const q = question || {};
  const chunks = [];
  const labelInfo = q.studyText ? splitLeadLabel(q.studyText) : { label: '', bodyLines: [] };
  if (labelInfo.label) {
    let bodySource = String(q.storyText || q.text || '').trim();
    const escapedLabel = labelInfo.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    bodySource = bodySource.replace(new RegExp('\\s*' + escapedLabel + '\\s*'), ' ').trim();
    if (bodySource.startsWith(labelInfo.label)) {
      bodySource = bodySource.slice(labelInfo.label.length).replace(/^[\s.。]+/, '');
    }
    const bodyLines = formatQuestion(bodySource).split(/\n+/).map(v => v.trim()).filter(Boolean);
    chunks.push('<div class="battle-line-label">' + highlightNumbers(escapeHtml(labelInfo.label)) + '</div>');
    bodyLines.forEach(line => {
      chunks.push('<div class="battle-line-body">' + highlightNumbers(escapeHtml(line)) + '</div>');
    });
    return chunks.join('');
  }
  return formatQuestion(String(q.storyText || q.text || '')).split(/\n+/).map(v => v.trim()).filter(Boolean)
    .map(line => '<div class="battle-line-body">' + highlightNumbers(escapeHtml(line)) + '</div>').join('');
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
    if (/^\(?참고\)/.test(line)) {
      inRefs = true;
      const refLine = line.replace(/^\(?참고\)\s*/, '').trim();
      chunks.push('<div class="reason-ref-title">참고)</div>');
      if (refLine) chunks.push('<div class="reason-ref-line">' + highlightNumbers(escapeHtml(refLine)) + '</div>');
      continue;
    }
    const cls = inRefs ? 'reason-ref-line' : 'reason-main-line';
    chunks.push('<div class="' + cls + '">' + highlightNumbers(escapeHtml(line)) + '</div>');
  }
  return chunks.join('');
}


const PLAYER_FLAVOR_LINES = ['........', '.....네?', '확인해 볼게요.', '뭐라구요?'];

function getRandomPlayerFlavor() {
  return PLAYER_FLAVOR_LINES[Math.floor(Math.random() * PLAYER_FLAVOR_LINES.length)];
}

function updatePlayerFlavorLine() {
  const lineEl = document.getElementById('battle-player-line');
  if (lineEl) lineEl.textContent = getRandomPlayerFlavor();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

let uiModalOk = null;
let uiModalCancel = null;

function closeUIModal() {
  const modal = document.getElementById('ui-modal');
  if (modal) modal.classList.remove('show');
  uiModalOk = null;
  uiModalCancel = null;
}

function playUIClick() {
  Sound.playSE('se_click');
}

function disableResultNext(disabled) {
  const nextBtn = document.querySelector('.result-next-btn');
  if (nextBtn) nextBtn.disabled = !!disabled;
}


const STUDY = {
  active: false,
  pool: [],
  idx: 0,
  turn: 1,
  correct: 0,
  wrong: 0,
  current: null
};

function isOxQuestion(q) {
  return !!(q && q.uiMode === 'ox');
}

function getChoiceLabel(choice, q) {
  if (isOxQuestion(q)) return choice === 'pass' ? 'O' : 'X';
  return choice === 'pass' ? '합격' : '불합격';
}

function getChoiceResultSuffix(choice, q, correct) {
  const label = getChoiceLabel(choice, q);
  if (isOxQuestion(q)) return correct ? (label + '가 맞습니다.') : (label + '가 정답입니다.');
  return correct ? (label + '이 맞습니다.') : (label + '이 정답입니다.');
}

function updateJudgeButtonsForQuestion(q, scope) {
  const ox = isOxQuestion(q);
  if (scope === 'study') {
    const passLabel = document.querySelector('#study-screen .btn-pass .judge-label');
    const failLabel = document.querySelector('#study-screen .btn-fail .judge-label');
    const passBtn = document.getElementById('study-pass-btn');
    const failBtn = document.getElementById('study-fail-btn');
    const prompt = document.querySelector('#study-screen .study-prompt');
    if (passLabel) passLabel.textContent = ox ? 'O' : '합격';
    if (failLabel) failLabel.textContent = ox ? 'X' : '불합격';
    if (passBtn) passBtn.classList.toggle('is-ox-mode', ox);
    if (failBtn) failBtn.classList.toggle('is-ox-mode', ox);
    if (prompt) prompt.innerHTML = ox
      ? '다음 진술을 보고 <span class="tut-good">O</span> 또는 <span class="tut-bad">X</span>를 고르세요.'
      : '다음 내용을 보고 <span class="tut-good">합격</span> 또는 <span class="tut-bad">불합격</span>을 판정하세요.';
    return;
  }
  const passLabel = document.querySelector('#battle-screen .btn-pass .judge-label');
  const failLabel = document.querySelector('#battle-screen .btn-fail .judge-label');
  const passBtn = document.querySelector('#battle-screen .btn-pass');
  const failBtn = document.querySelector('#battle-screen .btn-fail');
  if (passLabel) passLabel.textContent = ox ? 'O' : '합격';
  if (failLabel) failLabel.textContent = ox ? 'X' : '불합격';
  if (passBtn) passBtn.classList.toggle('is-ox-mode', ox);
  if (failBtn) failBtn.classList.toggle('is-ox-mode', ox);
}

function buildStudyPool() {
  const all = [];
  NODES.forEach((node, nodeIdx) => {
    node.questions.forEach((q, qIdx) => {
      all.push({ ...q, _nodeIdx: nodeIdx, _qIdx: qIdx, _nodeLabel: node.label.split('\n').join(' '), _enemy: node.enemy });
    });
  });
  return shuffle(all);
}

function cleanStudyText(text) {
  return String(text || '').replace(/^\s*["“”']+/, '').replace(/["“”']+\s*$/, '');
}


const BATTLE_SPRITE_TUNING = {
  enemy: {
    default: { scale: 1.16, x: '0px', y: '2px' },
    0: { scale: 1.18, x: '0px', y: '4px' },
    1: { scale: 1.16, x: '0px', y: '4px' },
    2: { scale: 1.17, x: '0px', y: '4px' },
    3: { scale: 1.24, x: '0px', y: '6px' },
    4: { scale: 1.22, x: '0px', y: '5px' },
    5: { scale: 1.30, x: '-4px', y: '8px' }
  },
  player: {
    default: { scale: 1.18, x: '0px', y: '4px' }
  }
};

function applySpriteVars(el, conf) {
  if (!el) return;
  const scale = conf && conf.scale != null ? conf.scale : 1;
  const x = conf && conf.x != null ? conf.x : '0px';
  const y = conf && conf.y != null ? conf.y : '0px';
  el.style.setProperty('--sprite-scale', String(scale));
  el.style.setProperty('--sprite-shift-x', x);
  el.style.setProperty('--sprite-shift-y', y);
}

function applyBattleSpriteTuning(node) {
  const enemyEl = document.getElementById('battle-card-img');
  const playerEl = document.getElementById('arena-player-sprite');
  const enemyConf = (BATTLE_SPRITE_TUNING.enemy && (BATTLE_SPRITE_TUNING.enemy[node.id] || BATTLE_SPRITE_TUNING.enemy.default)) || { scale: 1 };
  const playerConf = (BATTLE_SPRITE_TUNING.player && (BATTLE_SPRITE_TUNING.player[node.id] || BATTLE_SPRITE_TUNING.player.default)) || { scale: 1 };
  applySpriteVars(enemyEl, enemyConf);
  applySpriteVars(playerEl, playerConf);
}

function updateStudyStats() {
  const total = STUDY.correct + STUDY.wrong;
  const rateText = total ? `${Math.round((STUDY.correct / total) * 100)}%` : '- %';
  const inline = document.getElementById('study-stats-inline');
  if (inline) inline.innerHTML = `정답 ${STUDY.correct} · 오답 ${STUDY.wrong}<br>정답률 ${rateText}`;
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
  const studyBody = STUDY.current.studyText || STUDY.current.text;
  updateJudgeButtonsForQuestion(STUDY.current, 'study');
  document.getElementById('study-question').innerHTML = formatStudyQuestionHtml(studyBody);
  document.getElementById('study-result-box').classList.remove('show', 'correct', 'wrong');
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
    initTitle();
    showScreen('title-screen');
  });
}

function answerStudy(choice) {
  playUIClick();
  if (!STUDY.active || !STUDY.current) return;
  document.getElementById('study-pass-btn').disabled = true;
  document.getElementById('study-fail-btn').disabled = true;
  const correct = choice === STUDY.current.answer;
  const userJudge = getChoiceLabel(choice, STUDY.current);
  const correctJudge = getChoiceLabel(STUDY.current.answer, STUDY.current);
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
  document.getElementById('study-result-answer').innerHTML = '당신의 판정: <span class="judge-word ' + (choice === 'pass' ? 'pass' : 'fail') + '">' + userJudge + '</span>';
  let reasonText = (STUDY.current.reason || '').trim();
  const suffix = getChoiceResultSuffix(STUDY.current.answer, STUDY.current, correct);
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

function handlePrimaryAction() {
  const saved = loadSave();
  if (saved && saved.playerName) continueGame();
  else goToNameInput();
}

function applyBattleDamageEffects(correct) {
  const stamp = document.getElementById('stamp-effect');
  const arena = document.getElementById('battle-arena-area');
  if (correct) {
    G.enemyHp = Math.max(0, G.enemyHp - 1);
    const sprite = document.getElementById('battle-card-img');
    if (sprite) sprite.classList.add('shake', 'hit-slam');
    if (arena) arena.classList.add('enemy-hit-flash');
    Sound.playSE('se_hit');
    Sound.playSE('se_stamp');
    setTimeout(() => {
      if (sprite) sprite.classList.remove('shake', 'hit-slam');
      if (arena) arena.classList.remove('enemy-hit-flash');
    }, 460);
  } else {
    G.hp = Math.max(0, G.hp - 1);
    const screen = document.getElementById('battle-screen');
    const playerSprite = document.getElementById('arena-player-sprite');
    if (screen) screen.classList.add('shake');
    if (playerSprite) playerSprite.classList.add('hit-slam');
    if (arena) arena.classList.add('player-hit-flash');
    Sound.playSE('se_hit');
    setTimeout(() => {
      if (screen) screen.classList.remove('shake');
      if (playerSprite) playerSprite.classList.remove('hit-slam');
      if (arena) arena.classList.remove('player-hit-flash');
    }, 420);
  }
  renderHp();
  G.damageTimer = null;
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
    G.shuffledQ = shuffle([...NODES[G.currentNode].questions]);
    G.currentQ = 0;
  }
  loadQuestion();
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
  cancelBtn.onclick = () => {
    playUIClick();
    closeUIModal();
  };
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


// ==============================
// TITLE
// ==============================
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
    applyTop(primaryBtn, '21%');
    applyTop(studyBtn, '38.5%');
    applyTop(wrongBtn, '47.0%');
    applyTop(settingBtn, '55.5%');
  }
  updateSettingUI();
  Sound.playBGM('bgm_title');
}

function goToNameInput() {
  playUIClick();
  G.mode = 'story';
  document.getElementById('player-name-input').value = '';
  showScreen('name-screen');
}

function goBackToTitle() {
  playUIClick();
  showScreen('title-screen');
  initTitle();
}

function confirmName() {
  playUIClick();
  const val = document.getElementById('player-name-input').value.trim();
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
  requestAnimationFrame(() => requestAnimationFrame(() => {
    renderMap();
  }));
  Sound.playBGM('bgm_title');
}

function goTitle() {
  resetWholeGame();
  initTitle();
  showScreen('title-screen');
}

function confirmGoTitle() {
  playUIClick();
  showConfirmModal(
    '타이틀로 돌아가기',
    '현재 진행 상황은 저장되어 있습니다.<br>타이틀로 돌아가시겠습니까?',
    () => {
      Sound.stopBGM();
      initTitle();
      showScreen('title-screen');
    }
  );
}

// ==============================
// OPENING (컷신)
// ==============================
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

let opSceneIdx = 0, opLineIdx = 0;
let opTyping = false, opFullLine = '', opTypingTimer = null;
let opSceneEls = [];
let opTransitioning = false;
let opFxTimers = [];
let opTransitionTimers = [];

let endingSceneIdx = 0, endingLineIdx = 0;
let endingTyping = false, endingFullLine = '', endingTypingTimer = null;
let endingAwaitingRank = false;
let endingRankPopupShown = false;
let endingRankData = null;
let endingTransitioning = false;
let endingFxTimers = [];
let endingTransitionTimers = [];

function opRenderLine(line) {
  const safe = line
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\n/g,'<br>');

  return safe
    .replace(/__NAME__/g, '<span class="op-player-name">' + G.playerName + '</span>')
    .replace(/불합격/g, '<span class="op-keyword-fail">불합격</span>')
    .replace(/종자검사원/g, '<span class="op-keyword-inspector">종자검사원</span>');
}

function opTypeLine(line) {
  clearTimeout(opTypingTimer);
  opTyping = true; opFullLine = line;
  const plain = line.replace(/__NAME__/g, G.playerName);
  const textEl = document.getElementById('op-text');
  if (!textEl) { opTyping = false; return; }
  let i = 0;
  textEl.innerHTML = '';
  function tick() {
    const s = plain.slice(0,i).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    textEl.innerHTML = s;
    i++;
    if (i <= plain.length) opTypingTimer = setTimeout(tick, 32);
    else { textEl.innerHTML = opRenderLine(line); opTyping = false; }
  }
  tick();
}

function clearTimerBucket(bucket) {
  while (bucket.length) clearTimeout(bucket.pop());
}

function restartCSSAnimation(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

function restartInlineAnimation(el) {
  if (!el) return;
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
}

function opTriggerLightning(layer) {
  const flash = layer ? layer.querySelector('.op-flash') : null;
  if (!flash) return;
  clearTimerBucket(opFxTimers);
  const pulse = () => {
    restartCSSAnimation(flash, 'active');
  };
  pulse();
  opFxTimers.push(setTimeout(pulse, 180));
  opFxTimers.push(setTimeout(() => flash.classList.remove('active'), 860));
}

function opCleanupLayer(el) {
  if (!el) return;
  el.classList.remove('active', 'op-strip-in', 'op-hold-under');
  el.style.webkitMaskImage = 'none';
  el.style.maskImage = 'none';
  el.style.webkitMaskSize = 'auto';
  el.style.maskSize = 'auto';
  const flash = el.querySelector('.op-flash');
  if (flash) flash.classList.remove('active');
}

function opSetScene(idx, immediate = false) {
  clearTimerBucket(opTransitionTimers);
  if (immediate) clearTimerBucket(opFxTimers);
  opSceneEls.forEach((el, i) => {
    if (i === idx) {
      el.classList.add('active');
      el.classList.remove('op-strip-in', 'op-hold-under', 'wipe-in', 'wipe-out');
      el.style.webkitMaskImage = 'none';
      el.style.maskImage = 'none';
      el.style.webkitMaskSize = 'auto';
      el.style.maskSize = 'auto';
      restartInlineAnimation(el.querySelector('.op-scene-bg'));
    } else {
      opCleanupLayer(el);
    }
  });
  if (immediate && OP_SCENES[idx] && OP_SCENES[idx].lightning) {
    opTriggerLightning(opSceneEls[idx]);
  }
}

function opTransitionToScene(nextIdx, done) {
  const prevIdx = opSceneIdx;
  const prev = opSceneEls[prevIdx];
  const next = opSceneEls[nextIdx];
  if (!next || prevIdx === nextIdx) {
    opSceneIdx = nextIdx;
    opSetScene(nextIdx, true);
    if (done) done();
    return;
  }
  opTransitioning = true;
  clearTimerBucket(opTransitionTimers);
  clearTimerBucket(opFxTimers);
  opSceneEls.forEach((el, i) => {
    if (i !== prevIdx && i !== nextIdx) opCleanupLayer(el);
  });
  if (prev) {
    prev.classList.add('active', 'op-hold-under');
    prev.classList.remove('op-strip-in');
  }
  next.classList.add('active', 'op-strip-in');
  next.classList.remove('op-hold-under');
  restartInlineAnimation(next.querySelector('.op-scene-bg'));
  opTransitionTimers.push(setTimeout(() => {
    if (OP_SCENES[nextIdx] && OP_SCENES[nextIdx].lightning) opTriggerLightning(next);
  }, 160));
  opTransitionTimers.push(setTimeout(() => {
    opSceneIdx = nextIdx;
    opSetScene(nextIdx, false);
    opTransitioning = false;
    if (done) done();
  }, 430));
}

function opShowLine() {
  opTypeLine(OP_SCENES[opSceneIdx].lines[opLineIdx]);
}

function opNextStep() {
  if (opTransitioning) return;
  if (opTyping) {
    clearTimeout(opTypingTimer);
    document.getElementById('op-text').innerHTML = opRenderLine(opFullLine);
    opTyping = false;
    return;
  }
  const scene = OP_SCENES[opSceneIdx];
  if (opLineIdx < scene.lines.length - 1) { opLineIdx++; opShowLine(); return; }
  if (opSceneIdx < OP_SCENES.length - 1) {
    const nextIdx = opSceneIdx + 1;
    opLineIdx = 0;
    const textEl = document.getElementById('op-text');
    if (textEl) textEl.innerHTML = '';
    opTransitionToScene(nextIdx, () => {
      opShowLine();
    });
    return;
  }
  opFinish();
}

function opFinish() {
  document.getElementById('op-arrow').style.visibility = 'hidden';
  document.getElementById('op-end-btn').style.display = 'block';
  document.getElementById('op-tap').disabled = true;
  document.getElementById('op-tap').style.pointerEvents = 'none';
  document.getElementById('op-skip').style.display = 'block';
}

function opSkipAll() {
  playUIClick();
  clearTimeout(opTypingTimer);
  clearTimerBucket(opFxTimers);
  clearTimerBucket(opTransitionTimers);
  opTransitioning = false;
  opSceneIdx = OP_SCENES.length - 1;
  opLineIdx  = OP_SCENES[opSceneIdx].lines.length - 1;
  opSetScene(opSceneIdx, true);
  document.getElementById('op-text').innerHTML = opRenderLine(OP_SCENES[opSceneIdx].lines[opLineIdx]);
  opTyping = false;
  opFinish();
}

function startOpening() {
  showScreen('opening-screen');

  // 씬 요소 생성
  const container = document.getElementById('op-scene-container');
  container.innerHTML = '';
  opSceneEls = OP_SCENES.map((scene, idx) => {
    const layer = document.createElement('div');
    layer.className = 'op-scene-layer' + (idx === 0 ? ' active' : '');
    layer.innerHTML =
      '<img class="op-scene-bg" src="' + scene.image + '" alt="">' +
      '<div class="op-scene-overlay"></div>' +
      '<div class="op-shutter"></div>' +
      '<div class="op-flash"></div>';
    container.appendChild(layer);
    return layer;
  });

  // 상태 초기화
  clearTimerBucket(opFxTimers);
  clearTimerBucket(opTransitionTimers);
  opTransitioning = false;
  opSceneIdx = 0; opLineIdx = 0; opTyping = false;
  document.getElementById('op-arrow').style.visibility = 'visible';
  document.getElementById('op-end-btn').style.display = 'none';
  document.getElementById('op-skip').style.display = 'block';
  document.getElementById('op-tap').disabled = false;
  document.getElementById('op-tap').style.pointerEvents = 'auto';
  document.getElementById('op-fade-black').style.opacity = '0';

  // 이벤트
  const tap  = document.getElementById('op-tap');
  const skip = document.getElementById('op-skip');
  const end  = document.getElementById('op-end-btn');
  tap.onclick  = opNextStep;
  skip.onclick = opSkipAll;
  end.onclick  = startGame;

  opSetScene(0, true);
  opShowLine();
}

function startGame() {
  playUIClick();
  showScreen('map-screen');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    renderMap();
  }));
  Sound.playBGM('bgm_title');
}

// ==============================
// MAP
// ==============================
function renderMap() {
  renderNodes();
  renderPaths();
  const cleared = G.nodeStatus.filter(s => s === 'cleared').length;
  document.getElementById('map-progress-text').textContent = '정화된 구역: ' + cleared + ' / ' + NODES.length;
  const journey = document.getElementById('map-player-journey');
  if (journey) journey.innerHTML = '<strong>' + escapeHtml(G.playerName || '용사') + '</strong>님의 모험';
}

function renderNodes() {
  const container = document.getElementById('nodes-container');
  container.innerHTML = '';
  const mapArea = container.parentElement;
  const mapH = mapArea ? mapArea.offsetHeight : 720;
  const mapW = mapArea ? mapArea.offsetWidth : 390;
  const scaleY = mapH / 750;
  const scaleX = mapW / 390;

  NODES.forEach((node, i) => {
    const status = G.nodeStatus[i];
    const isBoss = node.type === 'boss';
    const div = document.createElement('div');
    div.className = 'map-node stage-' + i + ' ' + status + (isBoss ? ' boss' : '');
    div.style.left = Math.round(node.x * scaleX) + 'px';
    div.style.top  = Math.round(node.y * scaleY) + 'px';
    div.id = 'node-' + i;

    const icon = document.createElement('div');
    icon.className = 'node-icon' + (isBoss ? ' boss-wide-icon' : '');
    div.appendChild(icon);

    if (isBoss) {
      const customIcon = status === 'available' ? node.bossOpenIcon : status === 'cleared' ? node.bossClearIcon : '';
      if (customIcon) {
        const preload = new Image();
        preload.onload = () => {
          icon.classList.add('custom-boss-icon');
          icon.style.backgroundImage = 'url(' + customIcon + ')';
          icon.style.backgroundPosition = 'center';
          icon.style.backgroundSize = 'contain';
          icon.style.backgroundRepeat = 'no-repeat';
        };
        preload.src = customIcon;
      }
    }

    if (isBoss && status !== 'locked') {
      const bossTag = document.createElement('div');
      bossTag.className = 'boss-tag';
      bossTag.textContent = 'BOSS';
      div.appendChild(bossTag);
    }

    if (status !== 'locked') div.onclick = () => openNodePopup(i);
    container.appendChild(div);
  });
}

function renderPaths() {

  const svg = document.getElementById('path-svg');
  svg.innerHTML = '';
  const mapArea = svg.parentElement;
  const mapH = mapArea ? mapArea.offsetHeight : 720;
  const mapW = mapArea ? mapArea.offsetWidth : 390;
  const scaleY = mapH / 750;
  const scaleX = mapW / 390;
  for (let i = 0; i < NODES.length - 1; i++) {
    const a = NODES[i], b = NODES[i + 1];
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', Math.round(a.x * scaleX)); line.setAttribute('y1', Math.round(a.y * scaleY));
    line.setAttribute('x2', Math.round(b.x * scaleX)); line.setAttribute('y2', Math.round(b.y * scaleY));
    line.setAttribute('stroke', G.nodeStatus[i + 1] === 'locked' ? 'rgba(255,255,255,0.1)' : 'rgba(255,200,80,0.2)');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-dasharray', 'none');
    line.setAttribute('opacity', '1');
    svg.appendChild(line);
  }
}

// ==============================
// NODE POPUP
// ==============================
function openNodePopup(idx) {
  if (G.nodeStatus[idx] === 'locked') return;
  Sound.playSE('se_node');
  G.currentNode = idx;
  const node = NODES[idx];
  document.getElementById('popup-enemy').textContent = node.enemy;
  document.getElementById('popup-desc').textContent = node.desc;
  document.getElementById('popup-hp').textContent = '내 체력 3 · 적 체력 ' + node.maxHp;
  document.getElementById('node-popup').classList.add('show');
}

function closeNodePopup() {
  playUIClick();
  document.getElementById('node-popup').classList.remove('show');
}

// ==============================
// TUTORIAL
// ==============================

// ==============================
// 오답노트
// ==============================
function showWrongnote() {
  playUIClick();
  const list = WrongNote.load();
  const body = document.getElementById('wrongnote-body');
  body.innerHTML = '';
  body.classList.toggle('is-empty', list.length === 0);

  if (list.length === 0) {
    body.innerHTML = '<div class="wrongnote-empty">아직 틀린 문제가 없습니다.<br>모험을 시작하세요!</div>';
  } else {
    list.forEach(item => {
      const div = document.createElement('div');
      div.className = 'wrongnote-item';
      const examples = (item.recentExamples || []).map(ex => '<li>' + highlightNumbers(escapeHtml(ex)) + '</li>').join('');
      div.innerHTML =
        '<div class="wrongnote-item-title">' + highlightNumbers(escapeHtml(item.groupTitle || '오답 유형')) + '</div>' +
        (item.guideText ? '<div class="wrongnote-item-guide">기준: ' + highlightNumbers(escapeHtml(item.guideText)) + '</div>' : '') +
        (examples ? '<div class="wrongnote-item-examples-label">최근 오답 예시</div><ul class="wrongnote-item-examples">' + examples + '</ul>' : '') +
        (item.sampleReason ? '<div class="wrongnote-item-reason">' + item.sampleReason + '</div>' : '');
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
  showConfirmModal(
    '오답노트 초기화',
    '오답노트를 모두 지우시겠습니까?',
    () => {
      WrongNote.clear();
      showWrongnote();
    }
  );
}

// ==============================
// 설정
// ==============================
function showSetting() {
  playUIClick();
  updateSettingUI();
  document.getElementById('setting-popup').classList.add('show');
}

function closeSetting() {
  playUIClick();
  document.getElementById('setting-popup').classList.remove('show');
}

function updateSettingUI() {
  const bgmSlider = document.getElementById('bgm-slider');
  const seSlider  = document.getElementById('se-slider');
  const bgmVal    = document.getElementById('bgm-val');
  const seVal     = document.getElementById('se-val');
  if (bgmSlider) {
    const v = Sound.isBGMOn() ? (bgmSlider.value || 70) : 0;
    bgmSlider.value = v;
    if (bgmVal) bgmVal.textContent = v;
  }
  if (seSlider) {
    const v = Sound.isSEOn() ? (seSlider.value || 70) : 0;
    seSlider.value = v;
    if (seVal) seVal.textContent = v;
  }
}

function toggleBGM() {
  Sound.toggleBGM();
  updateSettingUI();
}

function toggleSE() {
  Sound.toggleSE();
  updateSettingUI();
}

// ==============================
// BATTLE START
// ==============================
function startBattle() {
  playUIClick();
  document.getElementById('node-popup').classList.remove('show');
  const node = NODES[G.currentNode];
  const isBoss = node.type === 'boss';
  const encImg = document.getElementById('enc-enemy-img');
  const encBtn = document.getElementById('enc-battle-btn');
  const introBox = document.getElementById('boss-intro-box');

  if (encImg) {
    encImg.style.animation = 'none';
    encImg.offsetWidth;
    encImg.style.backgroundImage = 'url(' + node.enemyImage + ')';
    encImg.style.animation = 'enemy-img-appear 0.6s ease-out 0.1s forwards';
  }
  document.getElementById('enc-name').textContent = node.enemy;
  encBtn.classList.remove('show');

  const revealBattleButton = () => {
    if (isBoss && node.bossLine) {
      document.getElementById('boss-intro-text').textContent = node.bossLine;
      introBox.style.display = 'block';
      introBox.style.cursor = 'pointer';
      encBtn.classList.remove('show');
      introBox.onclick = () => {
        introBox.style.display = 'none';
        introBox.onclick = null;
        encBtn.classList.add('show');
      };
    } else {
      introBox.style.display = 'none';
      introBox.onclick = null;
      encBtn.classList.add('show');
    }
  };

  if (encImg) {
    const onAppearDone = () => {
      encImg.removeEventListener('animationend', onAppearDone);
      revealBattleButton();
    };
    encImg.addEventListener('animationend', onAppearDone);
  } else {
    revealBattleButton();
  }

  showScreen('encounter-screen');

  const ec = document.getElementById('encounter-screen');
  ec.style.animation = 'none';
  requestAnimationFrame(() => {
    ec.style.animation = 'screen-shake 0.4s ease-out';
  });

  Sound.playBGM(isBoss ? 'bgm_boss' : 'bgm_battle');
}

function showStage1TutorialAndStart(onComplete) {
  showAlertModal(
    '전투 안내',
    '상대의 주장을 확인한 뒤 판정하세요.<br>기준에 맞으면 <span class="tut-good">합격</span>, 문제가 있으면 <span class="tut-bad">불합격</span>입니다.<br><span class="tut-good">정답</span>이면 적 체력이 줄고,<br><span class="tut-bad">오답</span>이면 내 체력이 줄어듭니다.',
    () => {
      G.stage1TutorialShown = true;
      saveGame();
      if (onComplete) onComplete();
    }
  );
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
  if (spriteSrc) {
    sprite.innerHTML = '<img src="' + spriteSrc + '" alt="' + node.enemy + '">';
  } else {
    sprite.innerHTML = '<div class="arena-fallback-enemy">' + node.enemy + '</div>';
  }

  const playerSprite = document.getElementById('arena-player-sprite');
  if (playerSprite) {
    playerSprite.innerHTML = '<img src="images/player_back.png" alt="' + (G.playerName || '용사') + '">';
  }
  applyBattleSpriteTuning(node);

  const bossLabel = document.getElementById('boss-label');
  const bubble = document.getElementById('speech-bubble');
  const enemyBadge = document.getElementById('battle-name-badge');
  if (isBoss) {
    if (bossLabel) bossLabel.style.display = 'none';
    bubble.classList.add('boss-bubble');
    enemyBadge.style.borderColor = '#ff4444';
    enemyBadge.classList.add('has-boss');
    enemyBadge.innerHTML = '<span class="badge-name">' + node.enemy + '</span><span class="boss-inline-tag">BOSS</span>';
  } else {
    if (bossLabel) bossLabel.style.display = 'none';
    bubble.classList.remove('boss-bubble');
    enemyBadge.style.borderColor = '#8a7a50';
    enemyBadge.classList.remove('has-boss');
    enemyBadge.textContent = node.enemy;
  }

  updatePlayerFlavorLine();
  renderHp();
  loadQuestion();
  showScreen('battle-screen');
}

function startActualBattle() {
  playUIClick();
  if (G.currentNode === 0 && !G.stage1TutorialShown) {
    showStage1TutorialAndStart(doStartActualBattle);
    return;
  }
  doStartActualBattle();
}

// ==============================
// HP
// ==============================
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

function animateHpBreak(idx) {
  return;
}

// ==============================
// QUESTION
// ==============================
function loadQuestion() {
  if (!G.shuffledQ.length) return;
  const q = G.shuffledQ[G.currentQ];
  updateJudgeButtonsForQuestion(q, 'battle');
  document.getElementById('battle-question').innerHTML = formatBattleQuestionHtml(q);
  document.getElementById('q-counter').textContent = '문제 ' + G.questionTurn;
  updatePlayerFlavorLine();
  document.querySelectorAll('.judge-btn').forEach(b => b.disabled = false);
}

// ==============================
// ANSWER
// ==============================
function answer(choice) {
  playUIClick();
  if (G.pendingDamage) return;
  disableResultNext(false);
  document.querySelectorAll('.judge-btn').forEach(b => b.disabled = true);
  const q = G.shuffledQ[G.currentQ];
  const correct = choice === q.answer;
  const userJudge = getChoiceLabel(choice, q);
  const correctJudge = getChoiceLabel(q.answer, q);

  const box = document.getElementById('result-box');
  box.className = 'result-box ' + (correct ? 'correct' : 'wrong');
  document.getElementById('result-badge').textContent = '채점 결과';
  document.getElementById('result-title').textContent = correct ? '정답!' : '오답!';
  document.getElementById('result-answer').innerHTML = '당신의 판정: <span class="judge-word ' + (choice === 'pass' ? 'pass' : 'fail') + '">' + userJudge + '</span>';

  let reasonText = (q.reason || '').trim();
  const suffix = getChoiceResultSuffix(q.answer, q, correct);
  if (!reasonText) reasonText = suffix;
  else if (!reasonText.includes(correctJudge)) reasonText = reasonText.replace(/[.。!?！？]?$/, '') + '. ' + suffix;
  document.getElementById('result-reason').innerHTML = formatReasonHtml(reasonText);
  document.getElementById('result-popup').classList.add('show');

  G.pendingDamage = true;
  G.pendingDamageOutcome = correct;
  if (correct) {
    G.correct++; G.totalCorrect++;
    Sound.playSE('se_correct');
  } else {
    G.wrong++; G.totalWrong++;
    WrongNote.add(q);
    Sound.playSE('se_wrong');
  }
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
    G.damageTimer = setTimeout(() => {
      finalizeAfterDamage();
    }, 460);
  }, 30);
}

// ==============================
// EXIT
// ==============================
function showExitConfirm() { playUIClick(); document.getElementById('exit-confirm').classList.add('show'); }
function hideExitConfirm() { playUIClick(); document.getElementById('exit-confirm').classList.remove('show'); }

function exitToMap() {
  playUIClick();
  document.getElementById('exit-confirm').classList.remove('show');
  document.getElementById('result-popup').classList.remove('show');
  Sound.stopBGM();
  Sound.playBGM('bgm_title');
  showScreen('map-screen');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    renderMap();
  }));
}

// ==============================
// STAGE CLEAR
// ==============================
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
    requestAnimationFrame(() => requestAnimationFrame(() => {
      renderMap();
    }));
    Sound.playBGM('bgm_title');
  }
}

// ==============================
// GAME OVER
// ==============================
function retryNode() {
  playUIClick();
  showScreen('map-screen');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    renderMap();
  }));
  Sound.playBGM('bgm_title');
}

// ==============================
// ENDING
// ==============================
function endingRenderLine(line) {
  const safe = line
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\n/g,'<br>');
  return safe.replace(/__NAME__/g, '<span class="ending-player-name">' + G.playerName + '</span>');
}

function endingTypeLine(line) {
  clearTimeout(endingTypingTimer);
  endingTyping = true;
  endingFullLine = line;
  const plain = line.replace(/__NAME__/g, G.playerName);
  const textEl = document.getElementById('ending-text');
  if (!textEl) { endingTyping = false; return; }
  let i = 0;
  textEl.innerHTML = '';
  function tick() {
    const s = plain.slice(0, i).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    textEl.innerHTML = s;
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
  if (!layer) return;
  const scene = ENDING_SCENES[idx];
  layer.style.background = scene.fallback;
  layer.style.backgroundSize = 'cover';
  layer.style.backgroundPosition = 'center center';
  layer.style.backgroundRepeat = 'no-repeat';
  const img = new Image();
  img.onload = () => {
    layer.style.background = `url("${scene.image}"), ${scene.fallback}`;
    layer.style.backgroundSize = 'cover, cover';
    layer.style.backgroundPosition = 'center center, center center';
    layer.style.backgroundRepeat = 'no-repeat, no-repeat';
  };
  img.src = scene.image;
}

function endingSetScene(idx, immediate = false) {
  const layer = document.getElementById('ending-bg-layer');
  const overlay = document.querySelector('#ending-screen .ending-overlay');
  if (!layer) { setEndingBackground(idx); return; }
  clearTimerBucket(endingTransitionTimers);
  clearTimerBucket(endingFxTimers);
  layer.classList.remove('wipe-in', 'wipe-out');
  layer.style.webkitMaskImage = 'none';
  layer.style.maskImage = 'none';
  layer.style.webkitMaskSize = 'auto';
  layer.style.maskSize = 'auto';
  layer.style.animation = 'none';
  if (overlay) overlay.classList.remove('pass');
  if (immediate || !overlay) {
    setEndingBackground(idx);
    restartInlineAnimation(layer);
    return;
  }
  endingTransitioning = true;
  overlay.classList.remove('pass');
  void overlay.offsetWidth;
  overlay.classList.add('pass');
  endingTransitionTimers.push(setTimeout(() => {
    setEndingBackground(idx);
    restartInlineAnimation(layer);
  }, 230));
  endingTransitionTimers.push(setTimeout(() => {
    overlay.classList.remove('pass');
    endingTransitioning = false;
  }, 640));
}

function endingShowLine() {
  endingTypeLine(ENDING_SCENES[endingSceneIdx].lines[endingLineIdx]);
}

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
  const rate = total > 0 ? Math.round((G.totalCorrect / total) * 100) : 0;
  let grade = 'B';
  let title = '성장형 검사원';
  let desc = '왕국의 질서를 되찾았습니다.';
  if (rate >= 100) {
    grade = 'S';
    title = '완벽한 판정관';
    desc = '완벽한 판정으로 왕국의 기준을 다시 세웠습니다.';
  } else if (rate >= 85) {
    grade = 'A';
    title = '우수한 검사원';
    desc = '뛰어난 판단으로 왕국의 질서를 되찾았습니다.';
  }
  endingRankData = { total, rate, grade, title, desc };
}

function showEndingRankPopup() {
  if (!endingRankData) buildEndingRankData();
  const modal = document.getElementById('ending-rank-modal');
  document.getElementById('ending-rank-grade').textContent = endingRankData.grade;
  document.getElementById('ending-rank-name').textContent = `${G.playerName} · ${endingRankData.title}`;
  document.getElementById('ending-stat-correct').textContent = `${G.totalCorrect}개`;
  document.getElementById('ending-stat-wrong').textContent = `${G.totalWrong}개`;
  document.getElementById('ending-stat-rate').textContent = `${endingRankData.rate}%`;
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
  if (endingRankPopupShown || endingTransitioning) return;
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
  clearTimerBucket(endingFxTimers);
  clearTimerBucket(endingTransitionTimers);
  endingTransitioning = false;
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
  endingSetScene(0, true);
  showScreen('ending-screen');
  endingShowLine();
  Sound.playBGM('bgm_ending');
  const wrap = document.getElementById('ending-scene-wrap');
  if (wrap) wrap.onclick = endingNextStep;
}

// ==============================
// INIT
// ==============================
Sound.loadSettings();
initTitle();


(() => {
  const modal = document.getElementById('ui-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeUIModal();
    });
  }
})();
