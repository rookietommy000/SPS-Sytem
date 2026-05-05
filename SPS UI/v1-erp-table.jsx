// Variation 1: 經典 ERP 表格 + Modal 詳情 + 頂部選單版
const V1 = () => {
  const [line, setLine] = useState('全部');
  const [equip, setEquip] = useState('全部');
  const [cat, setCat] = useState('全部');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [stocks, setStocks] = useState(() => Object.fromEntries(SPARE_PARTS.map(p => [p.id, p.stock])));
  const [pending, setPending] = useState({}); // 領用變動
  const [toast, setToast] = useState('');
  const [showQR, setShowQR] = useState(false);

  const filtered = SPARE_PARTS.filter(p => {
    if (line !== '全部' && p.line !== line) return false;
    if (equip !== '全部' && p.equipment !== equip) return false;
    if (cat !== '全部' && p.category !== cat) return false;
    if (q && !(p.name + p.nameZh + p.model + p.brand + p.id).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const lowStockCount = SPARE_PARTS.filter(p => stocks[p.id] < p.minStock).length;

  const adjust = (id, delta) => {
    setPending(prev => ({ ...prev, [id]: (prev[id] || 0) + delta }));
  };

  const save = () => {
    setStocks(prev => {
      const next = { ...prev };
      Object.entries(pending).forEach(([id, d]) => { next[id] = Math.max(0, (next[id] || 0) + d); });
      return next;
    });
    setPending({});
    setToast('已儲存變更');
    setTimeout(() => setToast(''), 2200);
  };

  const headerStyle = {
    padding: '10px 12px', background: TOKENS.brandLight, color: TOKENS.brandDark,
    fontSize: 12, fontWeight: 700, letterSpacing: 0.4,
    borderBottom: `2px solid ${TOKENS.brand}`, textAlign: 'left', whiteSpace: 'nowrap',
  };
  const cellStyle = (rowH) => ({
    padding: `${rowH}px 12px`, borderBottom: `1px solid ${TOKENS.line2}`,
    fontSize: 13, color: TOKENS.ink, verticalAlign: 'middle',
  });

  return (
    <div style={{ fontFamily: FONT_STACK, color: TOKENS.ink, background: TOKENS.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 頂部 App Bar */}
      <header style={{
        background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.line}`,
        padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: TOKENS.brand,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <Icon name="boxes" size={18} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1 }}>SPS · 備品管理系統</div>
            <div style={{ fontSize: 11, color: TOKENS.muted }}>Spare Parts System / ERP</div>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 4, marginLeft: 24 }}>
          {['庫存總覽', '領用紀錄', '採購', '報表', '設定'].map((t, i) => (
            <a key={t} style={{
              padding: '0 14px', height: 56, display: 'flex', alignItems: 'center',
              fontSize: 13, fontWeight: 600, color: i === 0 ? TOKENS.brand : TOKENS.ink2,
              borderBottom: i === 0 ? `2px solid ${TOKENS.brand}` : '2px solid transparent',
              cursor: 'pointer',
            }}>{t}</a>
          ))}
        </nav>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.ink2 }}>
            <Icon name="bell" size={18}/>
            {lowStockCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4, background: TOKENS.danger, color: '#fff',
                fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '1px 5px', minWidth: 16, textAlign: 'center',
              }}>{lowStockCount}</span>
            )}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: TOKENS.brandLight, color: TOKENS.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>林</div>
            <span style={{ color: TOKENS.ink2, fontWeight: 500 }}>林易賢</span>
          </div>
        </div>
      </header>

      {/* 麵包屑 + 頁標 */}
      <div style={{ padding: '16px 24px 0', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: TOKENS.muted, marginBottom: 4 }}>庫存管理 / 庫存總覽</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: 0.2 }}>備品庫存總覽</h1>
        </div>
        <div style={{ fontSize: 12, color: TOKENS.muted }}>最後更新：2026-05-04 14:32</div>
      </div>

      {/* 工具列 */}
      <div style={{ padding: '16px 24px 12px' }}>
        <div style={{
          background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10,
          padding: 14, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
        }}>
          <Select label="產線" value={line} options={LINES} onChange={setLine} width={110}/>
          <Select label="設備" value={equip} options={EQUIPMENT} onChange={setEquip} width={130}/>
          <Select label="類別" value={cat} options={CATEGORIES} onChange={setCat} width={130}/>
          <div style={{ width: 1, height: 24, background: TOKENS.line }}/>
          <Input value={q} onChange={setQ} placeholder="搜尋品名 / 型號 / 編號…" icon="search" width={260}/>
          <Button icon="search">搜尋</Button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button icon="qrcode" onClick={() => setShowQR(true)}>QR 領用</Button>
            <Button icon="export">匯出 Excel</Button>
            <Button icon="plus">新增備品</Button>
            <Button icon="save" variant="primary" onClick={save}>儲存 {Object.keys(pending).length > 0 && <span style={{ marginLeft: 4, background: '#fff3', borderRadius: 4, padding: '0 5px', fontSize: 11 }}>{Object.keys(pending).length}</span>}</Button>
          </div>
        </div>
      </div>

      {/* 通知列 */}
      {lowStockCount > 0 && (
        <div style={{ padding: '0 24px 12px' }}>
          <Notice kind="danger" icon="bell">
            <strong>通知：</strong>共 {lowStockCount} 項備品已低於庫存量，請儘速採購補貨
          </Notice>
        </div>
      )}

      {/* 表格 */}
      <div style={{ padding: '0 24px 24px', flex: 1 }}>
        <div style={{
          background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10,
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1280 }}>
              <thead>
                <tr>
                  <th style={headerStyle}>狀態</th>
                  <th style={headerStyle}>類別</th>
                  <th style={headerStyle}>品名</th>
                  <th style={headerStyle}>品牌</th>
                  <th style={headerStyle}>型號</th>
                  <th style={{ ...headerStyle, textAlign: 'center' }}>庫存量</th>
                  <th style={headerStyle}>供應商</th>
                  <th style={{ ...headerStyle, textAlign: 'right' }}>單價</th>
                  <th style={{ ...headerStyle, textAlign: 'right' }}>報價單</th>
                  <th style={headerStyle}>位置</th>
                  <th style={{ ...headerStyle, textAlign: 'center' }}>詳細資訊</th>
                  <th style={{ ...headerStyle, textAlign: 'center' }}>領用</th>
                  <th style={headerStyle}>人員/日期</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const curStock = stocks[p.id];
                  const delta = pending[p.id] || 0;
                  const previewStock = Math.max(0, curStock + delta);
                  return (
                    <tr key={p.id} style={{ background: i % 2 === 0 ? TOKENS.surface : TOKENS.surfaceAlt }}>
                      <td style={cellStyle(10)}><StatusPill status={p.status}/></td>
                      <td style={cellStyle(10)}><span style={{ fontSize: 12, color: TOKENS.ink2 }}>{p.category}</span></td>
                      <td style={cellStyle(10)}>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: TOKENS.muted }}>{p.nameZh}</div>
                      </td>
                      <td style={cellStyle(10)}><span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, fontWeight: 600 }}>{p.brand}</span></td>
                      <td style={cellStyle(10)}><span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12 }}>{p.model}</span></td>
                      <td style={{ ...cellStyle(10), textAlign: 'center' }}>
                        <StockBar stock={previewStock} min={p.minStock}/>
                      </td>
                      <td style={cellStyle(10)}>{p.supplier || <span style={{ color: TOKENS.muted }}>—</span>}</td>
                      <td style={{ ...cellStyle(10), textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>NT$ {p.unitPrice.toLocaleString()}</td>
                      <td style={{ ...cellStyle(10), textAlign: 'right' }}>
                        {p.quotePrice ? <span style={{ color: TOKENS.danger, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>NT$ {p.quotePrice.toLocaleString()}</span> : <span style={{ color: TOKENS.muted }}>—</span>}
                      </td>
                      <td style={cellStyle(10)}>
                        <span style={{ background: TOKENS.line2, padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{p.location}</span>
                      </td>
                      <td style={{ ...cellStyle(10), textAlign: 'center' }}>
                        <button onClick={() => setSel(p)} style={{
                          background: 'none', border: `1px solid ${TOKENS.line}`, borderRadius: 6,
                          padding: '4px 10px', fontSize: 12, color: TOKENS.brand, cursor: 'pointer', fontWeight: 600,
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}>
                          <Icon name="info" size={12}/>查看
                        </button>
                      </td>
                      <td style={{ ...cellStyle(10), textAlign: 'center' }}>
                        <Stepper value={delta} onChange={v => setPending(prev => ({ ...prev, [p.id]: v }))} min={-curStock} max={99} size="sm"/>
                      </td>
                      <td style={cellStyle(10)}>
                        {p.user ? (
                          <div style={{ display: 'inline-block', padding: '4px 10px', border: `1px solid ${TOKENS.line}`, borderRadius: 6, background: TOKENS.surface, fontSize: 12 }}>
                            <div style={{ fontWeight: 600 }}>{p.user}</div>
                            <div style={{ color: TOKENS.muted, fontFamily: 'ui-monospace, Menlo, monospace' }}>{p.userDate}</div>
                          </div>
                        ) : <span style={{ color: TOKENS.muted, fontSize: 12 }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* 表底 */}
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${TOKENS.line2}`, background: TOKENS.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: TOKENS.muted }}>
            <span>共 {filtered.length} 項，已選 0 項</span>
            <span>第 1 / 1 頁</span>
          </div>
        </div>
      </div>

      {/* Modal: 詳細資訊 */}
      {sel && (
        <div onClick={() => setSel(null)} style={{
          position: 'absolute', inset: 0, background: '#0F1B1666', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: TOKENS.surface, borderRadius: 12, width: 'min(820px, 100%)', maxHeight: '90%', overflow: 'auto',
            boxShadow: '0 20px 60px #0F1B1640',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${TOKENS.line2}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: TOKENS.muted, marginBottom: 4 }}>{sel.category} · {sel.id}</div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{sel.name}</h2>
                <div style={{ fontSize: 14, color: TOKENS.ink2, marginTop: 2 }}>{sel.nameZh}</div>
              </div>
              <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: TOKENS.muted }}>
                <Icon name="close" size={18}/>
              </button>
            </div>
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {[
                ['規格描述', sel.spec],
                ['原始備品採購編號', sel.originPN],
                ['國光備品編號', sel.fcmPN || '—'],
                ['部品編號', sel.partNo],
                ['可替代性', sel.replaceable],
                ['共用性', sel.sharedLine],
                ['位置', sel.location],
                ['品牌 / 型號', `${sel.brand} ${sel.model}`],
              ].map(([k, v]) => (
                <div key={k} style={{ background: TOKENS.surfaceAlt, border: `1px solid ${TOKENS.line2}`, borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, color: TOKENS.muted, marginBottom: 4, fontWeight: 600, letterSpacing: 0.3 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: TOKENS.ink, fontFamily: 'ui-monospace, Menlo, monospace' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.brand, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="history" size={14}/> 進出紀錄
              </div>
              <div style={{ border: `1px solid ${TOKENS.line2}`, borderRadius: 8, overflow: 'hidden' }}>
                {sel.history.length === 0 ? (
                  <div style={{ padding: 14, textAlign: 'center', color: TOKENS.muted, fontSize: 13 }}>暫無紀錄</div>
                ) : sel.history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: i % 2 ? TOKENS.surfaceAlt : TOKENS.surface, borderBottom: i < sel.history.length - 1 ? `1px solid ${TOKENS.line2}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: h.delta.startsWith('+') ? TOKENS.ok : TOKENS.danger, fontWeight: 700, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13 }}>{h.delta}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{h.user}</span>
                    </div>
                    <span style={{ fontSize: 12, color: TOKENS.muted, fontFamily: 'ui-monospace, Menlo, monospace' }}>{h.date}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: `1px solid ${TOKENS.line2}`, background: TOKENS.surfaceAlt, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button icon="edit">編輯</Button>
              <Button icon="export">匯出</Button>
              <Button variant="primary" onClick={() => setSel(null)}>關閉</Button>
            </div>
          </div>
        </div>
      )}

      {/* QR 掃描模擬 */}
      {showQR && (
        <div onClick={() => setShowQR(false)} style={{ position: 'absolute', inset: 0, background: '#0F1B1666', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: TOKENS.surface, borderRadius: 12, padding: 28, width: 320, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>QR Code 掃描領用</div>
            <div style={{ width: 200, height: 200, margin: '0 auto', background: '#000', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 20, background: 'repeating-conic-gradient(#fff 0% 25%, #000 0% 50%) 0 / 12px 12px' }}/>
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 40%, ${TOKENS.brandAccent}AA 50%, transparent 60%)`, animation: 'scan 2s linear infinite' }}/>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: TOKENS.muted }}>請將備品 QR Code 對準框內</div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Button onClick={() => setShowQR(false)}>取消</Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 60 }}>
          <Notice kind="ok" icon="check">{toast}</Notice>
        </div>
      )}
    </div>
  );
};
window.V1 = V1;
