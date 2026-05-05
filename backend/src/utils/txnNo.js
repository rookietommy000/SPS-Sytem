// 產生格式化單號：前綴 + 日期 + 序號  例：TXN-20260504-001
export const genNo = (prefix) => {
  const d   = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
  const seq = String(Math.floor(Math.random() * 900) + 100) // 暫用隨機，上線後改序列
  return `${prefix}-${ymd}-${seq}`
}
