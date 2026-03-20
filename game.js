// ============================================================
// game.js - 나는야 종자검사원 게임 로직
// ============================================================

const SOUND_FILES = {
 bgm_title: 'sounds/bgm_title.mp3',
 bgm_battle: 'sounds/bgm_battle.mp3',
 bgm_boss: 'sounds/bgm_boss.mp3',
 se_correct: 'sounds/se_correct.mp3',
 se_wrong: 'sounds/se_wrong.mp3',
 se_stamp: 'sounds/se_stamp.mp3',
 se_clear: 'sounds/se_clear.mp3',
 se_gameover:'sounds/se_gameover.mp3',
};

const Sound = (() => {
 let bgmEl = null;
 const settings = { bgm: true, se: true };
 function loadSettings() {
 try { const s = localStorage.getItem('seedGame_sound'); if (s) Object.assign(settings, JSON.parse(s)); } catch(e) {}
 }
 function saveSettings() {
 try { localStorage.setItem('seedGame_sound', JSON.stringify(settings)); } catch(e) {}
 }
 function playBGM(key) {
 if (!settings.bgm) return;
 if (bgmEl) { bgmEl.pause(); bgmEl = null; }
 try { bgmEl = new Audio(SOUND_FILES[key]); bgmEl.loop = true; bgmEl.volume = 0.5; bgmEl.play().catch(()=>{}); } catch(e) {}
 }
 function stopBGM() { if (bgmEl) { bgmEl.pause(); bgmEl = null; } }
 function playSE(key) {
 if (!settings.se) return;
 try { const a = new Audio(SOUND_FILES[key]); a.volume = 0.7; a.play().catch(()=>{}); } catch(e) {}
 }
 function setBGMVol(val) {
 const v = parseInt(val) / 100;
 settings.bgm = v > 0;
 if (bgmEl) { bgmEl.volume = v; if (!settings.bgm) bgmEl.pause(); else bgmEl.play().catch(()=>{}); }
 const el = document.getElementById('bgm-val'); if (el) el.textContent = val;
 saveSettings();
 }
 function setSEVol(val) {
 const v = parseInt(val) / 100; settings.se = v > 0;
 const el = document.getElementById('se-val'); if (el) el.textContent = val;
 saveSettings();
 }
 return { playBGM, stopBGM, playSE, loadSettings, setBGMVol, setSEVol, isBGMOn: () => settings.bgm, isSEOn: () => settings.se };
})();

const WrongNote = (() => {
 const KEY = 'seedGame_wrongnote';
 return {
 load: () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e) { return []; } },
 add: (q) => {
  const list = WrongNote.load();
  if (!list.find(item => item.text === q.text)) { list.unshift(q); if (list.length > 50) list.pop(); localStorage.setItem(KEY, JSON.stringify(list)); }
 },
 clear: () => localStorage.removeItem(KEY)
 };
})();

let G = {
 playerName: '',
 nodeStatus: Array(NODES.length).fill('locked'),
 currentNode: 0, currentQ: 0, shuffledQ: [],
 hp: 3, enemyHp: 3, enemyMaxHp: 3,
 correct: 0, wrong: 0, totalCorrect: 0, totalWrong: 0
};
G.nodeStatus[0] = 'available';

function showScreen(id) {
 document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
 document.getElementById(id).classList.add('active');
}

function confirmName() {
 const val = document.getElementById('player-name-input').value.trim();
 G.playerName = val || '용사';
 startOpening();
}

// ════ OPENING (Pixel Wipe) ════
const OP_SCENES = [
 { image: 'images/scene1.png', lines: ['오래전, 종자 왕국의 질서가 무너졌다.'] },
 { image: 'images/scene2.png', lines: ['세상의 균형을 바로잡는 자, 그들이 바로 종자검사원이다.'] },
 { image: 'images/scene3.png', lines: ['당신은 정식 검사원이 되기 위해 모험을 떠난다.'] },
 { image: 'images/scene4.png', lines: ['__NAME__의 모험이 시작된다.'] }
];
let opSceneIdx = 0, opLineIdx = 0, opTyping = false, opFullLine = '', opTypingTimer = null, opSceneEls = [];

function opTypeLine(line) {
 clearTimeout(opTypingTimer); opTyping = true; opFullLine = line;
 const plain = line.replace(/__NAME__/g, G.playerName);
 const textEl = document.getElementById('op-text');
 let i = 0; textEl.innerHTML = '';
 function tick() {
 textEl.textContent = plain.slice(0,i); i++;
 if (i <= plain.length) opTypingTimer = setTimeout(tick, 32);
 else { textEl.innerHTML = line.replace(/__NAME__/g, '<span class="op-player-name">'+G.playerName+'</span>'); opTyping = false; }
 }
 tick();
}

function opSetScene(idx) {
 opSceneEls.forEach((el, i) => {
 if (i === idx) { el.classList.add('active', 'wipe-in'); el.classList.remove('wipe-out'); }
 else if (el.classList.contains('active')) { el.classList.add('wipe-out'); el.classList.remove('active', 'wipe-in'); }
 });
}

function opNextStep() {
 if (opTyping) { clearTimeout(opTypingTimer); document.getElementById('op-text').innerHTML = opFullLine.replace(/__NAME__/g, G.playerName); opTyping = false; return; }
 if (opLineIdx < OP_SCENES[opSceneIdx].lines.length - 1) { opLineIdx++; opTypeLine(OP_SCENES[opSceneIdx].lines[opLineIdx]); return; }
 if (opSceneIdx < OP_SCENES.length - 1) { opSceneIdx++; opLineIdx = 0; opSetScene(opSceneIdx); opTypeLine(OP_SCENES[opSceneIdx].lines[opLineIdx]); return; }
 document.getElementById('op-end-btn').style.display = 'block'; document.getElementById('op-arrow').style.display = 'none';
}

