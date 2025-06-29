# learn-passkey

このプロジェクトは、Next.jsとWebAuthn（パスキー認証）を活用した認証デモアプリです。

## 主な技術・特徴
- Next.js App Router構成
- WebAuthn（パスキー）による認証機能
- PrismaによるDBアクセス
- Cloudflare Workers対応（wrangler.toml設定済み）

## ディレクトリ構成（/src）

```
/src
├── app/                # ルーティング・ページ・APIエンドポイント
│   ├── (main)/         # メインページ関連
│   ├── api/            # APIエンドポイント
│   │   └── authn/      # 認証系API（me, logout, passkey...）
│   │       └── passkey/
│   │           ├── authentication/   # 認証フローAPI
│   │           └── registration/     # 登録フローAPI
│   └── ...
├── components/         # UIコンポーネント
├── contexts/           # React Context（例: AuthContext）
├── generated/          # 自動生成ファイル（Prisma, Zodスキーマ等）
├── lib/                # ライブラリ・ユーティリティ
│   └── webauthn/       # WebAuthn関連ロジック
├── middleware.ts       # Next.jsミドルウェア
├── theme.ts            # テーマ設定
```

## 開発・起動方法

```bash
yarn install
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて動作確認できます。

## 補足
- `/src/generated`配下はPrismaやZod等による自動生成ファイルです。通常は手動編集不要です。
- 認証APIは `/src/app/api/authn/passkey/` 以下に細かく分割されています。
- Cloudflare Workersでのデプロイもサポートしています。
