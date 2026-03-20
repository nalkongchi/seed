/* ═══════════════════════════════════════════
   GAME STATE & CONFIG
   ═══════════════════════════════════════════ */
let G = {
    playerName: '',
    nodeStatus: Array(NODES.length).fill('locked'),
    currentNode: 0,
    currentQ: 0,
    shuffledQ: [],
    hp: 3,         // 내 고정 체력
    enemyHp: 3,    // 적 가변 체력
    enemyMaxHp: 3,
    correct: 0, wrong: 0, totalCorrect: 0, totalWrong: 0
};
G.nodeStatus[0] = 'available';

const SOUND_FILES = {
    bgm_title: 'sounds/bgm_title.mp3',
    bgm_battle: 'sounds/bgm_battle.mp3',
    bgm_boss: 'sounds/bgm_boss.mp3',
    se_correct: 'sounds/se_correct.mp3',
    se_wrong: 'sounds/se_wrong.mp3',
    se_stamp: 'sounds/se_stamp.mp3',
    se_clear: 'sounds/se_clear.mp3',
    se_gameover: 'sounds/se_gameover.mp3',
};

/* ═══════════════════════════════════════════
   SOUND & STORAGE
   ═══════════════════════════════════════════ */
const Sound = (() => {
    let bgmEl = null;
    const settings = { bgm: true, se: true };
    function playBGM(key) {
        if (!settings.bgm) return;
        if (bgmEl) { bgmEl.pause(); bgmEl = null; }
        try {
            bgmEl = new Audio(SOUND_FILES[key]);
            bgmEl.loop = true; bgmEl.volume = 0.5; bgmEl.play().catch(()=>{});
        } catch(e) {}
    }
    function stopBGM() { if (bgmEl) { bgmEl.pause(); bgmEl = null; } }
    function playSE(key) {
        if (!settings.se) return;
        try { const a = new Audio(SOUND_FILES[key]); a.volume = 0.7; a.play().catch(()=>{}); } catch(e) {}
    }
    function setBGMVol(v) { if (bgmEl) bgmEl.volume = v/100; }
    function setSEVol(v) {}
    return { playBGM, stopBGM, playSE, setBGMVol, setSEVol, loadSettings:()=>{}, isBGMOn:()=>true, isSEOn:()=>true };
})();

const WrongNote = { add: (q) => {}, load: () => [], clear: () => {} };

/* ═══════════════════════════════════════════
   CORE NAVIGATION
   ═══════════════════════════════════════════ */
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function goToNameInput() { showScreen('name-screen'); }
function goBackToTitle() { showScreen('title-screen'); }
function confirmName() {
    const val = document.getElementById('player-name-input').value.trim();
    G.playerName = val || '지망생';
    startOpening();
}

/* ═══════════════════════════════════════════
   OPENING & TRANSITION
   ═══════════════════════════════════════════ */
let opSceneIdx = 0, opLineIdx = 0, opSceneEls = [];

function startOpening() {
    showScreen('opening-screen');
    const container = document.getElementById('op-scene-container');
    container.innerHTML = '';
    opSceneEls = OP_SCENES.map((scene, idx) => {
        const layer = document.createElement('div');
        layer.className = 'op-scene-layer';
        layer.innerHTML = `<img class="op-scene-bg" src="${scene.image}"><div class="op-flash"></div>`;
        container.appendChild(layer);
        return layer;
    });
    opSceneIdx = 0; opLineIdx = 0;
    opSceneEls[0].classList.add('active', 'wipe-in');
    opShowLine();
}

function opShowLine() {
    const line = OP_SCENES[opSceneIdx].lines[opLineIdx];
    document.getElementById('op-text').innerHTML = line.replace(/__NAME__/g, G.playerName);
}

function opNextStep() {
    const scene = OP_SCENES[opSceneIdx];
    if (opLineIdx < scene.lines.length - 1) {
        opLineIdx++; opShowLine(); return;
    }
    if (opSceneIdx < OP_SCENES.length - 1) {
        const oldLayer = opSceneEls[opSceneIdx];
        oldLayer.classList.remove('wipe-in');
        oldLayer.classList.add('wipe-out');
        setTimeout(() => {
            oldLayer.classList.remove('active', 'wipe-out');
            opSceneIdx++; opLineIdx = 0;
            const newLayer = opSceneEls[opSceneIdx];
            newLayer.classList.add('active', 'wipe-in');
            opShowLine();
        }, 500);
        return;
    }
    document.getElementById('op-end-btn').style.display = 'block';
}

