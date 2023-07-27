const { merge } = require('webpack-merge');
const common = require('./webpack.common.cjs');
const DotenvPlugin = require('dotenv-webpack');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new DotenvPlugin({
      path: path.resolve(__dirname, '.env.prod'), // Use .env.prod for production
    }),
  ],
});
