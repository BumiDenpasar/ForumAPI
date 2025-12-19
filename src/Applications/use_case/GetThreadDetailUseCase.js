const DetailComment = require('../../Domains/comments/entities/DetailComment')
const DetailThread = require('../../Domains/threads/entities/DetailThread')

class GetThreadDetailUseCase {
  constructor ({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
  }

  async execute (threadId) {
    const thread = await this._threadRepository.getThreadById(threadId)
    const comments = await this._commentRepository.getCommentsByThreadId(threadId)

    return new DetailThread({
      ...thread,
      comments: comments.map((c) => new DetailComment(c))
    })
  }
}

module.exports = GetThreadDetailUseCase
