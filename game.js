// ============================================================
// game.js - 나는야 종자검사원 게임 로직
// ============================================================

// ==============================
// 설정 (사운드 파일 경로)
// ==============================
const SOUND_FILES = {
  bgm_title:  'sounds/bgm_title.mp3',
  bgm_battle: 'sounds/bgm_battle.mp3',
  bgm_boss:   'sounds/bgm_boss.mp3',
  se_correct: 'sounds/se_correct.mp3',
  se_wrong:   'sounds/se_wrong.mp3',
  se_stamp:   'sounds/se_stamp.mp3',
  se_clear:   'sounds/se_clear.mp3',
  se_gameover:'sounds/se_gameover.mp3',
};

// ==============================
// 사운드 시스템
// ==============================
const Sound = (() => {
  let bgmEl = null;
  const settings = { bgm: true, se: true };

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
    if (!settings.bgm) return;
    if (bgmEl) { bgmEl.pause(); bgmEl = null; }
    try {
      bgmEl = new Audio(SOUND_FILES[key]);
      bgmEl.loop = true;
      bgmEl.volume = 0.5;
      bgmEl.play().catch(()=>{});
    } catch(e) {}
  }

  function stopBGM() {
    if (bgmEl) { bgmEl.pause(); bgmEl = null; }
  }

  function playSE(key) {
    if (!settings.se) return;
    try {
      const a = new Audio(SOUND_FILES[key]);
      a.volume = 0.7;
      a.play().catch(()=>{});
    } catch(e) {}
  }

  function toggleBGM() {
    settings.bgm = !settings.bgm;
    if (!settings.bgm) stopBGM();
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
    const v = parseInt(val) / 100;
    settings.bgm = v > 0;
    if (bgmEl) {
      bgmEl.volume = v;
      if (!settings.bgm) bgmEl.pause();
      else bgmEl.play().catch(()=>{});
    }
    const el = document.getElementById('bgm-val');
    if (el) el.textContent = val;
    saveSettings();
  }

  function setSEVol(val) {
    const v = parseInt(val) / 100;
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
  shuffledQ: [],
  hp: 3,
  enemyHp: 3,
  enemyMaxHp: 3,
  correct: 0,
  wrong: 0,
  totalCorrect: 0,
  totalWrong: 0
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
      totalWrong: G.totalWrong
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
    currentNode: 0, currentQ: 0, shuffledQ: [],
    hp: 3, enemyHp: 3, enemyMaxHp: 3, 
    correct: 0, wrong: 0, totalCorrect: 0, totalWrong: 0
  };
  G.nodeStatus[0] = 'available';
}

function resetNodeBattle(idx) {
  G.currentNode = idx;
  G.currentQ = 0;
  G.hp = 3;
  G.enemyMaxHp = NODES[idx].maxHp;
  G.enemyHp = G.enemyMaxHp;
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

function highlightNumbers(text) {
  return text.replace(/(\d+\.?\d*%)/g, '<span class="highlight">$1</span>');
}

function formatQuestion(text) {
  return text.replace(/([.?!~…])\s+/g, '$1\n');
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
  document.getElementById('player-name-input').value = '';
  showScreen('name-screen');
}

function goBackToTitle() {
  showScreen('title-screen');
  initTitle();
}

function confirmName() {
  const val = document.getElementById('player-name-input').value.trim();
  resetWholeGame();
  G.playerName = val || '용사';
  saveGame();
  startOpening();
}

function continueGame() {
  const saved = loadSave();
  if (!saved) return;
  G.playerName = saved.playerName;
  G.nodeStatus = saved.nodeStatus;
  G.totalCorrect = saved.totalCorrect || 0;
  G.totalWrong = saved.totalWrong || 0;
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
  if (confirm('타이틀로 돌아가시겠습니까?\n현재 진행 상황은 저장되어 있습니다.')) {
    Sound.stopBGM();
    initTitle();
    showScreen('title-screen');
  }
}

// ==============================
// OPENING (컷신)
// ==============================
const OP_SCENES = [
  { image: 'images/scene1.png', lines: [
    '오래전, 종자 왕국의 질서가 무너졌다.',
    '기준 미달 종자와 혼입 종자,\n그리고 거짓된 판정이 왕국을 뒤덮었다.'
  ]},
  { image: 'images/scene2.png', lines: [
    '무너진 종자 왕국,\n이 세상의 균형을 바로잡는 자,',
    '그들이 바로...\n종자검사원이다.'
  ]},
  { image: 'images/scene3.png', lines: [
    '아직은 지망생에 불과한 당신은\n정식 종자검사원이 되기 위해',
    '들판, 평원, 연금실, 성소, 협곡,\n그리고 심판의 성을 향해 떠난다.'
  ]},
  { image: 'images/scene4.png', lines: [
    '하지만 왕국 너머,\n그 긴긴 길의 끝에는',
    '우량종자 공급을 방해하는\n최종 보스가 기다리고 있다고 전해진다.',
    '당신의 올바른 판단만이 세상을 구할 수 있다.',
    '지금부터... __NAME__의 모험이 시작된다.'
  ]}
];

let opSceneIdx = 0, opLineIdx = 0;
let opTyping = false, opFullLine = '', opTypingTimer = null;
let opSceneEls = [];

function opRenderLine(line) {
  const safe = line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return safe.replace(/__NAME__/g, '<span class="op-player-name">' + G.playerName + '</span>');
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
    if (i === idx) {
      el.classList.add('active', 'wipe-in');
      el.classList.remove('wipe-out');
    } else if (el.classList.contains('active')) {
      el.classList.add('wipe-out');
      el.classList.remove('active', 'wipe-in');
    } else {
      el.classList.remove('active', 'wipe-in', 'wipe-out');
    }
  });
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
    opSceneIdx++; opLineIdx = 0;
    opSetScene(opSceneIdx); opShowLine();
    return;
  }
  opFinish();
}

