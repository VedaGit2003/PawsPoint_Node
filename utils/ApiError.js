class ApiError extends Error {
    constructor(
        statusCode, 
        message = "Something went wrong", 
        errors = [], 
        stack = ""
    ) {
        super(message); // Set the message of the error
        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
        
        // Capture stack trace
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
