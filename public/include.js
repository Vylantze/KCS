function importAll(r) {
  r.keys().forEach(r);
}

//https://webpack.js.org/guides/dependency-management/
//importAll(require.context('./ship/', true, /\.png$/));

importAll(require.context('./ship', true, /\.png$|\.ogg$|\.oga$/));
importAll(require.context('./database', true, /\.json$/));