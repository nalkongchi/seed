// ============================================================
// game.js - 나는야 종자검사원 게임 로직
// ============================================================

// ==============================
// 설정 (사운드 파일 경로)
// 나중에 파일 첨부 시 경로 변경하세요.
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
  shuffledQ: [],
  hp: 3,
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
    hp: 3, correct: 0, wrong: 0, totalCorrect: 0, totalWrong: 0
  };
  G.nodeStatus[0] = 'available';
}

function resetNodeBattle(idx) {
  G.currentNode = idx;
  G.currentQ = 0;
  G.hp = NODES[idx].maxHp;
  G.correct = 0;
  G.wrong = 0;
  G.shuffledQ = shuffle([...NODES[idx].questions]).slice(0, 5);
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
  // 문장 부호 뒤 자동 줄바꿈 (마침표/물음표/느낌표/말줄임 뒤)
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
  G.playerName = val || '미확인종자원';
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
  { image: 'images/scene1.png', lightning: false, lines: [
    '오래전, 종자 왕국의 질서가 무너졌다.',
    '기준 미달 종자와 혼입 종자,\n그리고 거짓된 판정이 왕국을 뒤덮었다.'
  ]},
  { image: 'images/scene2.png', lightning: false, lines: [
    '세상의 균형을 바로잡는 자,',
    '그들이 바로 종자검사원이다.'
  ]},
  { image: 'images/scene3.png', lightning: false, lines: [
    '아직은 지망생에 불과한 당신은\n정식 검사원이 되기 위해',
    '들판, 평원, 연금실, 성소, 협곡,\n그리고 심판의 성을 향해 떠난다.'
  ]},
  { image: 'images/scene4.png', lightning: true, lines: [
    '하지만 왕국의 끝에는',
    '우량종자 공급을 방해하는\n최종 보스가 기다리고 있다.',
    '당신의 올바른 판단만이 세상을 구할 수 있다.',
    '__NAME__의 모험이 시작된다.'
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
    el.classList.toggle('active', i === idx);
    if (i === idx) {
      const bg = el.querySelector('.op-scene-bg');
      if (bg) {
        bg.style.animation = 'none'; void bg.offsetWidth;
        bg.style.animation = 'op-slow-pan 9s ease-in-out forwards';
      }
    }
  });
  if (OP_SCENES[idx].lightning) {
    const flash = opSceneEls[idx].querySelector('.op-flash');
    setTimeout(() => {
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 600);
    }, 900);
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
    const fb = document.getElementById('op-fade-black');
    fb.style.opacity = '1';
    setTimeout(() => {
      opSceneIdx++; opLineIdx = 0;
      opSetScene(opSceneIdx); opShowLine();
    }, 320);
    setTimeout(() => { fb.style.opacity = '0'; }, 640);
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
  const fb = document.getElementById('op-fade-black');
  fb.style.opacity = '1';
  setTimeout(() => {
    opSceneIdx = OP_SCENES.length - 1;
    opLineIdx  = OP_SCENES[opSceneIdx].lines.length - 1;
    opSetScene(opSceneIdx);
    document.getElementById('op-text').innerHTML = opRenderLine(OP_SCENES[opSceneIdx].lines[opLineIdx]);
    opTyping = false;
    fb.style.opacity = '0';
    opFinish();
  }, 400);
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
  document.getElementById('op-arrow').style.display = 'block';
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

    // 스프라이트 아이콘
    const icon = document.createElement('div');
    icon.className = 'node-icon';
    div.appendChild(icon);

    // 보스 태그 (아이콘 아래)
    if (isBoss) {
      const bossTag = document.createElement('div');
      bossTag.className = 'boss-tag';
      bossTag.textContent = '⚠ BOSS';
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
  G.currentNode = idx;
  const node = NODES[idx];
  const hpArr = ['', '❤️', '❤️❤️', '❤️❤️❤️'];
  const typeLabel = node.type === 'boss' ? '(보스)' : idx === 0 ? '(초심자)' : '(일반)';
  document.getElementById('popup-emoji').textContent = node.enemyEmoji;
  document.getElementById('popup-enemy').textContent = node.enemy;
  document.getElementById('popup-desc').textContent = node.desc;
  document.getElementById('popup-hp').textContent = '체력: ' + hpArr[node.maxHp] + ' ' + typeLabel + ' · 문제: 5개';
  document.getElementById('node-popup').classList.add('show');
}

function closeNodePopup() {
  document.getElementById('node-popup').classList.remove('show');
}

// ==============================
// TUTORIAL
// ==============================

// ==============================
// 오답노트
// ==============================
function showWrongnote() {
  const list = WrongNote.load();
  const body = document.getElementById('wrongnote-body');
  body.innerHTML = '';

  if (list.length === 0) {
    body.innerHTML = '<div class="wrongnote-empty">❗ 아직 틀린 문제가 없습니다.<br>모험을 시작하세요!</div>';
  } else {
    list.forEach(item => {
      const div = document.createElement('div');
      div.className = 'wrongnote-item';
      div.innerHTML =
        '<div class="wrongnote-item-q">' + highlightNumbers(item.text) + '</div>' +
        '<div class="wrongnote-item-ans">정답: ' + (item.answer === 'pass' ? '✅ 합격' : '❌ 불합격') + '</div>' +
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
  if (confirm('오답노트를 모두 지우시겠습니까?')) {
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
  const bgmBtn = document.getElementById('bgm-toggle');
  const seBtn = document.getElementById('se-toggle');
  if (bgmBtn) {
    bgmBtn.textContent = Sound.isBGMOn() ? 'ON' : 'OFF';
    bgmBtn.className = 'setting-toggle' + (Sound.isBGMOn() ? ' on' : '');
  }
  if (seBtn) {
    seBtn.textContent = Sound.isSEOn() ? 'ON' : 'OFF';
    seBtn.className = 'setting-toggle' + (Sound.isSEOn() ? ' on' : '');
  }
}

function toggleBGM() {
  Sound.toggleBGM();
  if (Sound.isBGMOn()) Sound.playBGM('bgm_title');
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
  closeNodePopup();
  const node = NODES[G.currentNode];
  const isBoss = node.type === 'boss';

  document.getElementById('enc-emoji').textContent = node.enemyEmoji;
  document.getElementById('enc-name').textContent = node.enemy;

  // 보스 등장 대사
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

  // 화면 흔들림
  const ec = document.getElementById('encounter-screen');
  ec.style.animation = 'none';
  requestAnimationFrame(() => {
    ec.style.animation = 'screen-shake 0.4s ease-out';
  });

  // BGM
  Sound.playBGM(isBoss ? 'bgm_boss' : 'bgm_battle');
}

function startActualBattle() {
  resetNodeBattle(G.currentNode);
  const node = NODES[G.currentNode];
  const isBoss = node.type === 'boss';

  document.getElementById('battle-enemy-name').textContent = node.enemy;
  document.getElementById('battle-name-badge').textContent = '⚔ ' + node.enemy;

  // 카드형 적 이미지 영역
  const cardImg = document.getElementById('battle-card-img');
  const cardFade = document.getElementById('battle-card-fade');
  if (node.enemyImage) {
    cardImg.innerHTML = '<img src="' + node.enemyImage + '" alt="' + node.enemy + '">';
    cardImg.className = 'battle-card-img';
    cardFade.style.display = 'block';
  } else {
    // 이미지 없으면 이모지 폴백
    cardImg.innerHTML = node.enemyEmoji;
    cardImg.className = 'battle-card-img emoji-mode' + (isBoss ? ' boss-bg' : '');
    cardFade.style.display = 'none';
  }

  // 보스 전용 UI
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

  renderHp();
  loadQuestion();
  showScreen('battle-screen');
}

// ==============================
// HP
// ==============================
function renderHp() {
  const node = NODES[G.currentNode];
  const el = document.getElementById('battle-hp');
  el.innerHTML = '';
  for (let i = 0; i < node.maxHp; i++) {
    const span = document.createElement('span');
    span.className = 'hp-icon' + (i >= G.hp ? ' empty' : '');
    span.id = 'hp-icon-' + i;
    span.textContent = '🌾';
    el.appendChild(span);
  }
}

function animateHpBreak(idx) {
  const el = document.getElementById('hp-icon-' + idx);
  if (el) {
    el.classList.add('breaking');
    setTimeout(() => el.classList.remove('breaking'), 500);
  }
}

// ==============================
// QUESTION
// ==============================
function loadQuestion() {
  const q = G.shuffledQ[G.currentQ];
  const formatted = formatQuestion(q.text);
  document.getElementById('battle-question').innerHTML = highlightNumbers(formatted);
  document.getElementById('q-counter').textContent = (G.currentQ + 1) + ' / 5';
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
    // 도장 이펙트
    stamp.textContent = q.answer === 'pass' ? '✅' : '🚫';
    stamp.classList.remove('show');
    requestAnimationFrame(() => stamp.classList.add('show'));
    // 적 흔들림
    const sprite = document.getElementById('battle-card-img');
    sprite.classList.add('shake');
    setTimeout(() => sprite.classList.remove('shake'), 500);
    Sound.playSE('se_correct');
    Sound.playSE('se_stamp');
  } else {
    G.wrong++; G.totalWrong++;
    // 오답노트에 저장
    WrongNote.add(q);
    // 체력 감소 + 애니메이션
    animateHpBreak(G.hp - 1);
    G.hp--;
    setTimeout(renderHp, 400);
    // 화면 흔들림
    const screen = document.getElementById('battle-screen');
    screen.classList.add('shake');
    setTimeout(() => screen.classList.remove('shake'), 400);
    Sound.playSE('se_wrong');
  }

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
  G.currentQ++;
  if (G.currentQ >= 5) stageClear();
  else loadQuestion();
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
  document.getElementById('clear-title').textContent = isLast ? '🎉 최종 보스 격파!' : node.label + ' 클리어!';
  document.getElementById('clear-sub').textContent = isLast ? '왕국의 질서가 되찾아졌다!' : '다음 지역으로 나아가자!';
  document.getElementById('cs-correct').textContent = G.correct + '개';
  document.getElementById('cs-wrong').textContent = G.wrong + '개';
  document.getElementById('cs-hp').textContent = hpStr(G.hp);
  showScreen('clear-screen');
}

function afterClear() {
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
