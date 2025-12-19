const pool = require('../../database/postgres/pool')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
  })

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and added comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'ini komentar saya'
      }
      const server = await createServer(container)

      const userResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret_password',
          fullname: 'Dicoding Indonesia'
        }
      })
      const { data: { addedUser: { id: userId } } } = JSON.parse(userResponse.payload)

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret_password'
        }
      })
      const { data: { accessToken } } = JSON.parse(loginResponse.payload)

      const threadId = 'thread-123'
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedComment).toBeDefined()
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content)
    })

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'ini komentar'
      }
      const server = await createServer(container)

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'tester',
          password: 'password',
          fullname: 'Tester'
        }
      })
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'tester',
          password: 'password'
        }
      })
      const { data: { accessToken } } = JSON.parse(loginResponse.payload)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-tidak-ada/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should response 401 when no access token', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {
          content: 'isi komentar'
        }
      })

      // Assert
      expect(response.statusCode).toEqual(401)
    })
  })

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete comment correctly', async () => {
      // Arrange
      const server = await createServer(container)

      const userResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'userA', password: 'password', fullname: 'User A' }
      })
      const { data: { addedUser: { id: userId } } } = JSON.parse(userResponse.payload)

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'userA', password: 'password' }
      })
      const { data: { accessToken } } = JSON.parse(loginResponse.payload)
      const threadId = 'thread-123'
      const commentId = 'comment-123'
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId })

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')

      const comments = await CommentsTableTestHelper.findCommentsById(commentId)
      expect(comments[0].is_delete).toEqual(true)
    })

    it('should response 403 when user is not the owner of the comment', async () => {
      // Arrange
      const server = await createServer(container)

      // 1. Buat User A (Pemilik)
      await UsersTableTestHelper.addUser({ id: 'user-A', username: 'userA' })
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-A' })
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-A' })

      // 2. Buat User B & Login (Bukan Pemilik)
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'userB', password: 'password', fullname: 'User B' }
      })
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'userB', password: 'password' }
      })
      const { data: { accessToken } } = JSON.parse(loginResponse.payload)

      // Action: User B hapus comment milik User A
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(403)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toBeDefined()
    })

    it('should response 404 when comment or thread does not exist', async () => {
      // Arrange
      const server = await createServer(container)

      // Login User
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'tester', password: 'password', fullname: 'Tester' }
      })
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'tester', password: 'password' }
      })
      const { data: { accessToken } } = JSON.parse(loginResponse.payload)

      // Action: Hapus comment yang tidak ada
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-not-found',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.statusCode).toEqual(404)
    })
  })
})
