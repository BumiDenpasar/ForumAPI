const pool = require('../../database/postgres/pool')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
  })

  describe('when POST /threads', () => {
    it('should response 201 and added thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body: 'secret'
      }
      const server = await createServer(container)

      // 1. Add User & Login to get Access Token
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secretpassword',
          fullname: 'Dicoding Indonesia'
        }
      })

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secretpassword'
        }
      })
      const { data: { accessToken } } = JSON.parse(loginResponse.payload)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedThread).toBeDefined()
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title)
    })

    it('should response 401 when no access token', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body: 'secret'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload
      })

      // Assert
      expect(response.statusCode).toEqual(401)
    })

    it('should response 400 when payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding'
      }
      const server = await createServer(container)

      // 1. Add User & Login
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secretpassword',
          fullname: 'Dicoding Indonesia'
        }
      })
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secretpassword'
        }
      })
      const { data: { accessToken } } = JSON.parse(loginResponse.payload)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
    })
  })

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail', async () => {
      // Arrange
      const server = await createServer(container)
      const threadId = 'thread-123'

      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding' })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-1' })
      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId, owner: 'user-1' })

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.thread).toBeDefined()
      expect(responseJson.data.thread.comments).toBeInstanceOf(Array)
    })

    it('should response 404 when thread not found', async () => {
      const server = await createServer(container)
      const response = await server.inject({
        method: 'GET',
        url: '/threads/unregistered-thread'
      })

      expect(response.statusCode).toEqual(404)
    })
  })
})
