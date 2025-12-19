const Hello = require('../../Domains/hello/entities/Hello')

class GetHelloUseCase {
  async execute (useCasePayload) {
    const hello = new Hello(useCasePayload)
    return hello.message
  }
}
module.exports = GetHelloUseCase
