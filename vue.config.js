// vue.config.js
module.exports = {
  // options...
  publicPath: '',
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'KCSimulator',
        win: {
          icon: './public/favicon.ico'
        }
      }
    }
  }
};