function opFinish() {
  document.getElementById('op-arrow').style.display = 'none';
  document.getElementById('op-end-btn').style.display = 'block';
  document.getElementById('op-tap').disabled = true;
  document.getElementById('op-tap').style.pointerEvents = 'none';
  document.getElementById('op-skip').style.display = 'none';
}

function opSkipAll() {
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
  const container = document.getElementById('op-scene-container');
  container.innerHTML = '';
  opSceneEls = OP_SCENES.map((scene, idx) => {
    const layer = document.createElement('div');
    layer.className = 'op-scene-layer' + (idx === 0 ? ' active' : '');
    layer.innerHTML = '<img class="op-scene-bg" src="' + scene.image + '" alt="">';
    container.appendChild(layer);
    return layer;
  });

  opSceneIdx = 0; opLineIdx = 0; opTyping = false;
  document.getElementById('op-arrow').style.display = 'block';
  document.getElementById('op-end-btn').style.display = 'none';
  document.getElementById('op-skip').style.display = 'block';
  document.getElementById('op-tap').disabled = false;
  document.getElementById('op-tap').style.pointerEvents = 'auto';

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
    icon.className = 'node-icon';
    div.appendChild(icon);
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
    svg.appendChild(line);
  }
}

// ==============================
// NODE POPUP
// ==============================
function openNodePopup(idx) {
  if (G.nodeStatus[idx] === 'locked') return;
  G.currentNode = idx;
  const node = NODES[idx];
  document.getElementById('popup-emoji').textContent = '';
  document.getElementById('popup-enemy').textContent = node.enemy;
  document.getElementById('popup-desc').textContent = node.desc;
  document.getElementById('popup-hp').textContent = '적 체력: ' + node.maxHp;
  document.getElementById('node-popup').classList.add('show');
}

function closeNodePopup() {
  document.getElementById('node-popup').classList.remove('show');
}

