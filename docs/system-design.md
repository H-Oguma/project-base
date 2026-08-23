# システム設計書 (System Design Document)

本書は本プロジェクトのアーキテクチャおよび機能仕様をまとめた設計書です。
**※実装に変更があった場合、本ファイルはAIによって常に最新状態に保たれます。**

## 1. システムアーキテクチャ

* **フロントエンド**: React + Vite (Port: 5173)
* **バックエンド**: Python FastAPI (Port: 8000)
* **データベース**: SQLite + SQLAlchemy ORM
* **インフラ**: `uv` および `npm` (concurrently) によるローカルネイティブ実行

---

## 2. データベース設計 (Schema)

現在定義されているテーブル一覧です。

### `items` テーブル
| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | Integer | Primary Key, Index | アイテムID |
| `title` | String | Index | アイテムのタイトル |
| `description` | String | Index | アイテムの詳細説明 |

---

## 3. API設計 (Endpoints)

バックエンド（FastAPI）で提供しているREST APIのエンドポイント一覧です。
（※詳細は `http://localhost:8000/docs` のSwagger UIでも確認可能）

| メソッド | パス | 説明 | リクエストボディ | レスポンス |
|---|---|---|---|---|
| `GET` | `/` | ヘルスチェック・ルート | なし | `{"message": "..."}` |
| `POST` | `/items/` | アイテムの新規作成 | `{"title": "str", "description": "str"}` | 作成されたアイテム情報 |
| `GET` | `/items/` | アイテム一覧の取得 | `?skip=int&limit=int` (クエリ) | アイテム情報の配列 |

---

## 4. フロントエンド設計 (Views & Components)

*現在、初期セットアップ状態であり固有の画面やコンポーネント定義は未作成。今後の実装に合わせて追記予定。*
