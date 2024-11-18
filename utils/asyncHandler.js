// if we're creating an asyncHandler then while creating a controller we don't have to 
// use try/catch block for every other api routes
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
