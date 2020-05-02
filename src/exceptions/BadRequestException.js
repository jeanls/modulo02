class BadRequestException extends Error {
  constructor(body = null) {
    super('Bad request.');
    this.body = body;
  }

  get code() {
    return 400;
  }
}

export default BadRequestException;
