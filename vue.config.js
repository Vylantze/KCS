// vue.config.js
module.exports = {
  // options...
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'KCEmulator',
        extraResources: [
          {
            from: "packed/ship",
            to: "./ship/",
            filter: ["**/*"]
          }

        ],
        win: {
          icon: './public/favicon.ico'
        }
      }
    }
  }
};