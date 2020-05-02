class UnauthorizedException extends Error {
  constructor(body = null) {
    super('Unauthorized');
    this.body = body;
  }

  get code() {
    return 401;
  }
}

export default UnauthorizedException;
