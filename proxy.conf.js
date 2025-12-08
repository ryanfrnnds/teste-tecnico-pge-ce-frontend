const targetHost = process.env.API_PROXY_HOST || 'localhost';
const targetPort = process.env.API_PROXY_PORT || '3000';

module.exports = {
  '/api': {
    target: `http://${targetHost}:${targetPort}`,
    secure: false,
    changeOrigin: true,
    logLevel: 'info',
    pathRewrite: {
      '^/api': ''
    }
  }
};

