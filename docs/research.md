# 調査・実装の記録

確認日：2026-09-30（日本時間）。公開ページ本文とSketchfab公式APIを読み取り。

## 採用した公開モデル

| モデル | 作者 | 種別 | 表示方法・権利の扱い |
| --- | --- | --- | --- |
| [Studio apartment](https://sketchfab.com/3d-models/cae2d96ede1d4112b1fd391099a43f77) | zamorev4d | 設計モデル | APIにCC Attribution表記。作者・リンクを表示し、公式埋め込みで閲覧 |
| [Studio Apartment](https://sketchfab.com/3d-models/c7903169915d478898d35b32b0eac7be) | Shaz | 学校課題の設計モデル | 同上 |
| [都庁前駅・男性トイレ側](https://sketchfab.com/3d-models/697c4aec7ef14b0ab8fc9f06961acd64) | 東京都デジタルツイン実現プロジェクト | スマートフォンLiDAR実測 | APIのlicenseはnull、downloadableはfalse。再配布ライセンスを推定せず公式埋め込みを使用 |
| [都庁前駅・女性トイレ側](https://sketchfab.com/3d-models/dfcb99cda1b947fd9d70a15fe0715997) | 同上 | スマートフォンLiDAR実測 | 同上 |

公式APIの名前・作者・説明・利用条件等は `docs/sources/*.json` に保存。プレビュー画像は配布元URLを参照し、メッシュやテクスチャはリポジトリに同梱しない。

[東京都の実証03ページ](https://info.tokyo-digitaltwin.metro.tokyo.lg.jp/zissyou03/)でも2件の埋め込みと、スマートフォンLiDAR点群から作成したメッシュであることを確認。今回使用する非LiDAR端末で同等の結果が得られるとは主張しない。

モデル説明の旧オープンデータURL `https://catalog.data.metro.tokyo.lg.jp/dataset/t000029d0000000012` と対応するCKAN APIは404。現行カタログ検索でも同じデータセットの移転先を確認できなかった。SketchfabのダウンロードAPIは未認証では401。認証・配信制限を回避したメッシュ取得は行わず、公式ページでも使用されている標準の埋め込みを採用した。

## アプリ公式情報

### KIRI Engine

出典：[Pricing](https://www.kiriengine.app/pricing)、[FAQ](https://www.kiriengine.app/faq)

- Basicは無料。Photo Scan、1スキャン150枚／最大2 GB、Unlimited 3D Scan、Unlimited Free Exports。
- WebのPhoto Scanアップロードを含む。FAQはAndroid、iOS、Web対応と説明。
- Featureless Object Scan、Mesh-Inclusive 3DGS等はPro。
- FAQの一般的な「photos/videos」という説明だけで、無料Photo Scanが動画を直接入力できるとは判断しない。動画から鮮明なフレームを抽出してPhoto Scanへ入れる経路を提示。

### Polycam

出典：[Pricing](https://poly.cam/pricing)

- Free：10 Photogrammetry captures、150 images per capture、3 min videos per capture。
- FreeのGLTF書き出しとpublic link sharingを表示。
- ページはiOS、Android、Web対応を説明。Space Modeを全機種共通の機能として案内しない。
- 10件が月次・生涯のどちらかとはこの資料だけで断定せず、利用アカウントの残枠確認を案内。
- Help Centerの対応端末記事は403となり、機種ごとのボタン配置や無料動画取り込みのOS別操作は未確認。

### スマホ

Pixel 8a / iPhone 13 mini / iPhone 14 / iPhone 17 / Nothing Phone (3a) を選択肢に反映。共通の非LiDAR手順と標準1×のレンズ固定を案内。4K/30fpsは試し撮りの候補で、機種ごとの実写画質や低照度での成功を保証しない。5機種の実機検証は未実施。

## モデルとルートの関係

Three.js空間は移動・視線・高さを説明する自作模式図。公式モデルは設備や遮蔽を観察する参考資料。元メッシュを取得できていないため、同一座標系でのルート重畳やモデル固有の移動可否判定は実装していない。この区別を画面・出典・READMEに明記。

模式図は2種類の空間と各5段階の経路を持ち、基準高さを65–150cmで調整できる。高位置は基準+40cm、低位置は基準−45cm（下限45cm）。数値は教材上の参考で、特定の身体条件を必須にしない。

## レポートとデザイン

ユーザー提供 `deep-research-report.md` の壁沿いの並進、複数高さ、対角の接続、設備の死角、反射面、独立寸法チェックを反映。静止画の候補枚数・一眼カメラの絞り値をスマホ動画の要件へ転用していない。

[mori-ui](https://github.com/novelsavage/codex-skills/tree/main/skills/mori-ui) 本文、style-principles、anti-slop、verificationを参照。題材に沿った経路・視錐台・スマホの記号と、動作を示す短いコピーを採用。個人的な背景は公開UIに掲載していない。

Replica Datasetも調査したが、公開配信の扱いと多目的トイレへの適合を確認できなかったため採用していない。

## 検証

- TypeScript検査とViteビルド。
- 経路テスト：壁・床・天井の範囲、位置変化、周回の接続、主要家具との非交差。
- Playwright：再生／停止、空間とモデル選択、5段階、3視点、高さと位置、5端末、2アプリ、モーダル、読み込み失敗からの復帰UI。
- 1440 / 768 / 390 / 320pxのスクリーンショット・横あふれ検査。モーション抑制時の自動再生なし。
- mori-ui機械監査。
- 実接続でSDK・埋め込みHTML・プレビュー画像のHTTP 200を確認。ヘッドレスChromiumでは公式APIが `No Hardware Support for Webgl` を返した。ソフトウェア描画の明示設定でも同じ結果。外部モデルの3D描画は検証未完了とし、成功を装わない。

Three.js由来の500 kB超チャンク警告が残る（gzip約129 kB）。実機カメラ操作、実写動画のアップロード、再構成・精度検証は今回の検証範囲に含まれない。
