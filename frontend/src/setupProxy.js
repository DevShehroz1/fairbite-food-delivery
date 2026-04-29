const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = 'http://localhost:5001';

  app.use(
    ['/api', '/socket.io'],
    createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
    })
  );
};
