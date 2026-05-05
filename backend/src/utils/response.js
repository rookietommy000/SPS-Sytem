export const ok = (res, data, message = '成功') =>
  res.json({ success: true, data, message })

export const created = (res, data, message = '建立成功') =>
  res.status(201).json({ success: true, data, message })

export const paginated = (res, data, total, page, limit) =>
  res.json({ success: true, data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } })

export const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message })
