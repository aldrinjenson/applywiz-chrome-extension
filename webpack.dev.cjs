const { merge } = require('webpack-merge');
const common = require('./webpack.common.cjs');
const DotenvPlugin = require('dotenv-webpack');
const path = require('path');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  plugins: [
    new DotenvPlugin({
      path: path.resolve(__dirname, '.env.local'), // Use .env.local for development
    }),
  ],
});
