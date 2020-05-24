// vue.config.js
module.exports = {
  // options...
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