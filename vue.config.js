// vue.config.js
module.exports = {
  // options...
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'KCEmulator',
        win: {
          icon: './public/favicon.ico'
        }
      }
    }
  }
};