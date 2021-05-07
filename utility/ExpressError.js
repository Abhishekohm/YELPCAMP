class ExpressError extends Error {
  constructor(meassage, statusCode) {
    super();
    this.message = meassage;
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
