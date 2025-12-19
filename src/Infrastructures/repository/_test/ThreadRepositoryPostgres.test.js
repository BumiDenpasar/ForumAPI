const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const NewThread = require('../../../Domains/threads/entities/NewThread')
const AddedThread = require('../../../Domains/threads/entities/AddedThread')
const pool = require('../../database/postgres/pool')
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      const newThread = new NewThread({
        title: 'sebuah thread',
        body: 'isi thread',
        owner: 'user-123'
      })
      const fakeIdGenerator = () => '123'
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      await threadRepositoryPostgres.addThread(newThread)

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123')
      expect(threads).toHaveLength(1)
    })

    describe('isThreadExist function', () => {
      it('should throw NotFoundError when thread not found', async () => {
        const repository = new ThreadRepositoryPostgres(pool, {})
        await expect(repository.isThreadExist('thread-123'))
          .rejects.toThrow(NotFoundError)
      })
    })

    it('should return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      const newThread = new NewThread({
        title: 'sebuah thread',
        body: 'isi thread',
        owner: 'user-123'
      })
      const fakeIdGenerator = () => '123'
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread)

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'sebuah thread',
        owner: 'user-123'
      }))
    })
  })

  describe('getThreadById function', () => {
    it('should return thread detail correctly', async () => {
      // Arrange
      const threadId = 'thread-123'
      const expectedThread = {
        id: threadId,
        title: 'sebuah thread',
        body: 'isi thread',
        date: '2023-09-22T07:19:09.775Z',
        username: 'dicoding'
      }

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' })
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: expectedThread.title,
        body: expectedThread.body,
        date: expectedThread.date,
        owner: 'user-123'
      })

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})

      // Action
      const thread = await threadRepositoryPostgres.getThreadById(threadId)

      // Assert
      expect(thread).toStrictEqual({
        id: expectedThread.id,
        title: expectedThread.title,
        body: expectedThread.body,
        date: expectedThread.date,
        username: expectedThread.username
      })
    })

    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-999'))
        .rejects.toThrowError(NotFoundError)
    })
  })
})
