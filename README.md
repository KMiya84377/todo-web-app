# TODOウェブアプリケーション

サーバーレスアーキテクチャを使用したTODO管理アプリケーションです。

## 概要
このアプリケーションは、ユーザーがTODOタスクを作成、管理、追跡するためのウェブベースのシステムです。

## 技術スタック

### AWSサービス
- Amazon Cognito - ユーザー認証
- Amazon API Gateway - RESTful API のエンドポイント
- AWS Lambda - サーバーレスバックエンド処理
- Amazon DynamoDB - NoSQL データベース
- AWS CloudFront - コンテンツ配信
- Amazon S3 - 静的ファイルのホスティング
- AWS CDK - インフラのコード化

### フロントエンド
- React 18
- TypeScript 5.x
- Material-UI (MUI) v5
- React Router v6
- Axios
- Redux Toolkit / React Query

### バックエンド
- Node.js 20.x
- TypeScript 5.x
- AWS SDK v3
- Jest (テスト)

## アーキテクチャ図

```
User -> CloudFront -> S3 (フロントエンド)
User -> API Gateway -> Cognito/Lambda -> DynamoDB (バックエンド)
```

## プロジェクト構造
```
/
├── frontend/                 # フロントエンドReactアプリケーション
│   ├── public/               # 公開アセット
│   └── src/                  # ソースコード
│       ├── components/       # UIコンポーネント
│       ├── pages/            # ページコンポーネント
│       ├── hooks/            # カスタムフック
│       ├── services/         # APIサービス
│       ├── store/            # 状態管理
│       ├── types/            # TypeScript型定義
│       └── utils/            # ユーティリティ関数
│
├── backend/                  # バックエンドサーバーレス関数
│   ├── src/                  # ソースコード
│   │   ├── auth/             # 認証関連関数
│   │   └── todos/            # TODO管理関連関数
│   └── tests/                # テストファイル
│
└── infrastructure/           # AWS CDKコード
    └── lib/                  # インフラストラクチャスタック
```
- AWS Lambda
- Amazon DynamoDB

## 主な機能
- ユーザー認証（サインアップ、ログイン、ログアウト）
- TODOの閲覧・追加・編集・削除
- TODOステータス管理

## 開発方法
GitHubのIssue駆動開発に基づいて進めます。