function startGame() { showScreen('map-screen'); renderMap(); }

/* ═══════════════════════════════════════════
   BATTLE SYSTEM
   ═══════════════════════════════════════════ */
function startBattle() {
    resetNodeBattle(G.currentNode);
    showScreen('encounter-screen');
    document.getElementById('enc-name').textContent = NODES[G.currentNode].enemy;
}

function startActualBattle() {
    showScreen('battle-screen');
    const node = NODES[G.currentNode];
    const cardImg = document.getElementById('battle-card-img');
    if (node.enemyImage) {
        cardImg.innerHTML = `<img src="${node.enemyImage}">`;
    } else {
        cardImg.innerHTML = node.enemyEmoji;
        cardImg.className = 'desk-enemy emoji-mode';
    }
    document.getElementById('battle-enemy-name').textContent = node.enemy;
    renderHp();
    loadQuestion();
}

function resetNodeBattle(idx) {
    G.currentNode = idx;
    G.hp = 3;
    G.enemyMaxHp = NODES[idx].maxHp || 3;
    G.enemyHp = G.enemyMaxHp;
    G.shuffledQ = shuffle([...NODES[idx].questions]);
    G.currentQ = 0;
}

function renderHp() {
    const pFill = document.getElementById('player-hp-fill');
    const pText = document.getElementById('player-hp-text');
    if (pFill && pText) {
        const pPct = (G.hp / 3) * 100;
        pFill.style.width = pPct + '%';
        pText.textContent = `${G.hp} / 3`;
        pFill.className = 'hp-bar-fill player-fill ' + (G.hp <= 1 ? 'danger' : G.hp <= 2 ? 'warning' : '');
    }
    const eFill = document.getElementById('enemy-hp-fill');
    const eText = document.getElementById('enemy-hp-text');
    if (eFill && eText) {
        const ePct = (G.enemyHp / G.enemyMaxHp) * 100;
        eFill.style.width = ePct + '%';
        eText.textContent = `${G.enemyHp} / ${G.enemyMaxHp}`;
    }
}

function loadQuestion() {
    const q = G.shuffledQ[G.currentQ];
    document.getElementById('battle-question').textContent = q.text;
    document.getElementById('q-counter').textContent = `심사 진행 중...`;
    document.querySelectorAll('.judge-btn').forEach(b => b.disabled = false);
}

function answer(choice) {
    const q = G.shuffledQ[G.currentQ];
    const correct = (choice === q.answer);
    document.querySelectorAll('.judge-btn').forEach(b => b.disabled = true);
    
    if (correct) {
        G.enemyHp--;
        document.getElementById('battle-card-img').classList.add('shake');
        setTimeout(() => document.getElementById('battle-card-img').classList.remove('shake'), 500);
        Sound.playSE('se_correct');
    } else {
        G.hp--;
        document.getElementById('battle-screen').classList.add('shake');
        setTimeout(() => document.getElementById('battle-screen').classList.remove('shake'), 400);
        Sound.playSE('se_wrong');
    }
    renderHp();
    document.getElementById('result-popup').classList.add('show');
}

function nextQuestion() {
    document.getElementById('result-popup').classList.remove('show');
    if (G.hp <= 0) { showScreen('gameover-screen'); return; }
    if (G.enemyHp <= 0) { stageClear(); return; }
    G.currentQ++;
    if (G.currentQ >= G.shuffledQ.length) G.shuffledQ = shuffle(G.shuffledQ);
    loadQuestion();
}

/* ═══════════════════════════════════════════
   UTILS & OTHERS
   ═══════════════════════════════════════════ */
function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }
function renderMap() { /* 기존 로직과 동일하게 노드 렌더링 */ }
function stageClear() { showScreen('clear-screen'); }
function afterClear() { showScreen('map-screen'); renderMap(); }
function retryNode() { startBattle(); }
function goTitle() { location.reload(); }
function showSetting() { document.getElementById('setting-popup').classList.add('show'); }
function closeSetting() { document.getElementById('setting-popup').classList.remove('show'); }
function showExitConfirm() { document.getElementById('exit-confirm').classList.add('show'); }
function hideExitConfirm() { document.getElementById('exit-confirm').classList.remove('show'); }
function exitToMap() { showScreen('map-screen'); hideExitConfirm(); }

// 초기 실행
window.onload = () => { Sound.playBGM('bgm_title'); };
