const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase')
const DetailThread = require('../../../Domains/threads/entities/DetailThread')

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    const threadId = 'thread-123'
    const expectedThreadDetail = {
      id: threadId,
      title: 'judul',
      body: 'isi',
      date: '2023',
      username: 'dicoding'
    }

    const expectedComments = [
      { id: 'comment-1', username: 'userA', date: '2023', content: 'hi', is_delete: false },
      { id: 'comment-2', username: 'userB', date: '2023', content: 'deleted', is_delete: true }
    ]

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()

    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve({
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      date: '2023',
      username: 'dicoding'
    }))
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([
      { id: 'comment-1', username: 'userA', date: '2023', content: 'hi', is_delete: false },
      { id: 'comment-2', username: 'userB', date: '2023', content: 'deleted', is_delete: true }
    ]))

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository
    })

    const threadDetail = await useCase.execute(threadId)

    expect(threadDetail).toBeInstanceOf(DetailThread)
    expect(threadDetail.id).toEqual(expectedThreadDetail.id)
    expect(threadDetail.title).toEqual(expectedThreadDetail.title)
    expect(threadDetail.body).toEqual(expectedThreadDetail.body)
    expect(threadDetail.date).toEqual(expectedThreadDetail.date)
    expect(threadDetail.username).toEqual(expectedThreadDetail.username)
    expect(threadDetail.comments).toHaveLength(2)
    expect(threadDetail.comments[1].content).toEqual('**komentar telah dihapus**')
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId)
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId)
  })
})
