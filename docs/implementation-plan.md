# Implementation Plan: 卓球試合記録・分析アプリ

## Overview

`docs/spec.md` を実装の正本とし、試合中UIは `design/Match Scoring.dc.html` を再現する。React + TypeScript + Vite のスマートフォン向けPWAとして、ポイント列を唯一の根拠にスコア・ゲーム・集計を再計算し、IndexedDBへ端末内保存する。試合開始・結果・過去一覧は未デザインのため、Classical トークンを継承して組む。

## Architecture Decisions

- **ドメイン先行:** 分類定義、ゲーム終了、3ゲーム先取、Undo再計算は `src/domain/match` の純粋関数に閉じる。Reactは導出した表示モデルを描画するだけにする。
- **デザインの正本:** 試合中画面は `design/Match Scoring.dc.html` の構造・文言・階層を移植する。iOSベゼルはプレビュー専用で実装しない。トークンは `design/_ds/.../styles.css` を `src/styles` へ取り込み、実行時に `design/` を参照しない。
- **試合終了の導線:** 試作は「新しい試合を始める」だが、仕様どおりオーバーレイ主ボタンは「試合結果を見る」にする。見た目は試作のダイアログを維持する。
- **未デザイン画面:** 試合開始、結果、過去一覧は outlined button、hairline、dialog、field を再利用する。新しいアクセント色やサンセリフ強調は入れない。
- **永続化:** リポジトリ境界の奥に IndexedDB（`idb`）を置く。1ポイント確定／Undoごとに進行中試合を保存し、再読み込みで復元する。
- **フォント:** PWAオフラインのため、Cormorant Garamond と Lora は自己ホストする。
- **連打防止:** 試作どおり確定後250ms以内の追加確定は無視する。

## Dependency Graph

```text
プロジェクト土台（Vite, TS, テスト, トークン）
    │
    └── domain/match（型・分類・ルール・導出）
            │
            ├── scoring UI（試合中画面 → シート → Undo → 確認 → 終了）
            │       │
            │       └── storage（IndexedDB + 復元）
            │               │
            │               ├── match-setup（開始・再開確認）
            │               └── match-summary（集計・結果）
            │                       │
            │                       └── match-history（過去一覧）
            │                               │
            │                               └── PWA / E2E
```

実装順は下から上へ。各スライスは動く画面または検証可能なドメイン関数で終わる。

## Task List

### Phase 1: Foundation

## Task 1: プロジェクト土台を作る

**Description:** Vite + React + TypeScript のアプリ骨格と、仕様どおりの npm scripts、ESLint、Prettier、Vitest、Playwright を用意する。

**Acceptance criteria:**
- [x] `npm run dev` / `lint` / `typecheck` / `test` / `build` が成功する
- [x] `src/` 配下のディレクトリが仕様の Project Structure に沿っている
- [x] TypeScript は strict モードである

**Verification:**
- [x] `npm install && npm run lint && npm run typecheck && npm run test && npm run build`

**Dependencies:** None

**Files likely touched:**
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `src/app/main.tsx`
- `index.html`

**Estimated scope:** Medium

## Task 2: Classical トークンと自己ホストフォントを入れる

**Description:** デザインシステムの色・字体・余白・角丸・影をアプリへ取り込み、見出し／本文フォントをオフラインでも使えるようにする。

**Acceptance criteria:**
- [x] `--color-*`、`--font-*`、`--space-*`、`--radius-*`、`--shadow-*` がアプリから参照できる
- [x] ネットワーク遮断後もフォントがフォールバックせず表示される
- [x] ボタンは塗りつぶしではなく枠線を既定とする

**Verification:**
- [x] `npm run build`
- [x] Manual check: 開発画面で背景 `#f3f2f2`、アクセント枠、見出し書体を確認する

**Dependencies:** Task 1

**Files likely touched:**
- `src/styles/tokens.css`
- `src/styles/base.css`
- `src/app/main.tsx`
- `package.json`

**Estimated scope:** Small