// ==============================
// 오답노트
// ==============================
function showWrongnote() {
  const list = WrongNote.load();
  const body = document.getElementById('wrongnote-body');
  body.innerHTML = '';
  if (list.length === 0) {
    body.innerHTML = '<div class="wrongnote-empty">틀린 문제가 없습니다.</div>';
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
  document.getElementById('wrongnote-popup').classList.remove('show');
}

function clearWrongnote() {
  if (confirm('오답노트를 초기화하시겠습니까?')) {
    WrongNote.clear();
    showWrongnote();
  }
}

// ==============================
// 설정
// ==============================
function showSetting() {
  updateSettingUI();
  document.getElementById('setting-popup').classList.add('show');
}

function closeSetting() {
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

// ==============================
// BATTLE START
// ==============================
function startBattle() {
  closeNodePopup();
  const node = NODES[G.currentNode];
  const isBoss = node.type === 'boss';
  const encImg = document.getElementById('enc-enemy-img');
  if (encImg) encImg.style.backgroundImage = 'url(' + node.enemyImage + ')';
  document.getElementById('enc-name').textContent = node.enemy;
  const introBox = document.getElementById('boss-intro-box');
  if (isBoss && node.bossLine) {
    document.getElementById('boss-intro-text').textContent = node.bossLine;
    introBox.style.display = 'block';
    document.getElementById('enc-battle-btn').style.display = 'none';
    setTimeout(() => {
      introBox.style.display = 'none';
      document.getElementById('enc-battle-btn').style.display = 'inline-block';
    }, 3000);
  } else {
    introBox.style.display = 'none';
    document.getElementById('enc-battle-btn').style.display = 'inline-block';
  }
  showScreen('encounter-screen');
  Sound.playBGM(isBoss ? 'bgm_boss' : 'bgm_battle');
}

function startActualBattle() {
  resetNodeBattle(G.currentNode);
  const node = NODES[G.currentNode];
  const isBoss = node.type === 'boss';
  document.getElementById('battle-enemy-name').textContent = node.enemy;
  document.getElementById('battle-name-badge').textContent = node.enemy;
  const cardImg = document.getElementById('battle-card-img');
  if (node.enemyImage) {
    cardImg.innerHTML = '<img src="' + node.enemyImage + '" alt="' + node.enemy + '">';
  }
  const bossLabel = document.getElementById('boss-label');
  const bubble = document.getElementById('speech-bubble');
  if (isBoss) {
    bossLabel.style.display = 'block';
    bubble.classList.add('boss-bubble');
  } else {
    bossLabel.style.display = 'none';
    bubble.classList.remove('boss-bubble');
  }
  renderHp();
  loadQuestion();
  showScreen('battle-screen');
}

// ==============================
// HP
// ==============================
function renderHp() {
  const pFill = document.getElementById('player-hp-fill');
  const pText = document.getElementById('player-hp-text');
  if (pFill && pText) {
    const pPct = Math.max(0, (G.hp / 3) * 100);
    pFill.style.width = pPct + '%';
    pText.textContent = G.hp + ' / 3';
    pFill.className = 'hp-bar-fill player-fill';
    if (G.hp === 2) pFill.classList.add('warning');
    if (G.hp === 1) pFill.classList.add('danger');
  }
  const eFill = document.getElementById('enemy-hp-fill');
  const eText = document.getElementById('enemy-hp-text');
  if (eFill && eText) {
    const ePct = Math.max(0, (G.enemyHp / G.enemyMaxHp) * 100);
    eFill.style.width = ePct + '%';
    eText.textContent = G.enemyHp + ' / ' + G.enemyMaxHp;
  }
}

// ==============================
// QUESTION
// ==============================
function loadQuestion() {
  const q = G.shuffledQ[G.currentQ];
  const formatted = formatQuestion(q.text);
  document.getElementById('battle-question').innerHTML = highlightNumbers(formatted);
  document.getElementById('q-counter').textContent = '전투 중';
  document.querySelectorAll('.judge-btn').forEach(b => b.disabled = false);
}

// ==============================
// ANSWER
// ==============================
function answer(choice) {
  document.querySelectorAll('.judge-btn').forEach(b => b.disabled = true);
  const q = G.shuffledQ[G.currentQ];
  const correct = choice === q.answer;
  const box = document.getElementById('result-box');
  const stamp = document.getElementById('stamp-effect');
  box.className = 'result-box ' + (correct ? 'correct' : 'wrong');
  document.getElementById('result-badge').textContent = correct ? '✅' : '❌';
  document.getElementById('result-title').textContent = correct ? '정답!' : '오답!';
  document.getElementById('result-answer').textContent = '판정: ' + (q.answer === 'pass' ? '합격' : '불합격');
  document.getElementById('result-reason').textContent = q.reason;

  if (correct) {
    G.correct++; G.totalCorrect++;
    G.enemyHp--;
    stamp.textContent = '💥';
    stamp.classList.remove('show');
    requestAnimationFrame(() => stamp.classList.add('show'));
    const sprite = document.getElementById('battle-card-img');
    sprite.classList.add('shake');
    setTimeout(() => sprite.classList.remove('shake'), 500);
    Sound.playSE('se_correct');
  } else {
    G.wrong++; G.totalWrong++;
    WrongNote.add(q);
    G.hp--;
    const screen = document.getElementById('battle-screen');
    screen.classList.add('shake');
    setTimeout(() => screen.classList.remove('shake'), 400);
    Sound.playSE('se_wrong');
  }
  renderHp();
  document.getElementById('result-popup').classList.add('show');
}

function nextQuestion() {
  document.getElementById('result-popup').classList.remove('show');
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
  if (G.currentQ >= G.shuffledQ.length) {
    G.shuffledQ = shuffle([...NODES[G.currentNode].questions]);
    G.currentQ = 0;
  }
  loadQuestion();
}

// ==============================
// EXIT
// ==============================
function showExitConfirm() { document.getElementById('exit-confirm').classList.add('show'); }
function hideExitConfirm() { document.getElementById('exit-confirm').classList.remove('show'); }

function exitToMap() {
  hideExitConfirm();
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
  showScreen('clear-screen');
}

function afterClear() {
  if (G.currentNode === NODES.length - 1) showEnding();
  else {
    showScreen('map-screen');
    renderMap();
    Sound.playBGM('bgm_title');
  }
}

// ==============================
// GAME OVER
// ==============================
function retryNode() {
  showScreen('map-screen');
  renderMap();
  Sound.playBGM('bgm_title');
}

// ==============================
// ENDING
// ==============================
function showEnding() {
  const total = G.totalCorrect + G.totalWrong;
  const rate = total > 0 ? G.totalCorrect / total : 0;
  let rank = 'B랭크 성장형 검사원';
  if (rate >= 1.0)  rank = 'S랭크 완벽한 판정관';
  else if (rate >= 0.85) rank = 'A랭크 우수한 검사원';
  document.getElementById('ending-rank').textContent = rank;
  document.getElementById('ending-sub').textContent = G.playerName + '의 모험이 끝났다!';
  document.getElementById('cert-player-name').textContent = G.playerName;
  showScreen('ending-screen');
}

// ==============================
// INIT
// ==============================
Sound.loadSettings();
initTitle();
