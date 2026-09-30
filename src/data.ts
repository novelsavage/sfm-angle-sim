export type Space = 'room' | 'toilet';
export interface Model {
  id: string; space: Space; name: string; subtitle: string; author: string;
  kind: string; thumbnail:string; license: string; description: string; url: string;
}
export const models: Model[] = [
  {id:'cae2d96ede1d4112b1fd391099a43f77',thumbnail:"https://media.sketchfab.com/models/cae2d96ede1d4112b1fd391099a43f77/thumbnails/0faeca143b854f928bc1bd4275f21058/755c95ed3de646d3b25350d751dc950f.jpeg",space:'room',name:'Studio apartment',subtitle:'zamorev4d',author:'zamorev4d',kind:'設計モデル',license:'CC BY（配布元表記）',description:'家具を備えたワンルームの設計モデル。実在の部屋をスキャンしたものではありません。',url:'https://sketchfab.com/3d-models/cae2d96ede1d4112b1fd391099a43f77'},
  {id:'c7903169915d478898d35b32b0eac7be',thumbnail:"https://media.sketchfab.com/models/c7903169915d478898d35b32b0eac7be/thumbnails/ad992be3701545749528b5d23a4720c4/1fe0a31dafa84ff9b7e681128c4097f1.jpeg",space:'room',name:'Studio Apartment',subtitle:'Shaz',author:'Shaz',kind:'設計モデル',license:'CC BY（配布元表記）',description:'学校の制作課題として作られたワンルーム。異なる家具配置の比較用です。実測モデルではありません。',url:'https://sketchfab.com/3d-models/c7903169915d478898d35b32b0eac7be'},
  {id:'697c4aec7ef14b0ab8fc9f06961acd64',thumbnail:"https://media.sketchfab.com/models/697c4aec7ef14b0ab8fc9f06961acd64/thumbnails/430361f887f140d89d454695dd122396/c8a4582c3af0417694d8ab639908ecef.jpeg",space:'toilet',name:'都庁前駅・男性トイレ側',subtitle:'東京都デジタルツイン実現プロジェクト',author:'東京都デジタルツイン実現プロジェクト',kind:'実測スキャン',license:'公式埋め込みで表示・ファイル再配布なし',description:'2021年度の実証でスマートフォンLiDARから作成されたバリアフリートイレの3Dメッシュ。撮影練習の参考であり、現地の現在の状態や寸法精度を保証するものではありません。',url:'https://sketchfab.com/3d-models/697c4aec7ef14b0ab8fc9f06961acd64'},
  {id:'dfcb99cda1b947fd9d70a15fe0715997',thumbnail:"https://media.sketchfab.com/models/dfcb99cda1b947fd9d70a15fe0715997/thumbnails/e99f44e2f3514c7a91959da90a700674/7edbf0582a1d4d2886f488f05d06646f.jpeg",space:'toilet',name:'都庁前駅・女性トイレ側',subtitle:'東京都デジタルツイン実現プロジェクト',author:'東京都デジタルツイン実現プロジェクト',kind:'実測スキャン',license:'公式埋め込みで表示・ファイル再配布なし',description:'2021年度の実証でスマートフォンLiDARから作成されたバリアフリートイレの3Dメッシュ。別配置の設備や死角を比較できます。',url:'https://sketchfab.com/3d-models/dfcb99cda1b947fd9d70a15fe0715997'},
];
export const devices = ['Pixel 8a', 'iPhone 13 mini', 'iPhone 14', 'iPhone 17', 'Nothing Phone (3a)'];
export interface Step {name:string; action:string; focus:string; note:string; height:string}
export const steps: Record<Space, Step[]> = {
  room:[
    {name:'全体をつなぐ',action:'壁沿いに進む。スマホは向かいの壁へ。',focus:'壁・家具・隣の壁を一緒に',note:'その場で回るだけにせず、撮影する位置を変えます。',height:'基準の高さ'},
    {name:'高さを変える',action:'撮れる高さを変えて、壁の上側まで。',focus:'壁の上端・家具の上面',note:'高さを変えにくいときは、撮れる範囲を撮り、上面の補完を分担します。',height:'基準 + 40 cm'},
    {name:'角をつなぐ',action:'角へ少し寄り、二つの壁を同じ画面に。',focus:'壁どうし・周回どうしの接続',note:'角で急に振り向かず、前の画面と共通する部分を残します。',height:'基準の高さ'},
    {name:'死角を補う',action:'机の下へ。少し引いた画面も残す。',focus:'家具の下・脇・床との境目',note:'細部だけを切り離さず、周囲の壁や床も写します。入れない隙間へ無理に進みません。',height:'低い位置'},
    {name:'床・天井・入口',action:'位置を変えながら、上下と入口をつなぐ。',focus:'床・天井・出入口',note:'撮影後はブレ、白飛び、撮り残しを確認。動画が長いだけでは十分とは限りません。',height:'基準の高さ'},
  ],
  toilet:[
    {name:'全体をつなぐ',action:'設備を避けて進み、向かいの壁を撮る。',focus:'壁・便器・洗面台の位置関係',note:'扉・便座・可動手すりの状態は、撮影セットの途中で変えません。',height:'基準の高さ'},
    {name:'高さを変える',action:'高さを変え、設備の上面と壁を一緒に。',focus:'便器上面・手すり・壁上部',note:'高い位置が難しいときは役割を分担。基準の高さは自由に調整できます。',height:'基準 + 40 cm'},
    {name:'角をつなぐ',action:'斜めから撮って、離れた壁をつなぐ。',focus:'対角方向・入口・設備の背景',note:'設備だけを大きく写し続けず、周囲との共通部分を残します。',height:'基準の高さ'},
    {name:'設備の裏を見る',action:'手すりを横と下から。固定部も入れる。',focus:'手すりの固定部・便器脇・洗面台下',note:'鏡や光沢面は撮っても復元できない場合があります。正面だけでなく位置を変えて補完します。',height:'低い位置'},
    {name:'床・天井・入口',action:'上下と入口を補って、撮り残しを確認。',focus:'床際・排水・天井・入口',note:'撮影中の第三者の入室を避け、呼出しボタンやコードを覆ったり動かしたりしません。',height:'基準の高さ'},
  ],
};
export const appFacts = {
  kiri: {name:'KIRI Engine',plan:'Basic / 無料',headline:'動画から写真を選び、Photo Scanへ。',facts:['1件につき最大150枚・2 GB','Photo Scanの作成・書き出し回数は無制限','Android・iOS・Webに対応'],flow:['標準カメラで、段階ごとに短く撮る','PC等で動画から鮮明なフレームを抽出','重なりを保って150枚以内を選び、Photo Scanへ'],note:'無料Photo Scanへの動画直接入力は未確認のため、写真取り込みを案内しています。Featureless Object Scanと3DGSはPro機能です。',url:'https://www.kiriengine.app/pricing'},
  poly: {name:'Polycam',plan:'Free',headline:'動画または写真を、フォトグラメトリへ。',facts:['1件につき最大150枚・動画は3分','無料枠の表記は10 Photogrammetry captures','GLTF書き出しに対応'],flow:['標準カメラで撮り、鮮明な動画を用意','Web等の対応する取り込み画面で、3分以内の動画または150枚以内の写真を指定','写真からの形状復元を選び、結果をGLTFで保存'],note:'取り込み画面はOS・版で異なります。動画を受け付けない画面ではフレームを抽出して写真を取り込みます。無料枠の残数を実際のアカウントで確認してください。',url:'https://poly.cam/pricing'},
};
