/**
 * アプリ内で一度だけ読み込むファイルをここに書く
 * e.g. polyfill
 */
// dev時はtslib, prod時は@babel/polyfillをwebpack.BannerPluginで差し込む
// import 'tslib';

import getPrefixClassNames from '../modules/DeviceChecker';
import * as Configs from './config';

const prefixClassNames = getPrefixClassNames();
if (prefixClassNames.length > 0) {
  document.body.className += ` ${prefixClassNames.join(' ')}`;
}
console.log('Dev by', Configs.author);
