// working solution vue.config.js
const isDevelopment = true
module.exports = {
  // loaders: {
  //   scss: 'style!css!sass'
  // },
  pluginOptions: {
    electronBuilder: {
      preload: 'preload.js',
      // externals: ['sqlite3'],
      nodeIntegration: true, //run as node
      nodeIntegrationInWorker: true,
      builderOptions: {
        extraFiles: [
          {
            "from": "output",
            "to": "output",
            filter: ['**/.keep']
          },
          {
            "from": "upload",
            "to": "upload",
            filter: ['**/.keep']
          },
          {
            "from": "upload",
            "to": "upload",
            filter: ['**/templates/*']
          }
        ]
      }
    },
  },
  configureWebpack: {
    devtool: 'source-map',
    module: {
      // rules: [
      //   // ... other rules omitted
  
      //   // this will apply to both plain `.scss` files
      //   // AND `<style lang="scss">` blocks in `.vue` files
      //   {
      //     test: /\.scss$/,
      //     use: [
      //       'vue-style-loader',
      //       'css-loader',
      //       'sass-loader'
      //     ]
      //   }
      // ]

      // loaders: [
      //   {
      //     test: /\.vue$/,
      //     loader: 'vue'
      //   }, 
      //   {
      //       test: /\.s[a|c]ss$/,
      //       loader: 'style!css!sass'
      //   }
      // ]

      // rules: [
      //   {
      //     // test: /\.worker\.(c|m)?js$/i,
          // test: /\.worker\.js$/i,
          // use: [
            // {
            //   loader: "worker-loader",
            //   options: { 
            //     filename: () => { 
                //   const time = Date.now()
                //   return time +".[contenthash].[name].js"
                // },
      //           inline: isDevelopment ? "fallback" : "no-fallback",
      //           publicPath: (pathData, assetInfo) => {
      //             return `/scripts/${pathData.hash}/workers/`;
              //   },
              // }
            // },
      //       {
      //         loader: "babel-loader",
      //         options: {
      //           presets: ["@babel/preset-env"],
      //         },
      //       },
          // ],
      //     // options: {
      //     //   esModule: false,
      //     // },
      //   },
      // ],
    },
  }
};