## Task 3: 分類カタログとドメイン型を定義する

**Description:** 得点／失点の大分類・詳細、確定タップ数、Match / Point 型をコードの正本にする。

**Acceptance criteria:**
- [x] 仕様 3.3 / 3.4 の全分類が定義されている
- [x] 詳細なしは2タップ、それ以外は3タップと判定できる
- [x] 画面へ分類文字列を直書きしない

**Verification:**
- [x] `npx vitest run src/domain/match`

**Dependencies:** Task 1

**Files likely touched:**
- `src/domain/match/types.ts`
- `src/domain/match/categories.ts`
- `src/domain/match/categories.test.ts`

**Estimated scope:** Small

## Task 4: ゲーム／試合終了ルールを実装する

**Description:** 11点・2点差、デュース継続、3ゲーム先取を純粋関数で判定する。

**Acceptance criteria:**
- [x] 11-0、11-9 でゲーム終了、10-10 / 11-10 は継続、12-10 / 15-13 で終了する
- [x] ゲーム取得数が3になった側で試合終了する
- [x] 双方10点以上をデュース状態と判定できる

**Verification:**
- [x] `npx vitest run src/domain/match/rules.test.ts`

**Dependencies:** Task 3

**Files likely touched:**
- `src/domain/match/rules.ts`
- `src/domain/match/rules.test.ts`

**Estimated scope:** Small

## Task 5: ポイント列から試合状態を導出する

**Description:** 保存済みポイントだけを入力に、現在ゲーム、スコア、ゲーム取得、直近3件、全履歴、終了状態を組み立てる。Undoは末尾削除後に再導出する。

**Acceptance criteria:**
- [x] `scoreAfter` がなくてもポイント列から現在スコアを再計算できる
- [x] ゲームをまたいでもゲーム番号と取得数が正しい
- [x] 末尾削除を繰り返すとゲーム終了・試合終了が巻き戻る
- [x] 直近表示は現在ゲームの新しい順最大3件である

**Verification:**
- [x] `npx vitest run src/domain/match/derive.test.ts`

**Dependencies:** Task 4

**Files likely touched:**
- `src/domain/match/derive.ts`
- `src/domain/match/derive.test.ts`
- `src/domain/match/index.ts`

**Estimated scope:** Medium

### Checkpoint: Foundation

- [x] `npm run test && npm run typecheck && npm run build` が成功する
- [x] ドメインにUIやIndexedDB依存がない
- [ ] レビュー後に Phase 2 へ進む

### Phase 2: Core Scoring UI

## Task 6: 試合中画面の骨格をデザインどおり組む

**Description:** ヘッダ、スコアボード、デュース表示、直近ポイント、得点／失点、1点戻す／試合の確認を、デザイン案の階層と寸法で静的に組む。

**Acceptance criteria:**
- [x] 360px幅で横スクロールしない
- [x] 得点は実線＋「＋」、失点は破線＋「−」で区別できる
- [x] 主要タップ領域が最小44×44 CSS px である
- [x] iOSフレームは描画しない

**Verification:**
- [ ] `npx vitest run src/features/scoring`
- [ ] Manual check: 360px幅で `design/Match Scoring.dc.html` と見比べる

**Dependencies:** Task 2, Task 5

**Files likely touched:**
- `src/features/scoring/ScoringScreen.tsx`
- `src/features/scoring/ScoringScreen.module.css`
- `src/features/scoring/ScoringScreen.test.tsx`
- `src/app/App.tsx`

**Estimated scope:** Medium

## Task 7: 分類シートで1点を確定する

**Description:** 得点／失点から下部シートを開き、2タップまたは3タップでポイントを確定し、確定後はシートを閉じて入力待ちへ戻す。

**Acceptance criteria:**
- [ ] ラリー系は第2タップで確定し、他は第3タップで確定する
- [ ] シートに「2 / 大分類を選ぶ」「3 / 詳細を選ぶ」と選択経路が出る
- [ ] 「戻る」で1階層戻り、背景タップで未確定を破棄する
- [ ] 確定後250ms以内の追加確定は無視する

