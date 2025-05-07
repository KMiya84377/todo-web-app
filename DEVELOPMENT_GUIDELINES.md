# 開発ルールと環境構築ガイドライン

## 目次
- [開発ルール](#開発ルール)
  - [インフラ](#インフラ)
  - [フロントエンド](#フロントエンド)
  - [バックエンド](#バックエンド)
- [CI/CD](#cicd)
- [環境構築手順](#環境構築手順)

## 開発ルール

本プロジェクトでは、下記の開発ルールに従って開発を進めます。

### インフラ

#### コーディングルール
- AWS CDKはTypeScriptで実装します
- 推奨される命名規則：
  - スタック名: `${プロジェクト名}Stack`
  - リソース名: `${機能名}${リソースタイプ}`（例: `TodoApiGateway`, `UserPoolCognito`）
- コメントは英語で記述し、複雑なロジックには必ずコメントを記載してください
- 環境変数は`.env`ファイルで管理し、GitHubリポジトリにコミットしないでください
- 本番環境の値が含まれる設定ファイルは`.gitignore`に追加してください

#### 静的解析
- ESLintを使用してコードを検証します
  - 設定: `eslint:recommended`と`@typescript-eslint/recommended`
- AWS CDK Lintを使用して、AWSベストプラクティスに準拠しているか検証します

#### 単体テスト
- Jestを使用してテストを実施します
- 各スタックのデプロイを確認するスナップショットテストを実装してください
- テストカバレッジは最低70%を目標とします

### フロントエンド

#### コーディングルール
- **ファイル構造**：
  ```
  src/
  ├── assets/         # 静的アセット（画像など）
  ├── components/     # 再利用可能なUIコンポーネント
  │   ├── common/     # アプリ全体で使用される共通コンポーネント
  │   ├── auth/       # 認証関連コンポーネント
  │   └── todos/      # TODO関連コンポーネント
  ├── contexts/       # Reactコンテキスト
  ├── hooks/          # カスタムフック
  ├── pages/          # ページコンポーネント
  ├── services/       # APIとの通信処理
  ├── types/          # 型定義
  └── utils/          # ユーティリティ関数
  ```

- **命名規則**：
  - コンポーネント: PascalCase（例: `TodoList.tsx`）
  - ファイル名: 機能を表す名前 + 役割（例: `todoService.ts`）
  - 変数・関数: camelCase
  - 定数: UPPER_SNAKE_CASE

- **コーディングスタイル**：
  - 関数コンポーネントとHooksを使用すること
  - propsには必ず型定義をすること
  - コンポーネントは可能な限り純粋関数にすること
  - スタイルはMaterial-UIのテーマシステムを使用すること

#### 静的解析
- ESLint + Prettierを使用
  - 設定: `eslint:recommended`, `@typescript-eslint/recommended`, `react-app`
- TypeScriptの`strict`モードを有効化
- `npm run lint`コマンドでリント実行可能にすること

#### 単体テスト
- Testing Libraryとjestを使用
- 主要コンポーネント、カスタムフック、ユーティリティのテストを作成
- テストカバレッジは最低70%を目標とする
- `npm run test`コマンドでテスト実行可能にすること

### バックエンド

#### コーディングルール
- **ファイル構造**：
  ```
  src/
  ├── functions/      # Lambda関数のエントリポイント
  │   ├── auth/       # 認証関連の関数
  │   └── todos/      # TODO操作関連の関数
  ├── lib/            # 共通ライブラリとユーティリティ
  ├── models/         # データモデル
  ├── repositories/   # データアクセスレイヤー
  ├── services/       # ビジネスロジック
  └── types/          # 型定義
  ```

- **命名規則**：
  - ファイル名: 機能を表す名前 + 役割（例: `todoRepository.ts`）
  - 関数名: camelCase、動詞で始める
  - インターフェース: PascalCaseで`I`プレフィックスなし
  - 型名: PascalCase

- **コーディングスタイル**：
  - 関数は単一責任の原則に従って設計すること
  - エラーハンドリングは詳細なメッセージと適切なHTTPステータスコードを含めること
  - 可能な限り非同期処理にはasync/awaitを使用すること
  - DynamoDBとのやり取りは専用リポジトリクラスに隔離すること

#### 静的解析
- ESLintを使用
  - 設定: `eslint:recommended`, `@typescript-eslint/recommended`
- TypeScriptの`strict`モードを有効化
- `npm run lint`コマンドでリント実行可能にすること

#### 単体テスト
- Jestを使用
- モック/スタブを活用してAWSサービスとの依存関係を分離
- 各Lambdaハンドラー、サービス、リポジトリのテストを作成
- テストカバレッジは最低80%を目標とする
- `npm run test`コマンドでテスト実行可能にすること

## CI/CD

### GitHub Actions ワークフロー

本プロジェクトでは以下のGitHub Actionsを設定します：

1. **Pull Requestワークフロー**
   - リント、テスト、ビルドを実行
   - CDKセキュリティチェック
   - キャッシュの最適化

2. **デプロイワークフロー**
   - mainブランチへのマージ時に実行
   - CDKデプロイ
   - 自動テスト

## 環境構築手順

### ローカル開発環境のセットアップ

1. **前提条件**
   - Node.js v20以降
   - AWS CLIのインストールと設定
   - AWS CDKのインストール
   - TypeScriptのインストール

2. **フロントエンド環境構築**
   ```bash
   # プロジェクトルートディレクトリで実行
   cd frontend
   npm install
   # 開発サーバーの起動
   npm run dev
   ```

3. **バックエンド環境構築**
   ```bash
   # プロジェクトルートディレクトリで実行
   cd backend
   npm install
   # ローカルでの関数テスト
   npm run dev
   ```

4. **インフラ環境構築**
   ```bash
   # プロジェクトルートディレクトリで実行
   cd infrastructure
   npm install
   # CDKプロジェクトのブートストラップ
   cdk bootstrap
   # インフラのデプロイ
   cdk deploy
   ```

### AWS環境の事前準備

1. AWS CLIで認証情報を設定
   ```bash
   aws configure
   ```

2. 必要なIAMポリシーの確認
   - CDKのデプロイに必要な権限が必要です
   - 詳細は[CDKドキュメント](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)を参照

3. `.env`ファイルの設定
   ```
   # .env ファイル例
   AWS_REGION=ap-northeast-1
   COGNITO_USER_POOL_ID=<デプロイ後に設定>
   COGNITO_CLIENT_ID=<デプロイ後に設定>
   API_ENDPOINT=<デプロイ後に設定>
   ```

### トラブルシューティング

1. **CDKデプロイエラー**
   - AWS認証情報が正しいか確認してください
   - リージョンが正しく設定されているか確認してください
   - ブートストラップが実行されているか確認してください

2. **フロントエンドビルドエラー**
   - Node.jsのバージョンを確認してください
   - 依存関係が正しくインストールされているか確認してください

3. **バックエンドテストエラー**
   - モックが正しく設定されているか確認してください
   - AWS SDKのローカルモックが設定されているか確認してください