
var path = require('path');
var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var NoErrorsPlugin = webpack.NoErrorsPlugin;
var CompressionPlugin = require("compression-webpack-plugin");

var config = {
  devtool: 'source-map',
  devServer: {
    stats: 'errors-only',
  },
  entry: {
    main: './src/main',
    'test-main': './src/main',
  },
  output: {
    path: path.join(__dirname, '/public/js'),
    publicPath: '/js/',
    filename: '[name].js',
  },
  plugins: [
    new NoErrorsPlugin(),
  ],
  node: {
    fs: 'empty',
    module: 'empty',
    net: 'empty'
  },
  module: {
    loaders: [{
      test: /\.genfile\.js$/,
      loader: 'val-loader!babel-loader'
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }],
  },
}

if(process.env.NODE_ENV === 'production') {
  var plugin = new UglifyJsPlugin({minimize: true});
  config.plugins.unshift(plugin);
  config.plugins.unshift(new CompressionPlugin({
    asset: "{file}.gz",
    algorithm: "gzip",
    regExp: /\.js$|\.css$|\.html$/,
    minRatio: 0.9
  }));
}

module.exports = config;

