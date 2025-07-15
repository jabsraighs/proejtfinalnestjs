const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@domain': path.resolve(__dirname, '../../../Domain'),
      '@application': path.resolve(__dirname, '../../../Application'),
      '@infrastructure': path.resolve(__dirname, '../../../Infrastructure')
    },
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build/dist'),
  },
  devtool: 'source-map'
}