class Hello {
  constructor (payload) {
    this._verifyPayload(payload)
    this.message = `Hello ${payload.name}!`
  }

  _verifyPayload ({ name }) {
    if (!name) throw new Error('HELLO.NOT_CONTAIN_NEEDED_PROPERTY')
    if (typeof name !== 'string') throw new Error('HELLO.NOT_MEET_DATA_TYPE_SPECIFICATION')
  }
}
module.exports = Hello
