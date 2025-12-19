const GetHelloUseCase = require('../../../../Applications/use_case/GetHelloUseCase')

class HelloHandler {
    constructor(container) {
      this._container = container;
      this.getHelloHandler = this.getHelloHandler.bind(this);
    }
  
    async getHelloHandler(request, h) {
      const getHelloUseCase = this._container.getInstance(GetHelloUseCase.name)
      const message = await getHelloUseCase.execute(request.query);
      return {
        status: 'success',
        data: { message },
      };
    }
  }
  module.exports = HelloHandler;