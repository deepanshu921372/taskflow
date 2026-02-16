// helper to keep response format consistent
const send = (res, status, data) => res.status(status).json({ success: true, data });

const sendPaginated = (res, data, { page, limit, total }) => {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

module.exports = { send, sendPaginated };
