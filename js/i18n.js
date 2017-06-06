var language = (window.navigator.languages && window.navigator.languages[0]) ||
            window.navigator.language ||
            window.navigator.userLanguage ||
            window.navigator.browserLanguage;
            
if (language !== 'ja' && language !== 'ja-JP') {
    language = 'en';
}

i18next.init({
  lng: language,
  debug: true,
  resources: {
    en: {
      translation: {
        'title': 'Mable',
        'subtitle': 'Take your map into a table!',
        'description': 'Making new interface and experience for people on a table top with OpenStreetMap.',
        'preview-title': 'Discover where streets you love!',
        'preview-description': 'You can extract street line data and preview your Mable! Access now to get started!',
        'preview-button': 'Try Preview App for Free!',
        'video-title': 'Not a paper,<br>Not a screen.',
        'video-button': 'Watch videos on YouTube',
        'features-title': 'Unlimited Creativity, Unlimited Fun',
        'features-description': 'Check out how we create it with the elements!',
        'features-section1-title': 'Grid System',
        'features-section1-description': 'A unit of Mable is 500 x 500 mm grid. You can create one map table to combine them.',
        'features-section2-title': 'OpenStreetMap',
        'features-section2-description': 'Mable is created by open data from <a target="_blank" href="http://www.openstreetmap.org/">OpenStreetMap</a> as the Wikipedia of maps.',
        'features-section3-title': 'Digital Fablication',
        'features-section3-description': 'We can perform an unconventional processing by emergence of <a target="_blank" href="https://en.wikipedia.org/wiki/Digital_modeling_and_fabrication">digital fablication</a>, or <a target="_blank" href="https://en.wikipedia.org/wiki/Fab_lab">MIT FabLab</a>.',
        'features-section4-title': 'Projection Mapping',
        'features-section4-description': 'Mable is projected data visualization or art using Portable Ultra Short Throw Projector <a target="_blank" href="http://www.sony.com/electronics/projector/lspx-p1">LSPX-P1</a> by <a target="_blank" href="http://www.sony.com/electronics/life-space-ux">Sony Life Space UX</a>.',
        'blog-title': 'Mable Blog',
        'blog-button': 'Read our stories'
      }
    },
    ja: {
      translation: {
        'title': 'Mable',
        'subtitle': '地図をあなたの生活空間に刻み込もう！',
        'description': 'オープンストリートマップというみんなでつくる地図のデータを使って、テーブル上に新しいユーザーインターフェイスと体験をデザインします。',
        'preview-title': '好きな場所を好きな範囲で切り取ろう！',
        'preview-description': 'Mable Preview にアクセスすれば、カメラのシャッターを切るように道路線を切り取って、テーブルに焼き付けた完成イメージをすぐに確認できます。',
        'preview-button': 'Mable Preview を試す（無料）',
        'video-title': '紙でも、<br>スクリーンでもない地図',
        'video-button': 'YouTube でイメージビデオを観る',
        'features-title': 'オープンなクリエイティビティを組み合わせて、<br>作る楽しさをみんなの手に',
        'features-description': '地図をレーザーカッターで焼き付けるだけではない、オープンなプロセスと技術を使って製造/再現可能なプロダクトを提案しています。',
        'features-section1-title': 'グリッド システム',
        'features-section1-description': 'Mable は 500 x 500 mm を 1 ユニットとし、それらを組み合わせることで、柔軟なレイアウトに対応します。',
        'features-section2-title': 'OpenStreetMap',
        'features-section2-description': '<a target="_blank" href="http://www.openstreetmap.org/">オープンストリートマップ (OpenStreetMap)</a> はウィキペディアのように誰でも地図を編集することができ、私たちはそのオープンデータを使って Mable を製作しています。',
        'features-section3-title': 'デジファブ',
        'features-section3-description': '<a target="_blank" href="https://en.wikipedia.org/wiki/Digital_modeling_and_fabrication">デジタル ファブリケーション</a> や <a target="_blank" href="https://en.wikipedia.org/wiki/Fab_lab">MIT FabLab</a> の思想をリスペクトしています。製作過程をオープンにして、誰でも Mable を作れるようにサポートします。',
        'features-section4-title': 'プロジェクション マッピング',
        'features-section4-description': '<a target="_blank" href="http://www.sony.com/electronics/projector/lspx-p1">LSPX-P1</a> という <a target="_blank" href="http://www.sony.com/electronics/life-space-ux">Sony Life Space UX</a> で生まれた超単焦点プロジェクターを使って、実験的なデータビジュアライゼーションやメディアアートを Mable 上で表現しています。',
        'blog-title': 'Mable ブログ',
        'blog-button': '私たちの物語を読む'
      }
    }
  }
}, function(err, t) {
  // init set content
  updateContent();
});

function updateContent() {
    var contentIds = [
        'title',
        'subtitle',
        'description',
        'preview-title',
        'preview-description',
        'preview-button',
        'video-title',
        'video-button',
        'features-title',
        'features-description',
        'features-section1-title',
        'features-section1-description',
        'features-section2-title',
        'features-section2-description',
        'features-section3-title',
        'features-section3-description',
        'features-section4-title',
        'features-section4-description',
        'blog-title',
        'blog-button'
    ];
    contentIds.forEach(function (id) {
        document.getElementById(id).innerHTML = i18next.t(id);
    });
}

function changeLng(lng) {
  i18next.changeLanguage(lng);
}

i18next.on('languageChanged', () => {
  updateContent();
});