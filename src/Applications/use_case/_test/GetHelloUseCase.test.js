const GetHelloUseCase = require('../GetHelloUseCase')

describe('GetHelloUseCase', () => {
  it('should orchestrating the get hello action correctly', async () => {
    // Arrange
    const useCasePayload = { name: 'World' }
    const getHelloUseCase = new GetHelloUseCase()

    // Action
    const message = await getHelloUseCase.execute(useCasePayload)

    // Assert
    expect(message).toEqual('Hello World!')
  })
})
