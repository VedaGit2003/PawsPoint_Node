class ApiResponse {
  constructor(statusCode, data, message = "success", pagination = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.pagination = pagination
  }
}

export { ApiResponse };
