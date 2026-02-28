# 🌾 나는야 종자검사원
> 검사원이 되기 위한 용사의 모험

도트풍 클래식 RPG형 종자 검사 교육 게임입니다.

---

## 📁 파일 구조

```
seed-game/
├── index.html     ← 메인 HTML (화면 구조)
├── style.css      ← 스타일
├── game.js        ← 게임 로직
├── data.js        ← 문제 데이터 (여기서만 수정!)
├── sounds/        ← 사운드 파일 폴더 (추후 추가)
│   ├── bgm_title.mp3
│   ├── bgm_battle.mp3
│   ├── bgm_boss.mp3
│   ├── se_correct.mp3
│   ├── se_wrong.mp3
│   ├── se_stamp.mp3
│   ├── se_clear.mp3
│   └── se_gameover.mp3
└── images/        ← 적 이미지 폴더 (추후 추가)
    ├── enemy_01.png   (수상한 채종농가)
    ├── enemy_02.png   (신규단지 회장)
    ├── enemy_03.png   (불량시료 조제사)
    ├── enemy_04.png   (엄격한 원종 관리자)
    ├── enemy_05.png   (집요한 감사관)
    └── enemy_06.png   (기준왜곡 대심판관)
```

---

## 🎮 게임 구성

| 노드 | 지역 | 적 | 체력 | 주제 |
|------|------|-----|------|------|
| 1 | 초심자의 들판 | 수상한 채종농가 | ❤️❤️❤️ | 보급종 기본 기준 |
| 2 | 황금 물결 농장 | 신규단지 회장 | ❤️❤️❤️ | 포장검사 기준 |
| 3 | 혼돈의 실험실 | 불량시료 조제사 | ❤️❤️ | 보급종 종자검사 |
| 4 | 혈통의 시험장 | 엄격한 원종 관리자 | ❤️❤️ | 원종·원원종 기준 |
| 5 | 법령의 협곡 | 집요한 감사관 | ❤️❤️ | 법령·감사 포인트 |
| 6 | 심판의 성 | 기준왜곡 대심판관 | ❤️ | 종합 고난도 (BOSS) |

---

## ✏️ 문제 수정 방법

`data.js` 파일에서만 수정하면 됩니다.

```javascript
{
  text: '"문제 내용"',
  answer: 'pass',   // 'pass' = 합격, 'fail' = 불합격
  reason: '판정 근거 설명'
}
```

---

## 🖼️ 적 이미지 교체 방법

`data.js`에서 각 노드의 `enemyImage` 값을 수정합니다.

```javascript
enemyImage: 'images/enemy_01.png'  // null → 이미지 경로로 변경
```

---

## 🔊 사운드 파일 추가 방법

`sounds/` 폴더에 mp3 파일을 넣으면 자동으로 연결됩니다.
파일명은 `game.js` 상단의 `SOUND_FILES` 객체를 참고하세요.

---

## 🚀 GitHub Pages 배포

1. GitHub 저장소에 업로드
2. Settings → Pages → Branch: main, folder: / (root)
3. 저장 후 링크 공유
