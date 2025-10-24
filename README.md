# 制作物：CodeBridge（コードブリッジ）　

デモの紹介サイト　

https://kimiyasu.com/2024/05/17/sample_01/

## 🎯 目的・背景

ハッカソンに出場した際、私は「チームメンバーのスキルを把握するまでに時間がかかる」という課題を感じました。  
また、ChatGPTなど生成AIの進化により、GitHubのリポジトリを読み解きながら実装や学習を行うスタイルが、以前よりも取りやすくなってきたとも実感しました。

そこで私は、「リポジトリを共有し、質問や議論ができるWebアプリ」を開発しました。  
このアプリでは、チーム開発におけるスキル共有の円滑化と、学習者同士が技術知識を共有し合える環境の実現を目指して制作しました。

アプリの名前は **「CodeBridge（コードブリッジ）」** です。  
その由来は、“プログラミング（コード）を通じて、人と人とをつなぐ架け橋になりたい” という想いから名付けました。

---

## 🛠 使用した技術スタック

- **フロントエンド**：React  
- **バックエンド**：Django REST Framework、Express.js  
- **データベース**：SQLite（Django側）、MongoDB（Express/Socket側）  
- **リアルタイム通信**：Socket.io（Express）  
- **認証方式**：JWT（JSON Web Token）  
- **AIモデル**：PyTorch（BERTによる文章分類）  

---

## 📦 このリポジトリ（React側）で実装されている主な機能

### 🔐 ユーザー認証
- JWTトークンを使用してログイン・ログアウトを実装
- Cookieでトークンを保持し、リクエストに自動添付

### 🏠 ルーム機能
- ルーム名とパスワードで入室
- 参加中ルームの状態をContext APIで管理

### 📂 リポジトリ登録・表示
- タイトル、URL、説明文、デモ動画を入力してリポジトリを投稿
- すべてのリポジトリ一覧を表示
- カテゴリ別フィルタリングに対応

### 🤖 AIによるカテゴリ分類
- 入力されたリポジトリ説明文をBERT分類APIに送信し、自動でカテゴリ判定
- 円形プログレスバーとアニメーション付きで結果表示

### 💬 リアルタイムメッセージ機能
- 各リポジトリに紐づいた掲示板でリアルタイム投稿・受信
- 既読状態の管理や通知機能も実装（Room単位）

### ⭐ お気に入り管理
- リポジトリをお気に入りに登録
- お気に入りのみをフィルタ表示

---

## 📚 使用されている主なライブラリ（React）

| ライブラリ名                  | 役割                                         |
|------------------------------|----------------------------------------------|
| `react-router-dom`           | ページ遷移・ルーティング機能                 |
| `axios`                      | Django APIとのHTTP通信                       |
| `socket.io-client`           | Expressサーバーとのリアルタイム通信          |
| `react-cookie`               | JWTトークンの保存・送信                      |
| `framer-motion`              | アニメーション（AI検索画面など）             |
| `react-circular-progressbar` | 円形プログレスバーの表示                    |
| `react-icons`                | チャットアイコンなどの視覚装飾               |
| `Context API（React標準）`   | グローバルな状態管理（リポジトリやルーム）  |


## 🧱 動作環境

このプロジェクトは以下のバージョンで開発・動作確認しています：

- **Node.js**：v22.14.0  
- **npm**：v10.9.2

## ⚙️ セットアップ方法

このプロジェクトは React で構成されたフロントエンドアプリです。以下の手順でローカル環境で動作確認が可能です。

---

### 🛠 Node.js のインストール（未インストールの場合）

 [https://nodejs.org/ja/](https://nodejs.org/ja/)

### 1. リポジトリをクローン

```bash
git clone https://github.com/NK-kimiya/repository_share_app_front.git
cd repository_share_app_front

### 2. 依存ライブラリファイルのディレクトリへ移動
cd repository_share_app

### 3. 依存ライブラリをインストール
npm install

### 4.ローカル開発サーバーを起動(ポート3000番)
npm start

アプリは通常、以下のURLで起動されます：
👉 http://localhost:3000

```

## 🔗 関連リポジトリ

このリポジトリは、フロントエンド（React）で構築されたユーザーインターフェースを提供するアプリケーションです。  
本プロジェクトは、以下の2つのバックエンドと連携して動作しています：

- 🧠 **APIバックエンド（Django + BERTによる分類）**  
  [https://github.com/NK-kimiya/repository_share_app_api](https://github.com/NK-kimiya/repository_share_app_api.git)

- 🔌 **リアルタイムサーバー（Express + Socket.io）**  
  [https://github.com/NK-kimiya/repository_share_app_socket](https://github.com/NK-kimiya/repository_share_app_socket.git)



