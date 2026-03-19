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

  return { playBGM, stopBGM, playSE, toggleBGM, toggleSE, isBGMOn, isSEOn, loadSettings };
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
// 별 생성 (타이틀용)
// ==============================
(function createStars() {
  const c = document.getElementById('stars');
  if (!c) return;
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 3 + 's';
    s.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    c.appendChild(s);
  }
})();

// ==============================
// TITLE
// ==============================
function initTitle() {
  const saved = loadSave();
  const btn = document.getElementById('continue-btn');
  if (saved && saved.playerName) {
    btn.disabled = false;
    btn.textContent = '📖 이어하기 (' + saved.playerName + ')';
  } else {
    btn.disabled = true;
    btn.textContent = '📖 이어하기 (저장 없음)';
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
  if (!val) {
    const inp = document.getElementById('player-name-input');
    inp.style.borderColor = '#ff4444';
    setTimeout(() => inp.style.borderColor = 'var(--green)', 800);
    return;
  }
  resetWholeGame();
  G.playerName = val;
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
  renderMap();
  showScreen('map-screen');
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

function toggleMapBGM() {
  const isOn = Sound.toggleBGM();
  const btn = document.getElementById('map-bgm-btn');
  if (btn) {
    btn.textContent = isOn ? '🎵 BGM ON' : '🔇 BGM OFF';
    btn.className = 'map-bgm-btn' + (isOn ? '' : ' off');
  }
  if (isOn) Sound.playBGM('bgm_title');
  updateSettingUI();
}

function updateMapBGMBtn() {
  const btn = document.getElementById('map-bgm-btn');
  if (!btn) return;
  const isOn = Sound.isBGMOn();
  btn.textContent = isOn ? '🎵 BGM ON' : '🔇 BGM OFF';
  btn.className = 'map-bgm-btn' + (isOn ? '' : ' off');
}

// ==============================
// OPENING
// ==============================
let openingTimer = null;
let openingIdx = 0;
let openingDone = false;

function onOpeningClick() {
  if (openingDone) return;
  if (openingTimer) { clearTimeout(openingTimer); openingTimer = null; }
  openingAdvance();
}

function openingAdvance() {
  if (openingIdx <= 11) {
    document.getElementById('op' + openingIdx).classList.add('visible');
    openingIdx++;
    openingTimer = setTimeout(openingAdvance, openingIdx <= 5 ? 1200 : 1000);
  } else {
    openingDone = true;
    openingTimer = setTimeout(() => {
      document.getElementById('opening-start-btn').style.display = 'inline-block';
      document.getElementById('opening-screen').removeEventListener('click', onOpeningClick);
    }, 400);
  }
}

function startOpening() {
  Sound.stopBGM();
  showScreen('opening-screen');
  document.getElementById('op11').textContent = '당신의 올바른 판단만이 세상을 구할 수 있다. 지금, 용사 ' + G.playerName + '의 모험이 시작된다.';
  for (let i = 0; i <= 11; i++) document.getElementById('op' + i).classList.remove('visible');
  document.getElementById('opening-start-btn').style.display = 'none';
  openingIdx = 0;
  openingDone = false;

  const screen = document.getElementById('opening-screen');
  screen.removeEventListener('click', onOpeningClick); // 중복 방지
  screen.addEventListener('click', onOpeningClick);

  openingAdvance();
}

function skipOpening() {
  if (openingTimer) clearTimeout(openingTimer);
  openingDone = true;
  for (let i = 0; i <= 11; i++) document.getElementById('op' + i).classList.add('visible');
  document.getElementById('opening-start-btn').style.display = 'inline-block';
  document.getElementById('opening-screen').removeEventListener('click', onOpeningClick);
}

function startGame() {
  renderMap();
  showScreen('map-screen');
  Sound.playBGM('bgm_title');
}

// ==============================
// MAP
// ==============================
function renderMap() {
  renderNodes();
  renderPaths();
  const cleared = G.nodeStatus.filter(s => s === 'cleared').length;
  document.getElementById('map-progress-text').textContent = cleared + ' / ' + NODES.length + ' 스테이지 클리어';
  updateMapBGMBtn();
}

function renderNodes() {
  const container = document.getElementById('nodes-container');
  container.innerHTML = '';
  NODES.forEach((node, i) => {
    const status = G.nodeStatus[i];
    const isBoss = node.type === 'boss';
    const div = document.createElement('div');
    div.className = 'map-node ' + status + (isBoss ? ' boss' : '');
    div.style.left = node.x + 'px';
    div.style.top = node.y + 'px';
    div.id = 'node-' + i;

    // 보스 BOSS 뱃지
    if (isBoss) {
      const bossTag = document.createElement('div');
      bossTag.style.cssText = 'font-size:9px;font-weight:900;color:#ff4444;letter-spacing:2px;margin-bottom:2px;text-shadow:1px 1px 0 #000;';
      bossTag.textContent = '⚠ BOSS';
      div.appendChild(bossTag);
    }

    const circle = document.createElement('div');
    circle.className = 'node-circle';
    circle.textContent = node.emoji;

    if (status === 'cleared') {
      const check = document.createElement('div');
      check.className = 'node-check';
      check.textContent = '✓';
      circle.appendChild(check);
    }

    const label = document.createElement('div');
    label.className = 'node-label';
    label.textContent = node.label;

    div.appendChild(circle);
    div.appendChild(label);
    if (status !== 'locked') div.onclick = () => openNodePopup(i);
    container.appendChild(div);
  });
}

function renderPaths() {
  const svg = document.getElementById('path-svg');
  svg.innerHTML = '';
  for (let i = 0; i < NODES.length - 1; i++) {
    const a = NODES[i], b = NODES[i + 1];
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('stroke', G.nodeStatus[i + 1] === 'locked' ? '#333' : '#7ab648');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-dasharray', '8,5');
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
function showTutorial() { document.getElementById('tutorial-popup').classList.add('show'); }
function closeTutorial() { document.getElementById('tutorial-popup').classList.remove('show'); }

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
    document.getElementById('battle-name-badge').style.borderColor = '#ff4444';
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
  renderMap();
  showScreen('map-screen');
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
  document.getElementById('clear-title').textContent = isLast ? '🎉 최종 보스 격파!' : node.label.replace('\n', ' ') + ' 클리어!';
  document.getElementById('clear-sub').textContent = isLast ? '왕국의 질서가 되찾아졌다!' : '다음 지역으로 나아가자!';
  document.getElementById('cs-correct').textContent = G.correct + '개';
  document.getElementById('cs-wrong').textContent = G.wrong + '개';
  document.getElementById('cs-hp').textContent = hpStr(G.hp);
  showScreen('clear-screen');
}

function afterClear() {
  if (G.currentNode === NODES.length - 1) showEnding();
  else { renderMap(); showScreen('map-screen'); Sound.playBGM('bgm_title'); }
}

// ==============================
// GAME OVER
// ==============================
function retryNode() {
  renderMap();
  showScreen('map-screen');
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
