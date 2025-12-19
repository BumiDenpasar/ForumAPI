const createServer = require('../../../Infrastructures/http/createServer')
const container = require('../../../Infrastructures/container')

describe('/hello endpoint', () => {
  it('should response 200 and return hello message', async () => {
    // Arrange
    const server = await createServer(container)

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/hello?name=Dicoding'
    })

    // Assert
    const responseJson = JSON.parse(response.payload)
    expect(response.statusCode).toEqual(200)
    expect(responseJson.status).toEqual('success')
    expect(responseJson.data.message).toEqual('Hello Dicoding!')
  })

  it('should response 400 when name query is missing', async () => {
    // Arrange
    const server = await createServer(container)

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/hello'
    })

    // Assert
    const responseJson = JSON.parse(response.payload)
    expect(response.statusCode).toEqual(400)
    expect(responseJson.status).toEqual('fail')
  })
})
