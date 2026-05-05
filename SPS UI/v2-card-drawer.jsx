// Variation 2: 卡片式現代化 + Side Drawer + 側邊欄版型
const V2 = () => {
  const [line, setLine] = useState('全部');
  const [equip, setEquip] = useState('全部');
  const [cat, setCat] = useState('全部');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [stocks, setStocks] = useState(() => Object.fromEntries(SPARE_PARTS.map(p => [p.id, p.stock])));
  const [pending, setPending] = useState({});
  const [toast, setToast] = useState('');
  const [view, setView] = useState('card'); // card / list

  const filtered = SPARE_PARTS.filter(p => {
    if (line !== '全部' && p.line !== line) return false;
    if (equip !== '全部' && p.equipment !== equip) return false;
    if (cat !== '全部' && p.category !== cat) return false;
    if (statusFilter !== '全部' && p.status !== statusFilter) return false;
    if (q && !(p.name + p.nameZh + p.model + p.brand + p.id).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const lowStock = SPARE_PARTS.filter(p => stocks[p.id] < p.minStock);

  const adjust = (id, v) => setPending(prev => ({ ...prev, [id]: v }));
  const save = () => {
    setStocks(prev => {
      const next = { ...prev };
      Object.entries(pending).forEach(([id, d]) => { next[id] = Math.max(0, (next[id] || 0) + d); });
      return next;
    });
    setPending({});
    setToast('已儲存 ' + Object.keys(pending).length + ' 項變更');
    setTimeout(() => setToast(''), 2200);
  };

  const navItems = [
    { icon: 'dashboard', label: '儀表板' },
    { icon: 'boxes', label: '備品庫存', active: true, badge: lowStock.length },
    { icon: 'history', label: '進出紀錄' },
    { icon: 'package', label: '採購管理' },
    { icon: 'chart', label: '統計報表' },
    { icon: 'qrcode', label: 'QR 領用' },
    { icon: 'settings', label: '系統設定' },
  ];

  return (
    <div style={{ fontFamily: FONT_STACK, color: TOKENS.ink, background: TOKENS.bg, minHeight: '100%', display: 'flex' }}>
      {/* 左側欄 */}
      <aside style={{
        width: 220, background: '#0E2A1E', color: '#D7E5DD', display: 'flex', flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #1A3A2A' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: TOKENS.brandAccent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="boxes" size={18} color="#0E2A1E"/>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>SPS</div>
            <div style={{ fontSize: 10, color: '#7AA088' }}>備品管理系統</div>
          </div>
        </div>
        <nav style={{ padding: 10, flex: 1 }}>
          {navItems.map(n => (
            <a key={n.label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 8, marginBottom: 2,
              background: n.active ? TOKENS.brandAccent : 'transparent',
              color: n.active ? '#0E2A1E' : '#B5CDC0',
              fontSize: 13, fontWeight: n.active ? 700 : 500, cursor: 'pointer',
              position: 'relative',
            }}>
              <Icon name={n.icon} size={16}/>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.badge > 0 && (
                <span style={{
                  background: n.active ? '#0E2A1E' : TOKENS.danger,
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  borderRadius: 999, padding: '1px 6px', minWidth: 18, textAlign: 'center',
                }}>{n.badge}</span>
              )}
            </a>
          ))}
        </nav>
        <div style={{ padding: 14, borderTop: '1px solid #1A3A2A', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: TOKENS.brandAccent, color: '#0E2A1E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>林</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>林易賢</div>
            <div style={{ fontSize: 10, color: '#7AA088' }}>產線維護員</div>
          </div>
        </div>
      </aside>

      {/* 主內容 */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 24px', background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>備品庫存</h1>
            <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 2 }}>共 {SPARE_PARTS.length} 項備品 · {lowStock.length} 項低於庫存</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon="qrcode">QR 領用</Button>
            <Button icon="export">匯出</Button>
            <Button icon="plus" variant="primary">新增備品</Button>
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ padding: '16px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: '總備品種類', val: SPARE_PARTS.length, sub: '+2 本月', color: TOKENS.brand, icon: 'boxes' },
            { label: '低庫存項目', val: lowStock.length, sub: '需注意', color: TOKENS.warn, icon: 'bell' },
            { label: '需採購項目', val: SPARE_PARTS.filter(p => p.status === '需採購').length, sub: '請儘速處理', color: TOKENS.danger, icon: 'package' },
            { label: '本月領用次數', val: 23, sub: '+5 vs 上月', color: TOKENS.info, icon: 'history' },
          ].map(k => (
            <div key={k.label} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: k.color + '15', color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={k.icon} size={20}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: TOKENS.muted, fontWeight: 500 }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{k.val}</div>
                <div style={{ fontSize: 11, color: TOKENS.muted }}>{k.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 篩選列 */}
        <div style={{ padding: '16px 24px 12px' }}>
          <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <Input value={q} onChange={setQ} placeholder="搜尋…" icon="search" width={240}/>
            <Select label="產線" value={line} options={LINES} onChange={setLine}/>
            <Select label="設備" value={equip} options={EQUIPMENT} onChange={setEquip}/>
            <Select label="類別" value={cat} options={CATEGORIES} onChange={setCat}/>
            <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', background: TOKENS.line2, borderRadius: 6, padding: 3 }}>
              {['全部', '正常', '低庫存', '需採購'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '6px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
                  background: statusFilter === s ? TOKENS.surface : 'transparent',
                  color: statusFilter === s ? TOKENS.ink : TOKENS.muted,
                  fontSize: 12, fontWeight: 600,
                  boxShadow: statusFilter === s ? '0 1px 3px #0001' : 'none',
                }}>{s}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4, background: TOKENS.line2, borderRadius: 6, padding: 3 }}>
              <button onClick={() => setView('card')} style={{ width: 30, height: 26, borderRadius: 4, border: 'none', cursor: 'pointer', background: view === 'card' ? TOKENS.surface : 'transparent', color: view === 'card' ? TOKENS.brand : TOKENS.muted, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="grid" size={14}/>
              </button>
              <button onClick={() => setView('list')} style={{ width: 30, height: 26, borderRadius: 4, border: 'none', cursor: 'pointer', background: view === 'list' ? TOKENS.surface : 'transparent', color: view === 'list' ? TOKENS.brand : TOKENS.muted, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="list" size={14}/>
              </button>
            </div>
          </div>
        </div>

        {/* 卡片網格 */}
        <div style={{ padding: '0 24px 24px', flex: 1 }}>
          {view === 'card' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
              {filtered.map(p => {
                const curStock = stocks[p.id];
                const delta = pending[p.id] || 0;
                const previewStock = Math.max(0, curStock + delta);
                const c = STATUS_COLORS[p.status];
                return (
                  <div key={p.id} style={{
                    background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10,
                    overflow: 'hidden', cursor: 'pointer', transition: 'transform 120ms, box-shadow 120ms',
                    display: 'flex', flexDirection: 'column',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px #0F1B1614'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    {/* 狀態條 */}
                    <div style={{ height: 4, background: c.dot }}/>
                    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }} onClick={() => setSel(p)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 11, color: TOKENS.muted, marginBottom: 2 }}>{p.category} · {p.id}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, marginBottom: 2 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: TOKENS.ink2 }}>{p.nameZh}</div>
                        </div>
                        <StatusPill status={p.status} dense/>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11, color: TOKENS.muted }}>
                        <div><span style={{ color: TOKENS.muted }}>品牌</span> <span style={{ color: TOKENS.ink2, fontWeight: 600, fontFamily: 'ui-monospace, Menlo, monospace' }}>{p.brand}</span></div>
                        <div><span style={{ color: TOKENS.muted }}>位置</span> <span style={{ color: TOKENS.ink2, fontWeight: 600 }}>{p.location}</span></div>
                        <div style={{ gridColumn: '1 / -1' }}><span style={{ color: TOKENS.muted }}>型號</span> <span style={{ color: TOKENS.ink2, fontWeight: 500, fontFamily: 'ui-monospace, Menlo, monospace' }}>{p.model}</span></div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: `1px solid ${TOKENS.line2}`, paddingTop: 10, marginTop: 'auto' }}>
                        <div>
                          <div style={{ fontSize: 10, color: TOKENS.muted, marginBottom: 2 }}>庫存</div>
                          <StockBar stock={previewStock} min={p.minStock} width={70}/>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 10, color: TOKENS.muted }}>單價</div>
                          <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>NT$ {p.unitPrice.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    {/* 領用列 */}
                    <div onClick={e => e.stopPropagation()} style={{ padding: '10px 14px', background: TOKENS.surfaceAlt, borderTop: `1px solid ${TOKENS.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: TOKENS.muted, fontWeight: 600 }}>領用數量</span>
                      <Stepper value={delta} onChange={v => adjust(p.id, v)} min={-curStock} max={99} size="sm"/>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, overflow: 'hidden' }}>
              {filtered.map((p, i) => {
                const curStock = stocks[p.id];
                const delta = pending[p.id] || 0;
                return (
                  <div key={p.id} onClick={() => setSel(p)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderBottom: i < filtered.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', cursor: 'pointer' }}>
                    <StatusPill status={p.status} dense/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name} <span style={{ color: TOKENS.muted, fontWeight: 500, fontSize: 12 }}>· {p.nameZh}</span></div>
                      <div style={{ fontSize: 12, color: TOKENS.muted, fontFamily: 'ui-monospace, Menlo, monospace' }}>{p.brand} {p.model} · {p.location}</div>
                    </div>
                    <StockBar stock={Math.max(0, curStock + delta)} min={p.minStock}/>
                    <div style={{ width: 100, textAlign: 'right', fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>NT$ {p.unitPrice.toLocaleString()}</div>
                    <div onClick={e => e.stopPropagation()}>
                      <Stepper value={delta} onChange={v => adjust(p.id, v)} min={-curStock} max={99} size="sm"/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 浮動儲存 */}
        {Object.keys(pending).length > 0 && (
          <div style={{ position: 'sticky', bottom: 16, padding: '0 24px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: TOKENS.ink, color: '#fff', padding: '10px 14px 10px 18px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 12px 28px #0F1B1640' }}>
              <span style={{ fontSize: 13 }}>有 <strong>{Object.keys(pending).length}</strong> 項待儲存變更</span>
              <Button variant="primary" icon="save" onClick={save} size="sm">儲存</Button>
              <button onClick={() => setPending({})} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6, fontSize: 12 }}>取消</button>
            </div>
          </div>
        )}
      </main>

      {/* Side Drawer */}
      {sel && (
        <>
          <div onClick={() => setSel(null)} style={{ position: 'absolute', inset: 0, background: '#0F1B1655', zIndex: 50 }}/>
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(520px, 100%)',
            background: TOKENS.surface, zIndex: 51, display: 'flex', flexDirection: 'column',
            boxShadow: '-12px 0 30px #0F1B1620',
          }}>
            <div style={{ padding: '20px 22px', borderBottom: `1px solid ${TOKENS.line2}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <StatusPill status={sel.status}/>
                  <span style={{ fontSize: 11, color: TOKENS.muted }}>{sel.id} · {sel.category}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{sel.name}</h2>
                <div style={{ fontSize: 13, color: TOKENS.ink2, marginTop: 2 }}>{sel.nameZh}</div>
              </div>
              <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: TOKENS.muted }}>
                <Icon name="close" size={18}/>
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 22 }}>
              <div style={{ background: TOKENS.brandLight, border: `1px solid ${TOKENS.brand}33`, borderRadius: 10, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, color: TOKENS.brandDark, fontWeight: 600, marginBottom: 4 }}>目前庫存</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: TOKENS.brandDark, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{stocks[sel.id]} <span style={{ fontSize: 13, color: TOKENS.muted, fontWeight: 500 }}>/ 最低 {sel.minStock}</span></div>
                </div>
                <Stepper value={pending[sel.id] || 0} onChange={v => adjust(sel.id, v)} min={-stocks[sel.id]} max={99} size="lg"/>
              </div>
              <div style={{ fontSize: 12, color: TOKENS.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>規格資訊</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
                {[
                  ['規格描述', sel.spec],
                  ['原始備品採購編號', sel.originPN],
                  ['國光備品編號', sel.fcmPN || '—'],
                  ['部品編號', sel.partNo],
                  ['可替代性', sel.replaceable],
                  ['共用性', sel.sharedLine],
                  ['品牌', sel.brand],
                  ['型號', sel.model],
                  ['供應商', sel.supplier],
                  ['位置', sel.location],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, color: TOKENS.muted, fontWeight: 500 }}>{k}</div>
                    <div style={{ fontSize: 13, color: TOKENS.ink, fontWeight: 500, fontFamily: 'ui-monospace, Menlo, monospace', marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: TOKENS.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="history" size={12}/> 進出紀錄
              </div>
              {sel.history.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: TOKENS.muted, fontSize: 13 }}>暫無紀錄</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {sel.history.map((h, i) => {
                    const isIn = h.delta.startsWith('+');
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: TOKENS.surfaceAlt, borderRadius: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 999, background: isIn ? TOKENS.okBg : TOKENS.dangerBg, color: isIn ? TOKENS.ok : TOKENS.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={isIn ? 'arrowDown' : 'arrowUp'} size={14}/>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{h.user} <span style={{ fontWeight: 700, fontFamily: 'ui-monospace, Menlo, monospace', color: isIn ? TOKENS.ok : TOKENS.danger }}>{h.delta}</span></div>
                          <div style={{ fontSize: 11, color: TOKENS.muted, fontFamily: 'ui-monospace, Menlo, monospace' }}>{h.date}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ padding: '14px 22px', borderTop: `1px solid ${TOKENS.line2}`, background: TOKENS.surfaceAlt, display: 'flex', gap: 8 }}>
              <Button icon="edit" style={{ flex: 1, justifyContent: 'center' }}>編輯</Button>
              <Button icon="trash" variant="danger" style={{ flex: 1, justifyContent: 'center' }}>刪除</Button>
              <Button icon="save" variant="primary" onClick={save} style={{ flex: 1, justifyContent: 'center' }}>儲存</Button>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 60 }}>
          <Notice kind="ok" icon="check">{toast}</Notice>
        </div>
      )}
    </div>
  );
};
window.V2 = V2;
