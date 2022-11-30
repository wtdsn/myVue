const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'MyVue.js',
  },
  plugins: [new HtmlWebpackPlugin({
    template: path.resolve(__dirname, './index.html'),
    inject: 'body'
  }
  )],

  devServer: {
    port: 9000,
  },
  devtool: "source-map",
  mode: 'development'
};