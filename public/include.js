function importAll(r) {
  r.keys().forEach(r);
}

//https://webpack.js.org/guides/dependency-management/
//importAll(require.context('./ship/', true, /\.png$/));

importAll(require.context('./ship', true, /\.png$|\.ogg$|\.oga$|\.mp3$/));
//importAll(require.context('./bgm', true, /\.png$|\.ogg$|\.oga$|\.mp3$/));
//importAll(require.context('./se', true, /\.png$|\.ogg$|\.oga$|\.mp3$/));
importAll(require.context('./database', true, /\.json$/));