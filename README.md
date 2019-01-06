# PecaSnap

PeerCastで配信・リレーしているチャンネルの監視を簡略化するするためのツールです。本アプリケーションは内部通信用に37144ポートを使用します。外部に通信しないのでポートを開放する必要はありません。

次のことができます。

- 定期的なスクリーンショットの取得
- 受信状態の表示 **受信中かエラーのみの実装**.

次のような仕様です。

- 特定のピアキャストに依存しません。 **Compatible PeerCast / PeerCast-IM /  PeerCastStation / PeerCast-YT**.

- スクリーンショットはWEBPで保存されます。WEBPのサムネイル表示についてはこちら https://www.gigafree.net/tool/view/WebP-Codec.html
- 1時間使用すると2MB程度の保存領域を使用します。

## 使用方法 / 動作環境

Windows向けに作っています。Windowsではリリースファイルを展開した中にある ***pecasnap.exe*** を実行することで動作します。
Linux / Macはソースコードをダウンロードして ```npm install``` をしてください。

>※軽量化のため Linux / Mac 向けの ffmpeg は削っています。Linux/Macで使用の場合はこちらに ffmpeg の static バイナリを配置してください。npm install ffmpeg-staticで降ってくるものを使用しています。

```bash
resources\app\node_modules\ffmpeg-static-electron\bin
```

## 動作画面
![](https://raw.githubusercontent.com/japankun/pecasnap/master/images/pecasnap.png)

## ライブラリなど

- ffmpeg
- electron
- express
- body-parser
- ffmpeg-static
- jQuery
- Modaal
- minstyle.io
