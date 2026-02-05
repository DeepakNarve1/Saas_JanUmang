const AppError = require("../utils/AppError");

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      const message = error.details.map((i) => i.message).join(", ");
      return next(new AppError(message, 400));
    }

    next();
  };
};

module.exports = validate;
