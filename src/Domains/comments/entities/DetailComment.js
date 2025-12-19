class DetailComment {
  constructor (payload) {
    this._verifyPayload(payload)

    this.id = payload.id
    this.username = payload.username
    this.date = payload.date.toString()
    this.content = payload.is_delete ? '**komentar telah dihapus**' : payload.content
  }

  _verifyPayload ({ id, username, date, content }) {
    if (!id || !username || !date || !content) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof id !== 'string' || typeof username !== 'string' ||
        typeof date !== 'string' || typeof content !== 'string') {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = DetailComment