function startOpening() {
 showScreen('opening-screen');
 const container = document.getElementById('op-scene-container'); container.innerHTML = '';
 opSceneEls = OP_SCENES.map((scene, i) => {
 const layer = document.createElement('div'); layer.className = 'op-scene-layer' + (i===0?' active':'');
 layer.innerHTML = `<img class="op-scene-bg" src="${scene.image}">`; container.appendChild(layer); return layer;
 });
 opSceneIdx = 0; opLineIdx = 0; opTypeLine(OP_SCENES[0].lines[0]);
 document.getElementById('op-tap').onclick = opNextStep;
 document.getElementById('op-skip').onclick = () => { opSceneIdx = OP_SCENES.length-1; opLineIdx = OP_SCENES[opSceneIdx].lines.length-1; opSetScene(opSceneIdx); opTypeLine(OP_SCENES[opSceneIdx].lines[opLineIdx]); document.getElementById('op-end-btn').style.display='block'; };
 document.getElementById('op-end-btn').onclick = startGame;
}

function startGame() { showScreen('map-screen'); renderMap(); Sound.playBGM('bgm_title'); }

function renderMap() {
 const container = document.getElementById('nodes-container'); container.innerHTML = '';
 NODES.forEach((node, i) => {
 const div = document.createElement('div'); div.className = `map-node stage-${i} ${G.nodeStatus[i]}`;
 div.style.left = node.x + 'px'; div.style.top = node.y + 'px';
 if (G.nodeStatus[i] !== 'locked') div.onclick = () => {
  G.currentNode = i; document.getElementById('popup-enemy').textContent = node.enemy;
  document.getElementById('popup-hp').textContent = '적 체력: '+node.maxHp; document.getElementById('node-popup').classList.add('show');
 };
 container.appendChild(div);
 });
}

function closeNodePopup() { document.getElementById('node-popup').classList.remove('show'); }

function startBattle() {
 closeNodePopup(); const node = NODES[G.currentNode];
 document.getElementById('enc-enemy-img').style.backgroundImage = `url(${node.enemyImage})`;
 document.getElementById('enc-name').textContent = node.enemy; showScreen('encounter-screen');
 Sound.playBGM(node.type === 'boss' ? 'bgm_boss' : 'bgm_battle');
}

function startActualBattle() {
 const node = NODES[G.currentNode]; G.hp = 3; G.enemyMaxHp = node.maxHp; G.enemyHp = G.enemyMaxHp;
 G.shuffledQ = [...node.questions].sort(() => Math.random() - 0.5); G.currentQ = 0;
 document.getElementById('battle-enemy-name').textContent = node.enemy;
 document.getElementById('battle-name-badge').textContent = node.enemy;
 document.getElementById('battle-card-img').innerHTML = `<img src="${node.enemySprite || node.enemyImage}">`;
 renderHp(); loadQuestion(); showScreen('battle-screen');
}

function renderHp() {
 const pFill = document.getElementById('player-hp-fill');
 pFill.style.width = (G.hp / 3 * 100) + '%'; document.getElementById('player-hp-text').textContent = `${G.hp} / 3`;
 const eFill = document.getElementById('enemy-hp-fill');
 eFill.style.width = (G.enemyHp / G.enemyMaxHp * 100) + '%'; document.getElementById('enemy-hp-text').textContent = `${G.enemyHp} / ${G.enemyMaxHp}`;
}

function loadQuestion() {
 const q = G.shuffledQ[G.currentQ]; document.getElementById('battle-question').textContent = q.text;
 document.querySelectorAll('.judge-btn').forEach(b => b.disabled = false);
}

function answer(choice) {
 document.querySelectorAll('.judge-btn').forEach(b => b.disabled = true);
 const q = G.shuffledQ[G.currentQ]; const correct = choice === q.answer;
 if (correct) { G.enemyHp--; document.getElementById('battle-card-img').classList.add('shake'); setTimeout(()=>document.getElementById('battle-card-img').classList.remove('shake'), 500); Sound.playSE('se_correct'); }
 else { G.hp--; WrongNote.add(q); document.getElementById('battle-screen').classList.add('shake'); setTimeout(()=>document.getElementById('battle-screen').classList.remove('shake'), 400); Sound.playSE('se_wrong'); }
 renderHp(); document.getElementById('result-title').textContent = correct ? '정답!' : '오답!';
 document.getElementById('result-reason').textContent = q.reason; document.getElementById('result-popup').classList.add('show');
}

function nextQuestion() {
 document.getElementById('result-popup').classList.remove('show');
 if (G.hp <= 0) { showScreen('gameover-screen'); return; }
 if (G.enemyHp <= 0) { G.nodeStatus[G.currentNode] = 'cleared'; if(G.currentNode < NODES.length-1) G.nodeStatus[G.currentNode+1] = 'available'; showScreen('clear-screen'); return; }
 G.currentQ++; if (G.currentQ >= G.shuffledQ.length) G.shuffledQ.sort(() => Math.random() - 0.5), G.currentQ = 0;
 loadQuestion();
}

function afterClear() { showScreen('map-screen'); renderMap(); Sound.playBGM('bgm_title'); }
function goTitle() { location.reload(); }
function goBackToTitle() { showScreen('title-screen'); }
function goToNameInput() { showScreen('name-screen'); }
function showExitConfirm() { document.getElementById('exit-confirm').classList.add('show'); }
function hideExitConfirm() { document.getElementById('exit-confirm').classList.remove('show'); }
function exitToMap() { hideExitConfirm(); showScreen('map-screen'); renderMap(); Sound.playBGM('bgm_title'); }

Sound.loadSettings();
