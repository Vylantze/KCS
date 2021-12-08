// vue.config.js
module.exports = {
  // options...
  publicPath: process.env.NODE_ENV === 'ghpages' ? '/KCS/' : '/',
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