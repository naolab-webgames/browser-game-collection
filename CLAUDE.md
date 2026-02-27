# Claude Code Development Rules

このファイルは、Claude Codeがこのプロジェクトで開発を行う際に従うべきルールを定義します。

---

## プロジェクト概要

- **プロジェクト名**: Naolab's Free Browser Games Collection
- **デプロイ先**: GitHub Pages
- **メインURL**: https://naolab-webgames.github.io/browser-game-collection/
- **ルートURL**: https://naolab-webgames.github.io/ (3秒後にメインURLへリダイレクト)
- **運営者**: Naoto Lab
- **AdSense ID**: ca-pub-4826094295702322
- **お問い合わせ**: Formspree (https://formspree.io/f/xzdaywee)

---

## 開発フロー

### 新機能開発・改修時のルール（必須）

#### 1. 要件定義（インタビュー形式）

新機能の開発や既存機能の改修が発生した場合、**必ずインタビュー形式で要件定義を行う**こと。

**実施内容:**
- ユーザーの要望を明確化するための質問を行う
- 実装の選択肢を提示し、ユーザーの選択を確認
- 不明点や曖昧な部分は実装前に確認

**質問例:**
- 「この機能の目的は何ですか？」
- 「どのような動作を期待していますか？」
- 「実装方法として以下の選択肢があります。どちらを選びますか？」
  - オプション1: [方法A]
  - オプション2: [方法B]

**ツール:** `AskUserQuestion` ツールを使用して質問

#### 2. ローカルテストとデプロイ承認（必須）

**ルール:** ボディ部（`<body>`タグ内）の編集を行った後は、以下の手順を遵守すること。

**手順:**
1. **ローカル環境でテスト**
   - ブラウザでHTMLファイルを開き、動作確認
   - コンソールエラーがないか確認
   - 意図した通りの表示・動作か確認

2. **ユーザーに承認を求める**
   - テスト結果を報告
   - デプロイ許可を得る
   - **承認なしに本番環境（GitHub）へデプロイを行わない**

3. **承認後にデプロイ**
   - ユーザーの承認を得てからgit push実行

**例外:**
- `<head>` タグ内のみの変更（メタタグ追加等）は直接デプロイ可
- CSSファイル、JSファイルのみの変更も直接デプロイ可（ただし動作に影響がある場合は要確認）

---

## ファイル構造とパス規則

### GitHub Pages対応の絶対パス（必須）

すべてのパスは **`/browser-game-collection/` プレフィックス付き**で記述すること。

**正しい例:**
```html
<link rel="stylesheet" href="/browser-game-collection/src/css/common.css">
<script type="module">
  import Controller from '/browser-game-collection/src/js/controllers/Controller.js';
</script>
```

**誤った例（相対パス）:**
```html
<link rel="stylesheet" href="../src/css/common.css"> ❌
```

### ディレクトリ構造

```
browser-game-collection/
├── games/               # ゲームページHTML
├── src/
│   ├── js/
│   │   ├── controllers/ # ゲームコントローラー
│   │   ├── core/        # コアサービス（Storage, GameData, Config）
│   │   ├── ui/          # UI コンポーネント（Modal等）
│   │   └── utils/       # ユーティリティ関数
│   ├── css/
│   │   └── games/       # ゲーム別CSS
│   └── assets/
│       ├── data/        # JSON設定ファイル
│       └── images/
│           └── thumbnails/ # ゲームサムネイル（SVG推奨）
├── docs/                # ドキュメント
├── index.html           # トップページ
├── CLAUDE.md            # 開発ルール（このファイル）
└── README.md            # プロジェクト説明
```

---

## コーディング規約

### JavaScript

- **ES6モジュール必須**: `<script type="module">` を使用
- **クラスベース設計**: ゲームコントローラーはGameControllerを継承
- **命名規則**:
  - クラス: PascalCase (`MemoryGameController`)
  - 関数/変数: camelCase (`handleCardClick`)
  - 定数: UPPER_SNAKE_CASE (`MAX_CARDS`)
  - ファイル名: PascalCase.js またはkebab-case.js

### CSS

- **BEM記法推奨**: `.game-card__title`, `.game-card--active`
- **共通スタイル**: `common.css` を最初に読み込む
- **ゲーム別CSS**: `src/css/games/` に配置

### HTML

- **セマンティックHTML**: `<article>`, `<section>`, `<nav>` 等を適切に使用
- **アクセシビリティ**: `alt` 属性、`aria-label` を適切に設定

---

## SEO Implementation（必須）

### ルール: すべての新規HTMLページにSEO対策を実装する

新しいHTMLページを作成する際は、以下のSEO対策を**必ず実装**すること。

#### 1. メタタグ（必須）

```html
<meta name="description" content="[ページの説明: 150-160文字、英語]">
<meta name="keywords" content="[関連キーワード, カンマ区切り]">
```

#### 2. OGPタグ（必須）- SNS共有用

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="[ページの完全URL]">
<meta property="og:title" content="[ページタイトル]">
<meta property="og:description" content="[ページの説明]">
<meta property="og:image" content="[画像の完全URL]">
<meta property="og:site_name" content="Naolab Browser Games">
```

#### 3. Twitter Cardタグ（必須）

```html
<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="[ページの完全URL]">
<meta name="twitter:title" content="[ページタイトル]">
<meta name="twitter:description" content="[ページの説明]">
<meta name="twitter:image" content="[画像の完全URL]">
```

#### 4. 構造化データ（Schema.org）必須

**トップページ・一般ページ:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "サイト名",
  "url": "サイトURL",
  "description": "サイトの説明",
  "publisher": {
    "@type": "Organization",
    "name": "Naoto Lab",
    "url": "組織のURL"
  }
}
</script>
```

**ゲームページ:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "ゲーム名",
  "description": "ゲームの説明",
  "url": "ゲームページURL",
  "image": "サムネイル画像URL",
  "gamePlatform": "Web Browser",
  "genre": "ジャンル（Puzzle/Strategy/Action等）",
  "playMode": "SinglePlayer",
  "publisher": {
    "@type": "Organization",
    "name": "Naoto Lab"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
</script>
```

#### 実装チェックリスト

新しいHTMLページを作成後、以下を確認：

- [ ] `<meta name="description">` 実装（150-160文字、英語）
- [ ] `<meta name="keywords">` 実装
- [ ] OGPタグ5つ実装（og:type, og:url, og:title, og:description, og:image）
- [ ] Twitter Cardタグ5つ実装
- [ ] Schema.org構造化データ実装（ページタイプに応じて）
- [ ] すべてのURLは絶対パスで指定

#### 参考実装

既存ファイルを参照：
- トップページ: `index.html`, `index-module.html`
- ゲームページ: `games/memory-game-module.html`, `games/tic-tac-toe-module.html`, `games/whack-a-mole-module.html`

---

## Google AdSense規則

### AdSenseコード配置（必須）

すべてのHTMLページの `<head>` 内に以下を配置：

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4826094295702322"
     crossorigin="anonymous"></script>
```

**配置位置**: `<title>` タグの直後、構造化データの前

### 広告枠の扱い

**承認前（現在）**: 広告枠はコメントアウト
```html
<!-- Advertisement Banner: AdSense広告は承認後にここに追加 -->
<!--
<div class="ad-container">
  AdSense広告コードをここに配置
</div>
-->
```

**承認後**: コメントを解除し、広告ユニットコードを配置
- AdSenseダッシュボードから「ディスプレイ広告」を作成
- 生成されたコードを `<div class="ad-container">` 内に貼り付け

---

## Git規則

### コミットメッセージ

- **形式**: `<動詞> <対象>の<説明>`
- **動詞**: Add, Update, Fix, Remove, Refactor等
- **例**:
  - `Add comprehensive SEO improvements to all pages`
  - `Fix card flip animation in Memory Game`
  - `Update meta descriptions for game pages`

### Co-Authored-By（必須）

すべてのコミットに以下を追加：
```
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**コミット例:**
```bash
git commit -m "$(cat <<'EOF'
Add new game feature.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## デプロイ構成

### 2つのリポジトリ管理

#### 1. browser-game-collection (メインサイト)

- **URL**: https://naolab-webgames.github.io/browser-game-collection/
- **リポジトリ**: naolab-webgames/browser-game-collection
- **ローカルパス**: `C:\Users\user\Downloads\browser-game-collection`
- **内容**: ゲーム本体、全HTML、JS、CSS、アセット

#### 2. naolab-webgames.github.io (ルートドメイン)

- **URL**: https://naolab-webgames.github.io/
- **リポジトリ**: naolab-webgames/naolab-webgames.github.io
- **ローカルパス**: `C:\Users\user\Downloads\naolab-webgames.github.io`
- **内容**: リダイレクトページ（index.html のみ）
- **機能**: 3秒後にメインサイトへ自動リダイレクト

### デプロイ手順

```bash
# メインサイト更新
cd /c/Users/user/Downloads/browser-game-collection
git add .
git commit -m "更新内容"
git push

# ルートドメイン更新（必要時のみ）
cd /c/Users/user/Downloads/naolab-webgames.github.io
git add .
git commit -m "更新内容"
git push
```

### GitHub Pages反映時間

- 通常5-10分でサイトに反映される
- キャッシュクリアが必要な場合: Ctrl+Shift+R（ハードリフレッシュ）

### デプロイ前の確認事項

1. ローカルでHTMLファイルを開いて動作確認
2. ブラウザのコンソールでエラーがないか確認
3. 意図した通りの表示・動作か確認
4. **ユーザーからデプロイ承認を得る（`<body>` 編集時）**

---

## ローカルテスト方法

### HTMLファイルの開き方

```bash
# 方法1: ブラウザで直接開く
# エクスプローラーからHTMLファイルをダブルクリック

# 方法2: コマンドラインから開く（Windows）
start C:\Users\user\Downloads\browser-game-collection\index.html

# 方法3: Live Serverを使用（推奨）
# VSCodeの拡張機能 "Live Server" を使用してローカルサーバーを起動
```

### テストチェックリスト

- [ ] ページが正しく表示される
- [ ] ブラウザのコンソール（F12）でエラーがない
- [ ] リンクが正しく動作する
- [ ] ゲームが正常に動作する（ゲームページの場合）
- [ ] レスポンシブデザインが機能している（画面サイズを変更して確認）

---

## パス管理（開発環境 vs 本番環境）

### パスの違い

GitHub Pagesの仕様により、**開発環境と本番環境でパスが異なる**：

| 環境 | ベースパス | 例 |
|------|----------|-----|
| **開発環境** | `/` | `http://localhost:8000/games/nine-module.html` |
| **本番環境** | `/browser-game-collection/` | `https://naolab-webgames.github.io/browser-game-collection/games/nine-module.html` |

### ローカルサーバーの起動方法

**重要**: `browser-game-collection` ディレクトリをルートとして起動

```bash
cd /c/Users/user/Downloads/browser-game-collection
python -m http.server 8000
```

**アクセスURL**: `http://localhost:8000/games/nine-module.html`

### HTML内のパス記述ルール

#### ローカルテスト時（開発環境）

```html
<!-- CSS -->
<link rel="stylesheet" href="/src/css/common.css">
<link rel="stylesheet" href="/src/css/games/game-name.css">

<!-- JavaScript -->
<script type="module">
  import Controller from '/src/js/controllers/GameController.js';
</script>

<!-- リンク -->
<a href="/index-module.html">Home</a>
```

#### デプロイ時（本番環境）

```html
<!-- CSS -->
<link rel="stylesheet" href="/browser-game-collection/src/css/common.css">
<link rel="stylesheet" href="/browser-game-collection/src/css/games/game-name.css">

<!-- JavaScript -->
<script type="module">
  import Controller from '/browser-game-collection/src/js/controllers/GameController.js';
</script>

<!-- リンク -->
<a href="/browser-game-collection/index-module.html">Home</a>
```

### デプロイ前の必須作業

**ボディ部を編集したHTMLファイル**に対して、以下の置換を実行：

1. **CSS/JSパス**: `/src/` → `/browser-game-collection/src/`
2. **リンクパス**: `href="/` → `href="/browser-game-collection/`

**例**:
```bash
# ローカルテスト時
href="/index-module.html"
href="/src/css/common.css"

# デプロイ前に変更
href="/browser-game-collection/index-module.html"
href="/browser-game-collection/src/css/common.css"
```

### パス変更チェックリスト

デプロイ前に以下を確認：

- [ ] `<link rel="stylesheet" href="...">` のパスに `/browser-game-collection/` が含まれている
- [ ] `<script>` 内の `import` 文のパスに `/browser-game-collection/` が含まれている
- [ ] フッターリンクのパスに `/browser-game-collection/` が含まれている
- [ ] その他すべての内部リンクのパスに `/browser-game-collection/` が含まれている

### 注意事項

- **外部リンク**（`https://` で始まるURL）は変更不要
- **相対パス**（`../` や `./`）は使用禁止（GitHub Pagesで動作しない）
- **`<head>` 内の変更のみ**の場合、パスは既に正しいため変更不要（SEO、AdSenseコード等）

---

## 更新履歴

- **2026-02-27**: 初版作成 - SEO実装ルール追加
- **2026-02-27**: プロジェクト構造、コーディング規約、AdSense規則、Git規則、デプロイ構成を追加
- **2026-02-27**: 開発フロー追加（要件定義インタビュー、ローカルテスト・デプロイ承認ルール）
- **2026-02-27**: パス管理ルール追加（開発環境 vs 本番環境のパス違いとデプロイ前の変更手順）