**Verification:**
- [ ] `npx vitest run src/features/scoring`

**Dependencies:** Task 3, Task 6

**Files likely touched:**
- `src/features/scoring/CategorySheet.tsx`
- `src/features/scoring/useScoringInput.ts`
- `src/features/scoring/CategorySheet.test.tsx`
- `src/features/scoring/ScoringScreen.tsx`

**Estimated scope:** Medium

## Task 8: 確定後にスコアと直近履歴を更新する

**Description:** 確定したポイントを導出関数へ渡し、ゲーム番号、スコア、ゲーム取得数、直近3件を即座に描画する。

**Acceptance criteria:**
- [ ] 得点で記録対象、失点で対戦相手のスコアが1増える
- [ ] 直近3件が新しい順で、`G1 1-0　＋　得点 → サーブ → エース` 形式になる
- [ ] 未記録時は「まだ記録がありません。」を出す
- [ ] 双方10点以上で「2点差まで継続」が出る

**Verification:**
- [ ] `npx vitest run src/features/scoring`

**Dependencies:** Task 5, Task 7

**Files likely touched:**
- `src/features/scoring/ScoringScreen.tsx`
- `src/features/scoring/PointLine.tsx`
- `src/features/scoring/ScoringScreen.test.tsx`

**Estimated scope:** Small

## Task 9: 連続Undoを試合中画面へつなぐ

**Description:** 「1点戻す」で直前ポイントを消し、導出結果を再描画する。ポイントが無いときは無効化する。

**Acceptance criteria:**
- [ ] 連続タップで複数点を1点ずつ取り消せる
- [ ] UndoのRedoは存在しない
- [ ] ポイント0件ではボタンが無効である

**Verification:**
- [ ] `npx vitest run src/features/scoring`

**Dependencies:** Task 8

**Files likely touched:**
- `src/features/scoring/useScoringInput.ts`
- `src/features/scoring/ScoringScreen.test.tsx`

**Estimated scope:** Small

## Task 10: 試合の確認オーバーレイを実装する

**Description:** デザイン案どおり全画面の読み取り専用履歴を出し、新しい順で全ポイントを見せて試合画面へ戻れるようにする。

**Acceptance criteria:**
- [ ] ヘッダに現在ゲームとスコアが出る
- [ ] 全ポイントが新しい順・読み取り専用である
- [ ] 閉じても未確定の分類選択が残る（シートを開いて確認を開いた場合はシートのみ閉じる）
- [ ] 空状態文言がデザイン案と一致する

**Verification:**
- [ ] `npx vitest run src/features/scoring`

**Dependencies:** Task 8

**Files likely touched:**
- `src/features/scoring/MatchReview.tsx`
- `src/features/scoring/MatchReview.test.tsx`
- `src/features/scoring/ScoringScreen.tsx`

**Estimated scope:** Small

## Task 11: ゲーム終了オーバーレイと次ゲーム移行を実装する

**Description:** ゲーム完了時に入力を止め、最終スコアと取得者を出し、「次のゲームへ」で0-0の次ゲームを開始する。オーバーレイ上でもUndoできる。

**Acceptance criteria:**
- [x] 11点・デュースの終了条件でオーバーレイが出る
- [x] 試合勝者が未確定なら「次のゲームへ」で次ゲーム0-0になる
- [x] オーバーレイの「1点戻す」でゲーム終了が取り消される
- [x] 次ゲーム開始後もUndoを続けると前ゲームへ戻れる

**Verification:**
- [x] `npx vitest run src/features/scoring`

**Dependencies:** Task 9

**Files likely touched:**
- `src/features/scoring/GameEndOverlay.tsx`
- `src/features/scoring/GameEndOverlay.test.tsx`
- `src/features/scoring/ScoringScreen.tsx`

**Estimated scope:** Medium

## Task 12: 試合終了オーバーレイから結果へ進む

