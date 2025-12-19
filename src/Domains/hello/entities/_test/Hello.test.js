const Hello = require('../Hello')

describe('Hello entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new Hello({})).toThrowError('HELLO.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should create Hello object correctly', () => {
    const payload = { name: 'Dicoding' }
    const hello = new Hello(payload)
    expect(hello.message).toEqual('Hello Dicoding!')
  })
})
