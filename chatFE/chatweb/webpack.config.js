const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'production', // 배포 모드
  entry: './src/index.ts', // 엔트리 파일 (타입스크립트 파일)
  output: {
    path: path.resolve(__dirname, 'dist'), // 출력 경로
    filename: 'bundle.js', // 출력 파일 이름
  },
  resolve: {
    extensions: ['.ts', '.js'], // 확장자 처리
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // 타입스크립트 파일 처리
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true, // 코드 압축 활성화
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // console.log 제거
          },
        },
      }),
    ],
  },
  devtool: false, // 소스 맵 비활성화 (소스 맵 제거)
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // HTML 템플릿 파일
      minify: {
        collapseWhitespace: true, // 공백 제거
        removeComments: true, // 주석 제거
        removeRedundantAttributes: true, // 불필요한 속성 제거
        useShortDoctype: true, // doctype 단축
      },
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ],
};
