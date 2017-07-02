const webpack = require('webpack');
const path = require('path');

const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.ts',
    polyfills: './src/polyfills.ts',
    vendor: './src/vendor.ts'
  },
  output: {
    path: path.resolve(__dirname, 'bundle'),
    library: ['rx-webrpc', '[name]'],
    libraryTarget: 'umd',
    filename: '[name].js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].[chunkhash].chunk.js'
  },
  externals: [
    'rxjs',
    'grpc-web-client',
    'google-protobuf',
    'core-js'
  ],
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader'
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  plugins: [
    new UglifyJsPlugin({
      beautify: false,
      mangle: { screw_ie8: true, keep_fnames: true },
      compress: { screw_ie8: true },
      comments: false
    }),
    new CopyWebpackPlugin([
      { from: 'package.json', to: '' },
      { from: 'README.md', to: ''}
    ])
  ]
};