/* ═══════════════════════════════════════════
   GAME STATE
   ═══════════════════════════════════════════ */
let G = {
    playerName: '',
    nodeStatus: Array(NODES.length).fill('locked'),
    currentNode: 0,
    currentQ: 0,
    shuffledQ: [],
    hp: 3,         // 나의 고정 목숨
    enemyHp: 3,    // 적의 가변 체력
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
   SOUND SYSTEM
   ═══════════════════════════════════════════ */
const Sound = (() => {
    let bgmEl = null;
    const settings = { bgm: true, se: true };
    function playBGM(key) {
        if (!settings.bgm) return;
        if (bgmEl) { bgmEl.pause(); bgmEl = null; }
        try {
            bgmEl = new Audio(SOUND_FILES[key]);
            bgmEl.loop = true; bgmEl.volume = 0.5;
            bgmEl.play().catch(()=>{});
        } catch(e) {}
    }
    function stopBGM() { if (bgmEl) { bgmEl.pause(); bgmEl = null; } }
    function playSE(key) {
        if (!settings.se) return;
        try { const a = new Audio(SOUND_FILES[key]); a.volume = 0.7; a.play().catch(()=>{}); } catch(e) {}
    }
    function setBGMVol(v) { if (bgmEl) bgmEl.volume = v/100; }
    return { playBGM, stopBGM, playSE, setBGMVol };
})();

const WrongNote = { 
    load: () => JSON.parse(localStorage.getItem('seedGame_wrong')) || [],
    add: (q) => {
        let list = JSON.parse(localStorage.getItem('seedGame_wrong')) || [];
        if (!list.find(i => i.text === q.text)) list.push(q);
        localStorage.setItem('seedGame_wrong', JSON.stringify(list));
    },
    clear: () => localStorage.removeItem('seedGame_wrong')
};

/* ═══════════════════════════════════════════
   CORE LOGIC
   ═══════════════════════════════════════════ */
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function goToNameInput() { showScreen('name-screen'); }
function goBackToTitle() { showScreen('title-screen'); }

function confirmName() {
    const val = document.getElementById('player-name-input').value.trim();
    G.playerName = val || '용사'; // 기본 이름 설정
    startOpening();
}

function continueGame() {
    const saved = localStorage.getItem('seedGame_v3');
    if (saved) {
        const data = JSON.parse(saved);
        G.playerName = data.playerName;
        G.nodeStatus = data.nodeStatus;
        showScreen('map-screen');
        renderMap();
        Sound.playBGM('bgm_title');
    }
}

function saveGame() {
    localStorage.setItem('seedGame_v3', JSON.stringify({
        playerName: G.playerName,
        nodeStatus: G.nodeStatus
    }));
}

/* ═══════════════════════════════════════════
   OPENING & PIXEL TRANSITION
   ═══════════════════════════════════════════ */
let opSceneIdx = 0, opLineIdx = 0, opSceneEls = [];

function startOpening() {
    showScreen('opening-screen');
    const container = document.getElementById('op-scene-container');
    container.innerHTML = '';
    opSceneEls = OP_SCENES.map((scene) => {
        const layer = document.createElement('div');
        layer.className = 'op-scene-layer';
        layer.innerHTML = `<img class="op-scene-bg" src="${scene.image}">`;
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

document.getElementById('op-tap').onclick = () => {
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
};

document.getElementById('op-skip').onclick = () => {
    opSceneEls.forEach(el => el.classList.remove('active', 'wipe-in', 'wipe-out'));
    opSceneIdx = OP_SCENES.length - 1;
    opLineIdx = OP_SCENES[opSceneIdx].lines.length - 1;
    opSceneEls[opSceneIdx].classList.add('active', 'wipe-in');
    opShowLine();
    document.getElementById('op-end-btn').style.display = 'block';
};

document.getElementById('op-end-btn').onclick = () => {
    showScreen('map-screen');
    renderMap();
    Sound.playBGM('bgm_title');
};

/* ═══════════════════════════════════════════
   MAP & NODES
   ═══════════════════════════════════════════ */
function renderMap() {
    const container = document.getElementById('nodes-container');
    container.innerHTML = '';
    const clearedCount = G.nodeStatus.filter(s => s === 'cleared').length;
    document.getElementById('map-progress-text').textContent = `정화된 구역: ${clearedCount} / ${NODES.length}`;

    NODES.forEach((node, i) => {
        const status = G.nodeStatus[i];
        const div = document.createElement('div');
        div.className = `map-node stage-${i} ${status}`;
        div.style.left = `${node.x}px`;
        div.style.top = `${node.y}px`;
        div.innerHTML = `<div class="node-icon"></div>`;
        if (status !== 'locked') div.onclick = () => {
            G.currentNode = i;
            document.getElementById('popup-enemy').textContent = node.enemy;
            document.getElementById('popup-desc').textContent = node.desc;
            document.getElementById('popup-hp').textContent = `적 체력: ${node.maxHp}`;
            document.getElementById('node-popup').style.display = 'flex';
        };
        container.appendChild(div);
    });
}

function closeNodePopup() { document.getElementById('node-popup').style.display = 'none'; }

function startBattle() {
    closeNodePopup();
    G.hp = 3;
    G.enemyMaxHp = NODES[G.currentNode].maxHp || 3;
    G.enemyHp = G.enemyMaxHp;
    G.shuffledQ = shuffle([...NODES[G.currentNode].questions]);
    G.currentQ = 0;

    showScreen('encounter-screen');
    document.getElementById('enc-name').textContent = NODES[G.currentNode].enemy;
    const encImg = document.getElementById('enc-enemy-img');
    encImg.style.backgroundImage = `url(${NODES[G.currentNode].enemyImage})`;
    Sound.playBGM('bgm_battle');
}

/* ═══════════════════════════════════════════
   BATTLE LOGIC (DEATHMATCH)
   ═══════════════════════════════════════════ */
function startActualBattle() {
    showScreen('battle-screen');
    const node = NODES[G.currentNode];
    const cardImg = document.getElementById('battle-card-img');
    cardImg.innerHTML = node.enemyImage ? `<img src="${node.enemyImage}">` : node.enemyEmoji;
    cardImg.className = 'desk-enemy' + (node.enemyImage ? '' : ' emoji-mode');
    document.getElementById('battle-enemy-name').textContent = node.enemy;
    document.getElementById('battle-name-badge').textContent = node.enemy;
    document.getElementById('boss-label').style.display = node.type === 'boss' ? 'block' : 'none';
    renderHp();
    loadQuestion();
}

function renderHp() {
    const pFill = document.getElementById('player-hp-fill');
    const pText = document.getElementById('player-hp-text');
    const pPct = (G.hp / 3) * 100;
    pFill.style.width = `${pPct}%`;
    pText.textContent = `${G.hp} / 3`;
    pFill.className = 'hp-bar-fill player-fill ' + (G.hp <= 1 ? 'danger' : G.hp <= 2 ? 'warning' : '');

    const eFill = document.getElementById('enemy-hp-fill');
    const eText = document.getElementById('enemy-hp-text');
    const ePct = (G.enemyHp / G.enemyMaxHp) * 100;
    eFill.style.width = `${ePct}%`;
    eText.textContent = `${G.enemyHp} / ${G.enemyMaxHp}`;
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
        WrongNote.add(q);
    }
    renderHp();
    document.getElementById('result-title').textContent = correct ? '정답!' : '오판!';
    document.getElementById('result-reason').textContent = q.reason;
    document.getElementById('result-popup').classList.add('show');
}

function nextQuestion() {
    document.getElementById('result-popup').classList.remove('show');
    if (G.hp <= 0) { showScreen('gameover-screen'); Sound.playSE('se_gameover'); return; }
    if (G.enemyHp <= 0) {
        G.nodeStatus[G.currentNode] = 'cleared';
        if (G.currentNode + 1 < NODES.length) G.nodeStatus[G.currentNode + 1] = 'available';
        saveGame();
        showScreen('clear-screen');
        Sound.playSE('se_clear');
        return;
    }
    G.currentQ++;
    if (G.currentQ >= G.shuffledQ.length) G.shuffledQ = shuffle(G.shuffledQ);
    loadQuestion();
}

/* ═══════════════════════════════════════════
   UTILS & FOOTER
   ═══════════════════════════════════════════ */
function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }
function afterClear() { showScreen('map-screen'); renderMap(); Sound.playBGM('bgm_title'); }
function retryNode() { startBattle(); }
function goTitle() { location.reload(); }
function showSetting() { document.getElementById('setting-popup').classList.add('show'); }
function closeSetting() { document.getElementById('setting-popup').classList.remove('show'); }
function showExitConfirm() { document.getElementById('exit-confirm').classList.add('show'); }
function hideExitConfirm() { document.getElementById('exit-confirm').classList.remove('show'); }
function exitToMap() { showScreen('map-screen'); hideExitConfirm(); Sound.playBGM('bgm_title'); }
function confirmGoTitle() { if(confirm("타이틀로 돌아가시겠습니까?")) goTitle(); }

window.onload = () => { Sound.playBGM('bgm_title'); };