**Description:** 3ゲーム先取で試合終了オーバーレイを出し、主ボタンで結果画面へ遷移する。結果画面はこの時点ではプレースホルダでよい。

**Acceptance criteria:**
- [x] 3ゲーム先取で「試合終了」オーバーレイになる
- [x] 主ボタンは「試合結果を見る」である
- [x] 結果へ進む前ならUndoで試合を再開できる
- [x] 試作の「新しい試合を始める」は出ない

**Verification:**
- [x] `npx vitest run src/features/scoring`
- [x] Manual check: 3ゲーム先取後の文言と遷移先を確認する

**Dependencies:** Task 11

**Files likely touched:**
- `src/features/scoring/GameEndOverlay.tsx`
- `src/app/App.tsx`
- `src/features/match-summary/MatchSummaryScreen.tsx`

**Estimated scope:** Small

### Checkpoint: Core Scoring

- [x] メモリ上で試合開始相当の固定選手名から、記録・Undo・確認・ゲーム跨ぎ・試合終了まで通る
- [x] 試合中UIがデザイン案と目視で一致する
- [x] `npm run test && npm run build` が成功する
- [ ] レビュー後に Phase 3 へ進む

### Phase 3: Persistence and Setup

## Task 13: IndexedDBリポジトリを用意する

**Description:** 試合の保存・取得・一覧用リポジトリとスキーマバージョンを実装する。UIからはリポジトリ経由のみとする。

**Acceptance criteria:**
- [x] Match を ID で保存・取得できる
- [x] スキーマにバージョン番号がある
- [x] 読み出しデータを検証し、不正データは受け入れない

**Verification:**
- [x] `npx vitest run src/storage`

**Dependencies:** Task 5

**Files likely touched:**
- `src/storage/db.ts`
- `src/storage/matchRepository.ts`
- `src/storage/matchRepository.test.ts`

**Estimated scope:** Medium

## Task 14: 記録のたびに保存し、再読み込みで復元する

**Description:** ポイント確定とUndoのたびに進行中試合を保存し、起動時に復元する。保存失敗時は成功扱いしない。

**Acceptance criteria:**
- [ ] 確定／Undo後に IndexedDB 上のポイント列が画面と一致する
- [ ] 再読み込み後に進行中試合を続けられる
- [ ] 保存失敗時に再試行可能な通知が出る

**Verification:**
- [ ] `npx vitest run tests/integration`
- [ ] Manual check: 数点記録 → 再読み込み → 同じスコアで再開

**Dependencies:** Task 12, Task 13

**Files likely touched:**
- `src/features/scoring/useMatchPersistence.ts`
- `src/features/scoring/ScoringScreen.tsx`
- `tests/integration/matchPersistence.test.ts`

**Estimated scope:** Medium

## Task 15: 試合開始画面を実装する

**Description:** 記録対象選手名と対戦相手名を必須入力し、空白除去後に第1ゲーム0-0で開始する。試合日時は端末時刻から記録する。

**Acceptance criteria:**
- [ ] 空文字では開始できない
- [ ] 開始後に試合中画面へ入り、名前がスコアボードに出る
- [ ] Classical の field / outlined button を使う

**Verification:**
- [ ] `npx vitest run src/features/match-setup`

**Dependencies:** Task 2, Task 14

**Files likely touched:**
- `src/features/match-setup/MatchSetupScreen.tsx`
- `src/features/match-setup/MatchSetupScreen.test.tsx`
- `src/app/App.tsx`

**Estimated scope:** Medium

## Task 16: 進行中試合の再開と新規開始確認を実装する

**Description:** 進行中試合があるときホームで再開できるようにし、新規開始前に確認ダイアログを出す。

**Acceptance criteria:**
- [ ] 進行中試合は完了一覧と区別して保持する
- [ ] 新規開始前に確認し、承認時のみ新しい試合になる
- [ ] 拒否時は既存の進行中試合を維持する

**Verification:**
- [ ] `npx vitest run src/features/match-setup`
- [ ] Manual check: 進行中を残したまま新規開始をキャンセルできる

