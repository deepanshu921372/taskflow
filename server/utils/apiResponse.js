class ApiResponse {
  static success(res, data, statusCode = 200, pagination = null) {
    const response = {
      success: true,
      data
    };

    if (pagination) {
      response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
  }

  static error(res, message, statusCode = 500, code = 'SERVER_ERROR', details = null) {
    const response = {
      success: false,
      error: {
        message,
        code
      }
    };

    if (details) {
      response.error.details = details;
    }

    return res.status(statusCode).json(response);
  }

  static created(res, data) {
    return this.success(res, data, 201);
  }

  static noContent(res) {
    return res.status(204).send();
  }

  static paginated(res, data, page, limit, total) {
    return this.success(res, data, 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    });
  }
}

module.exports = ApiResponse;
