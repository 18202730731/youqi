import { defineConfig } from '@tarojs/cli'
export default defineConfig({
  projectName: 'youqi', date: '2026-10-16', designWidth: 375,
  deviceRatio: { 375: 2, 640: 1.17, 750: 1, 828: 0.905 },
  sourceRoot: 'src', outputRoot: process.env.TARO_ENV === 'weapp' ? 'dist-weapp' : 'dist',
  framework: 'react', compiler: { type: 'webpack5', prebundle: { enable: false } },
  cache: { enable: false },
  plugins: ['@tarojs/plugin-platform-h5', '@tarojs/plugin-platform-weapp'],
  defineConstants: {
    'process.env.TARO_APP_CLOUD_ENV': JSON.stringify(process.env.TARO_APP_CLOUD_ENV || ''),
    'process.env.TARO_APP_REMINDER_TEMPLATE': JSON.stringify(process.env.TARO_APP_REMINDER_TEMPLATE || ''),
  },
  mini: {
    webpackChain(chain) { chain.plugins.delete('webpackbar') },
    postcss: { pxtransform: { enable: true }, cssModules: { enable: false } },
  },
  h5: {
    // webpackbar bundled by Taro is incompatible with recent Webpack 5 schema validation.
    webpackChain(chain) { chain.plugins.delete('webpackbar') },
    publicPath: '/', staticDirectory: 'static', router: { mode: 'hash' },
    devServer: { host: '127.0.0.1', port: 4173 },
    postcss: { pxtransform: { enable: false }, autoprefixer: { enable: true }, cssModules: { enable: false } },
  },
})
