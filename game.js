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

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e) { return []; }
  }

  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch(e) {}
  }

  function add(q) {
    const list = load();
    // 중복 방지
    if (!list.find(item => item.text === q.text)) {
      list.unshift({ text: q.text, answer: q.answer, reason: q.reason });
      if (list.length > 50) list.pop();
      save(list);
    }
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
  damageTimer: null
};
G.nodeStatus[0] = 'available';

// ==============================
// 저장 / 불러오기
// ==============================
function saveGame() {
  try {
    localStorage.setItem('seedGame_v3', JSON.stringify({
      playerName: G.playerName,
      nodeStatus: G.nodeStatus,
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
    damageTimer: null
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
  return text.replace(/(\d+\.?\d*%)/g, '<span class="highlight">$1</span>');
}

function formatQuestion(text) {
  return text.replace(/([.?!~…])\s+/g, '$1\n');
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

function applyBattleDamageEffects(correct) {
  const stamp = document.getElementById('stamp-effect');
  const arena = document.getElementById('battle-arena-area');
  if (correct) {
    G.enemyHp = Math.max(0, G.enemyHp - 1);
    if (stamp) {
      stamp.textContent = '정답';
      stamp.classList.remove('show');
      requestAnimationFrame(() => stamp.classList.add('show'));
    }
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
  const btn = document.getElementById('continue-btn');
  if (saved && saved.playerName) {
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.querySelector('.tmenu-label').textContent = '이어하기 (' + saved.playerName + ')';
  } else {
    btn.style.opacity = '0.4';
    btn.style.pointerEvents = 'none';
    btn.querySelector('.tmenu-label').textContent = '이어하기';
  }
  updateSettingUI();
  Sound.playBGM('bgm_title');
}

function goToNameInput() {
  playUIClick();
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
  G.playerName = val || '용사';
  saveGame();
  startOpening();
}

function continueGame() {
  playUIClick();
  const saved = loadSave();
  if (!saved) return;
  G.playerName = saved.playerName || '용사';
  G.nodeStatus = saved.nodeStatus;
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

let opSceneIdx = 0, opLineIdx = 0;
let opTyping = false, opFullLine = '', opTypingTimer = null;
let opSceneEls = [];

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

function opSetScene(idx) {
  opSceneEls.forEach((el, i) => {
    const isCurrent = i === idx;
    if (isCurrent) {
      el.classList.add('active', 'wipe-in');
      el.classList.remove('wipe-out');
      const bg = el.querySelector('.op-scene-bg');
      if (bg) {
        bg.style.animation = 'none'; void bg.offsetWidth;
        bg.style.animation = 'op-slow-pan 12s ease-in-out forwards';
      }
    } else if (el.classList.contains('active')) {
      el.classList.add('wipe-out');
      el.classList.remove('wipe-in');
      setTimeout(() => el.classList.remove('active'), 980);
    }
  });
  if (OP_SCENES[idx].lightning) {
    const flash = opSceneEls[idx].querySelector('.op-flash');
    const burst = (delay, duration = 280) => {
      setTimeout(() => {
        flash.classList.add('active');
        setTimeout(() => flash.classList.remove('active'), duration);
      }, delay);
    };
    burst(700, 240);
    burst(1180, 180);
    burst(1620, 360);
  }
}

function opShowLine() {
  opTypeLine(OP_SCENES[opSceneIdx].lines[opLineIdx]);
}

function opNextStep() {
  if (opTyping) {
    clearTimeout(opTypingTimer);
    document.getElementById('op-text').innerHTML = opRenderLine(opFullLine);
    opTyping = false;
    return;
  }
  const scene = OP_SCENES[opSceneIdx];
  if (opLineIdx < scene.lines.length - 1) { opLineIdx++; opShowLine(); return; }
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
  document.getElementById('op-arrow').style.visibility = 'hidden';
  document.getElementById('op-end-btn').style.display = 'block';
  document.getElementById('op-tap').disabled = true;
  document.getElementById('op-tap').style.pointerEvents = 'none';
  document.getElementById('op-skip').style.display = 'block';
}

function opSkipAll() {
  playUIClick();
  clearTimeout(opTypingTimer);
  opSceneIdx = OP_SCENES.length - 1;
  opLineIdx  = OP_SCENES[opSceneIdx].lines.length - 1;
  opSetScene(opSceneIdx);
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
      '<div class="op-flash"></div>';
    container.appendChild(layer);
    return layer;
  });

  // 상태 초기화
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

  opSetScene(0);
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

    if (isBoss) {
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

  if (list.length === 0) {
    body.innerHTML = '<div class="wrongnote-empty">아직 틀린 문제가 없습니다.<br>모험을 시작하세요!</div>';
  } else {
    list.forEach(item => {
      const div = document.createElement('div');
      div.className = 'wrongnote-item';
      div.innerHTML =
        '<div class="wrongnote-item-q">' + highlightNumbers(item.text) + '</div>' +
        '<div class="wrongnote-item-ans">정답: ' + (item.answer === 'pass' ? '합격' : '불합격') + '</div>' +
        '<div class="wrongnote-item-reason">' + item.reason + '</div>';
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
      setTimeout(() => {
        introBox.style.display = 'none';
        encBtn.classList.add('show');
      }, 3000);
    } else {
      introBox.style.display = 'none';
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

  const bossLabel = document.getElementById('boss-label');
  const bubble = document.getElementById('speech-bubble');
  if (isBoss) {
    bossLabel.style.display = 'block';
    bubble.classList.add('boss-bubble');
    document.getElementById('battle-name-badge').style.borderColor = '#ff4444';
  } else {
    bossLabel.style.display = 'none';
    bubble.classList.remove('boss-bubble');
    document.getElementById('battle-name-badge').style.borderColor = '#8a7a50';
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
  const formatted = formatQuestion(q.text);
  document.getElementById('battle-question').innerHTML = highlightNumbers(formatted);
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

  const box = document.getElementById('result-box');
  box.className = 'result-box ' + (correct ? 'correct' : 'wrong');
  document.getElementById('result-badge').textContent = correct ? 'PASS' : 'FAIL';
  document.getElementById('result-title').textContent = correct ? '정답!' : '오답!';
  document.getElementById('result-answer').textContent = '판정: ' + (q.answer === 'pass' ? '합격' : '불합격');
  document.getElementById('result-reason').textContent = q.reason;
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
  if (G.currentNode + 1 < NODES.length) G.nodeStatus[G.currentNode + 1] = 'available';
  saveGame();
  Sound.playSE('se_clear');
  Sound.stopBGM();

  const node = NODES[G.currentNode];
  const isLast = G.currentNode === NODES.length - 1;
  document.getElementById('clear-title').textContent = isLast ? '최종 보스 격파!' : node.label + ' 클리어!';
  document.getElementById('clear-sub').textContent = isLast ? '왕국의 질서가 되찾아졌다!' : '다음 지역으로 나아가자!';
  document.getElementById('cs-correct').textContent = G.correct + '개';
  document.getElementById('cs-wrong').textContent = G.wrong + '개';
  document.getElementById('cs-hp').textContent = G.hp + ' / 3';
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
function showEnding() {
  if (G.damageTimer) { clearTimeout(G.damageTimer); G.damageTimer = null; }
  G.pendingDamage = false;

  const total = G.totalCorrect + G.totalWrong;
  const rate = total > 0 ? G.totalCorrect / total : 0;
  let rank = '📜 B랭크 성장형 검사원';
  if (rate >= 1.0)  rank = '🥇 S랭크 완벽한 판정관';
  else if (rate >= 0.85) rank = '🥈 A랭크 우수한 검사원';
  document.getElementById('ending-rank').textContent = rank;
  document.getElementById('ending-sub').textContent = G.playerName + '의 모험이 끝났다!';
  document.getElementById('cert-player-name').textContent = G.playerName;

  const p = document.getElementById('ending-particles');
  p.innerHTML = '';
  ['🌾','⭐','✨','🎉','🏅'].forEach(emoji => {
    for (let i = 0; i < 5; i++) {
      const el = document.createElement('div');
      el.className = 'particle';
      el.textContent = emoji;
      el.style.left = Math.random() * 100 + '%';
      el.style.animationDelay = Math.random() * 3 + 's';
      el.style.animationDuration = (3 + Math.random() * 4) + 's';
      p.appendChild(el);
    }
  });

  showScreen('ending-screen');
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
