var webpack=require('webpack');

module.exports = {
  entry: {
    'yaku.with-utils': './lib/utils.js',
  },

  output: {
    filename: '[name].js',
    path: './lib/'
  }
};
