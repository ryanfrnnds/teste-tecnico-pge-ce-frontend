// const targetHost = process.env.API_PROXY_HOST || 'json-server';
const targetHost = 'localhost'

module.exports = {
  '/api': {
    target: `http://${targetHost}:3000`,
    secure: false,
    changeOrigin: true,
    logLevel: 'info',
    pathRewrite: {
      '^/api': ''
    }
  }
};

