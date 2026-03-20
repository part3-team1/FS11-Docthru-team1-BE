export const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse(req.body);
    req.body = validatedData;

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((error) => ({
        field: error.path.join('.'),
        message: error.message,
      }));

      return res.status(400).json({
        success: false,
        message: '입력값이 유효하지 않습니다.',
        errors: errorMessages,
      });
    }

    next(error);
  }
};
