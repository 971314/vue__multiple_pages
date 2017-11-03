var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
var glob = require('glob');
var path = require('path');
// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    new FriendlyErrorsPlugin()
  ]
})


function getEntry(globPath) {
  var entries = {},
    basename, tmp, pathname;
  if (typeof (globPath) != "object") {
    globPath = [globPath]
  }
  globPath.forEach((itemPath) => {
    glob.sync(itemPath).forEach(function (entry) {
      basename = path.basename(entry, path.extname(entry));
      if (entry.split('/').length > 4) {
        tmp = entry.split('/').splice(-3);
        pathname = tmp.splice(-2, 1) + '/' + basename; // 正确输出js和html的路径

        entries[pathname] = entry;
      } else {
        entries[basename] = entry;
      }
    });
  });
  return entries;
}
var pages = getEntry(['./src/module/*.html','./src/module/**/*.html']);

for (var pathname in pages) {
  // 配置生成的html文件，定义路径等
  var conf = {
    filename:  pathname+'.html',
    template: pages[pathname],   // 模板路径
    inject: true              // js插入位置
  };

  var moduleType;
  if (pathname.split('/').length > 1) {
    var tmp = pathname.split('/');
    moduleType = tmp.splice(0,1);
  }
  else
    moduleType = pathname;

  var find = false;
  for(var key in module.exports.entry)
  {
    // console.log(key);
    // console.log('*****************');
    if(key.indexOf(moduleType)>=0)
    {
      conf.chunks = [key, 'js/vendors'];
      conf.hash = false;
      find = true;
      conf['chunksSortMode'] = function (chunk1, chunk2) {
        var order = [key, 'js/vendors'];
        var order1 = order.indexOf(chunk1.names[0]);
        var order2 = order.indexOf(chunk2.names[0]);
        return order2 - order1;
      };
      break;
    }
  }
  /*  if ((newPath in module.exports.entry) && pathname.split('/').length > 1) {
   conf.chunks = ['js/vendors', newPath];
   conf.hash = false;
   }*/
  if(!find)
    conf.chunks = [];

  module.exports.plugins.push(new HtmlWebpackPlugin(conf));
}