**Dependencies:** Task 15

**Files likely touched:**
- `src/features/match-setup/MatchSetupScreen.tsx`
- `src/features/match-setup/ResumeMatchBanner.tsx`
- `src/storage/matchRepository.ts`

**Estimated scope:** Medium

### Checkpoint: Persistence

- [ ] 名前入力 → 記録 → 再読み込み復元 → Undo → ゲーム終了が永続化される
- [ ] 保存失敗を成功として扱わない
- [ ] レビュー後に Phase 4 へ進む

### Phase 4: Summary and History

## Task 17: ゲーム別・全体集計を導出する

**Description:** ポイント列からゲーム別の大分類件数と、試合全体の件数・構成比を計算する。0件は0、分母0は0%とする。

**Acceptance criteria:**
- [ ] 得点5分類・失点5分類がゲームごと・試合全体で出る
- [ ] 0件分類も0で残る
- [ ] ポイント0件の構成比は0%である

**Verification:**
- [ ] `npx vitest run src/domain/match/stats.test.ts`

**Dependencies:** Task 5

**Files likely touched:**
- `src/domain/match/stats.ts`
- `src/domain/match/stats.test.ts`

**Estimated scope:** Small

## Task 18: 試合結果画面を実装する

**Description:** 勝敗、名前、日時、ゲーム取得数、各ゲームスコア、ゲーム別集計、全体集計、時系列ポイント履歴を表示する。自動分析文言は置かない。

**Acceptance criteria:**
- [ ] 仕様 3.9 の4ブロックがすべて出る
- [ ] 表示値がポイント列と一致する
- [ ] 「弱点」「練習」「敗因」などの分析文言がない
- [ ] トークンと outlined UI を試合中画面と共有する

**Verification:**
- [ ] `npx vitest run src/features/match-summary`
- [ ] Manual check: 短い試合を1本記録し、結果の件数を手計算と照合する

**Dependencies:** Task 12, Task 17

**Files likely touched:**
- `src/features/match-summary/MatchSummaryScreen.tsx`
- `src/features/match-summary/MatchSummaryScreen.test.tsx`
- `src/features/match-summary/MatchSummaryScreen.module.css`

**Estimated scope:** Medium

## Task 19: 過去試合一覧と詳細再表示を実装する

**Description:** 完了試合を新しい順で一覧し、選択すると結果画面と同じ詳細を再表示する。

**Acceptance criteria:**
- [ ] 一覧に日時、選手名、相手名、勝敗、ゲーム取得数が出る
- [ ] 初期順は日時の新しい順である
- [ ] 詳細は試合終了直後と同じ内容である
- [ ] 進行中試合は完了一覧に混ぜない

**Verification:**
- [ ] `npx vitest run src/features/match-history`
- [ ] Manual check: 完了試合を開き、一覧へ戻れる

**Dependencies:** Task 16, Task 18

**Files likely touched:**
- `src/features/match-history/MatchHistoryScreen.tsx`
- `src/features/match-history/MatchHistoryScreen.test.tsx`
- `src/app/App.tsx`

**Estimated scope:** Medium

### Checkpoint: Summary and History

- [ ] 完了試合が保存され、一覧と詳細で再閲覧できる
- [ ] 集計が記録と一致する
- [ ] レビュー後に Phase 5 へ進む

### Phase 5: Polish

## Task 20: 空状態・エラー・データ消去の注意を整える

**Description:** 履歴空状態、保存エラー、ブラウザデータ削除で復元できない旨を、試合開始または一覧に明示する。

**Acceptance criteria:**
- [ ] 保存エラーが再試行可能な通知として残る
- [ ] データ消去で復元できないことが利用者に伝わる
- [ ] 空の過去一覧が壊れない

**Verification:**
- [ ] `npx vitest run src/features/match-history src/features/match-setup`

**Dependencies:** Task 19

**Files likely touched:**
- `src/components/Banner.tsx`
- `src/features/match-history/MatchHistoryScreen.tsx`
- `src/features/match-setup/MatchSetupScreen.tsx`

