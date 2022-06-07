module.exports = {
  chainWebpack: (config) => {
    // Pug Loader
    config.module
      .rule('pug')
      .test(/\.pug$/)
      .use('pug-plain-loader')
      .loader('pug-plain-loader')
      .end();
  },
  lintOnSave: process.env.NODE_ENV !== 'production',
  configureWebpack: {
    devServer: {
      publicPath: '/',
      headers: { "Access-Control-Allow-Origin": "*" },
      proxy: {
        '/api': {
          target: 'http://localhost:8008/v1',
          pathRewrite: {'^/api' : ''}
        },
        '/images': {
          target: 'https://localhost:9000/',
          pathRewrite: {'^/images' : ''}
        }
      },
      historyApiFallback: true
    }
  }
};
