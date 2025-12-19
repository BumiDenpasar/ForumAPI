const routes = (handler) => ([
  {
    method: 'GET',
    path: '/hello',
    handler: handler.getHelloHandler // Tidak perlu auth (public)
  }
])

module.exports = routes