**Estimated scope:** Small

## Task 21: PWA化してオフライン利用できるようにする

**Description:** `vite-plugin-pwa` でインストール可能にし、初回読み込み後はオフラインで開始・記録・保存・閲覧できるようにする。更新時に保存済み試合を消さない。

**Acceptance criteria:**
- [ ] ホーム画面追加用のマニフェストがある
- [ ] 初回読み込み後、オフラインで主要機能が動く
- [ ] 再デプロイ想定の更新後も IndexedDB のデータが残る

**Verification:**
- [ ] `npm run build`
- [ ] Manual check: ビルドプレビューをオフラインにし、記録と履歴閲覧ができる

**Dependencies:** Task 2, Task 19

**Files likely touched:**
- `vite.config.ts`
- `public/manifest.webmanifest`
- `index.html`

**Estimated scope:** Medium

## Task 22: 主要経路のE2Eを追加する

**Description:** Playwright のモバイルビューポートで、試合開始から結果保存、デュース、ゲーム跨ぎUndo、オフライン閲覧を自動確認する。

**Acceptance criteria:**
- [ ] 試合開始 → 3ゲーム先取 → 結果保存が通る
- [ ] 10-10からデュース終了が通る
- [ ] ゲーム終了をまたぐ連続Undoが通る
- [ ] オフラインで記録と履歴閲覧ができる

**Verification:**
- [ ] `npm run test:e2e`
- [ ] `npm run lint && npm run typecheck && npm run test && npm run build`

**Dependencies:** Task 21

**Files likely touched:**
- `e2e/match-flow.spec.ts`
- `e2e/deuce-undo.spec.ts`
- `e2e/offline.spec.ts`
- `playwright.config.ts`

**Estimated scope:** Medium

### Checkpoint: Complete

- [ ] 仕様 12. Success Criteria をすべて満たす
- [ ] 試合中UIが `design/Match Scoring.dc.html` を基準に再現されている
- [ ] `lint` / `typecheck` / `test` / `build` / 主要E2Eが成功する
- [ ] 自動分析・練習提案がコード上に存在しない
- [ ] レビュー後に完了とする

## Parallelization

| 並行してよい | 直列が必要 |
|---|---|
| Task 3（分類）と Task 2（トークン）は Task 1 の後なら並行可 | Task 4 → 5 → 6 以降の scoring は導出に依存 |
| Task 10（確認）と Task 9（Undo）は Task 8 の後なら並行可 | Task 13 のスキーマは Task 14 より先 |
| Task 17（集計）は scoring UI と並行可 | Task 18 は Task 12 と Task 17 の後 |
| Task 20 は Task 19 の後なら単独で可 | Task 22 は PWA を含む主要機能の後 |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 試作の試合終了CTAが仕様と違う | High | 見た目は試作、文言と遷移は「試合結果を見る」に固定する |
| 大きなスコア数字と長い選手名が360pxで溢れる | Med | Task 6で360px検証。名前は折り返し、数字は tabular nums を維持する |
| Google Fonts 依存だとオフラインで崩れる | High | 自己ホストし、Task 21でオフライン確認する |
| ゲーム終了ackとポイント列の二重管理 | High | 表示用ackはUI状態、勝敗・スコアは常にポイント列から再計算する |
| 未デザイン画面が試合中と見た目で分断する | Med | 同じトークンと outlined 部品だけを使い、新規パレットを禁止する |
| IndexedDBのブラウザ差 | Med | リポジトリで検証し、失敗を画面通知する。E2EはChromiumモバイルで固定する |

## Open Questions

実装開始を止めない前提で、次は計画上こう決める。変更するなら実装前に指摘してください。

- 試合終了オーバーレイの主ボタンは「試合結果を見る」（仕様優先）
- 履歴の並びは新しい順（デザイン案どおり）
- 試合中の直近3件表示は初版に含める（デザイン案どおり）
- 試合開始・結果・過去一覧の個別デザインは後追い。まずは Classical で実装する
