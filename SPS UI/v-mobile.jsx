// 手機版三個變化（針對 390px 設計）
const { useState: useMS } = React;

// ========== M1: 經典 ERP 手機卡片版 ==========
const M1 = () => {
  const [q, setQ] = useMS('');
  const [sel, setSel] = useMS(null);
  const [stocks, setStocks] = useMS(() => Object.fromEntries(SPARE_PARTS.map(p => [p.id, p.stock])));
  const [pending, setPending] = useMS({});
  const [showFilter, setShowFilter] = useMS(false);

  const filtered = SPARE_PARTS.filter(p =>
    !q || (p.name + p.nameZh + p.model + p.brand).toLowerCase().includes(q.toLowerCase())
  );
  const lowCnt = SPARE_PARTS.filter(p => stocks[p.id] < p.minStock).length;

  return (
    <div style={{ fontFamily: FONT_STACK, background: TOKENS.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 頂部 App Bar */}
      <header style={{ background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.line}`, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: TOKENS.ink2 }}><Icon name="menu" size={20}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>備品庫存</div>
          <div style={{ fontSize: 10, color: TOKENS.muted }}>SPS · ERP</div>
        </div>
        <button style={{ position: 'relative', background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: TOKENS.ink2 }}>
          <Icon name="bell" size={18}/>
          {lowCnt > 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: TOKENS.danger, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 999, padding: '0 5px', minWidth: 14, textAlign: 'center' }}>{lowCnt}</span>}
        </button>
      </header>

      {/* 搜尋列 */}
      <div style={{ padding: 12, background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', gap: 8 }}>
        <Input value={q} onChange={setQ} placeholder="搜尋…" icon="search" style={{ flex: 1 }}/>
        <Button icon="filter" onClick={() => setShowFilter(!showFilter)}>篩選</Button>
      </div>

      {/* 通知 */}
      {lowCnt > 0 && (
        <div style={{ padding: 12, paddingBottom: 0 }}>
          <Notice kind="danger" icon="bell">{lowCnt} 項備品需採購</Notice>
        </div>
      )}

      {/* 卡片列表 */}
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {filtered.map(p => {
          const cur = stocks[p.id];
          const delta = pending[p.id] || 0;
          const c = STATUS_COLORS[p.status];
          return (
            <div key={p.id} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: 3, background: c.dot }}/>
              <div style={{ padding: 12 }} onClick={() => setSel(p)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: TOKENS.muted }}>{p.category} · {p.id}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: TOKENS.ink2 }}>{p.nameZh}</div>
                  </div>
                  <StatusPill status={p.status} dense/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 11, color: TOKENS.muted, marginBottom: 8 }}>
                  <div>品牌 <span style={{ color: TOKENS.ink2, fontWeight: 600 }}>{p.brand}</span></div>
                  <div>位置 <span style={{ color: TOKENS.ink2, fontWeight: 600 }}>{p.location}</span></div>
                </div>
                <StockBar stock={Math.max(0, cur + delta)} min={p.minStock} width={180}/>
              </div>
              <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: TOKENS.surfaceAlt, borderTop: `1px solid ${TOKENS.line2}` }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: TOKENS.muted }}>領用</span>
                <Stepper value={delta} onChange={v => setPending(prev => ({ ...prev, [p.id]: v }))} min={-cur} max={99} size="sm"/>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部 FAB */}
      <button style={{
        position: 'absolute', right: 16, bottom: 80, width: 52, height: 52, borderRadius: 999,
        background: TOKENS.brand, color: '#fff', border: 'none', cursor: 'pointer',
        boxShadow: '0 8px 20px #1F6E4366', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icon name="qrcode" size={22} color="#fff"/></button>

      {/* 底部 tab bar */}
      <nav style={{ background: TOKENS.surface, borderTop: `1px solid ${TOKENS.line}`, display: 'flex', padding: '6px 0' }}>
        {[
          { i: 'boxes', l: '庫存', a: true },
          { i: 'history', l: '紀錄' },
          { i: 'qrcode', l: 'QR' },
          { i: 'chart', l: '報表' },
          { i: 'user', l: '我' },
        ].map(t => (
          <button key={t.l} style={{ flex: 1, padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: t.a ? TOKENS.brand : TOKENS.muted }}>
            <Icon name={t.i} size={18}/>
            <span style={{ fontSize: 10, fontWeight: t.a ? 700 : 500 }}>{t.l}</span>
          </button>
        ))}
      </nav>

      {/* 底部 Sheet 詳情 */}
      {sel && (
        <>
          <div onClick={() => setSel(null)} style={{ position: 'absolute', inset: 0, background: '#0006', zIndex: 50 }}/>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: TOKENS.surface, borderRadius: '16px 16px 0 0', zIndex: 51, maxHeight: '85%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: TOKENS.line }}/>
            </div>
            <div style={{ padding: '4px 16px 12px', borderBottom: `1px solid ${TOKENS.line2}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <StatusPill status={sel.status} dense/>
                <span style={{ fontSize: 10, color: TOKENS.muted }}>{sel.id}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{sel.name}</div>
              <div style={{ fontSize: 12, color: TOKENS.ink2 }}>{sel.nameZh}</div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['規格描述', sel.spec],
                  ['原採購編號', sel.originPN],
                  ['國光備品編號', sel.fcmPN || '—'],
                  ['部品編號', sel.partNo],
                  ['可替代性', sel.replaceable],
                  ['共用性', sel.sharedLine],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: TOKENS.surfaceAlt, borderRadius: 6, padding: 8 }}>
                    <div style={{ fontSize: 10, color: TOKENS.muted, marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'ui-monospace, Menlo, monospace', wordBreak: 'break-all' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.brand, marginTop: 16, marginBottom: 8 }}>進出紀錄</div>
              {sel.history.length === 0 ? <div style={{ fontSize: 12, color: TOKENS.muted, padding: 12, textAlign: 'center' }}>暫無</div> :
                sel.history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${TOKENS.line2}`, fontSize: 12 }}>
                    <span style={{ fontWeight: 600 }}>{h.user}</span>
                    <span><span style={{ color: h.delta.startsWith('+') ? TOKENS.ok : TOKENS.danger, fontWeight: 700, fontFamily: 'ui-monospace, Menlo, monospace', marginRight: 8 }}>{h.delta}</span><span style={{ color: TOKENS.muted, fontFamily: 'ui-monospace, Menlo, monospace' }}>{h.date}</span></span>
                  </div>
                ))
              }
            </div>
            <div style={{ padding: 12, borderTop: `1px solid ${TOKENS.line2}`, display: 'flex', gap: 8 }}>
              <Button style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSel(null)}>關閉</Button>
              <Button variant="primary" icon="edit" style={{ flex: 1, justifyContent: 'center' }}>編輯</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
window.M1 = M1;

// ========== M2: 卡片現代化手機版（推薦） ==========
const M2 = () => {
  const [tab, setTab] = useMS('all'); // all / low / buy
  const [q, setQ] = useMS('');
  const [sel, setSel] = useMS(null);
  const [stocks, setStocks] = useMS(() => Object.fromEntries(SPARE_PARTS.map(p => [p.id, p.stock])));
  const [pending, setPending] = useMS({});

  const list = SPARE_PARTS.filter(p => {
    if (tab === 'low' && stocks[p.id] >= p.minStock) return false;
    if (tab === 'buy' && p.status !== '需採購') return false;
    if (q && !(p.name + p.nameZh + p.brand + p.model).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const lowCnt = SPARE_PARTS.filter(p => stocks[p.id] < p.minStock).length;
  const buyCnt = SPARE_PARTS.filter(p => p.status === '需採購').length;

  return (
    <div style={{ fontFamily: FONT_STACK, background: TOKENS.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 漸層頭部 */}
      <header style={{ background: `linear-gradient(180deg, ${TOKENS.brand}, ${TOKENS.brandDark})`, color: '#fff', padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>歡迎回來</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>林易賢</div>
          </div>
          <button style={{ position: 'relative', background: '#ffffff20', border: 'none', width: 36, height: 36, borderRadius: 999, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="bell" size={16} color="#fff"/>
            {lowCnt > 0 && <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 999, background: '#FFD54F' }}/>}
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="搜尋備品 / 型號 / 編號" style={{
            width: '100%', height: 40, paddingLeft: 36, paddingRight: 12,
            background: '#ffffff20', backdropFilter: 'blur(10px)', border: '1px solid #ffffff30',
            borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
          }}/>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#ffffff80' }}>
            <Icon name="search" size={16} color="#fff"/>
          </span>
        </div>
      </header>

      {/* KPI mini cards */}
      <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { label: '總項數', val: SPARE_PARTS.length, c: TOKENS.brand, i: 'boxes' },
          { label: '低庫存', val: lowCnt, c: TOKENS.warn, i: 'bell' },
          { label: '需採購', val: buyCnt, c: TOKENS.danger, i: 'package' },
        ].map(k => (
          <div key={k.label} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 10, textAlign: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: k.c + '15', color: k.c, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
              <Icon name={k.i} size={14}/>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{k.val}</div>
            <div style={{ fontSize: 10, color: TOKENS.muted }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[
          { k: 'all', l: '全部' },
          { k: 'low', l: '低庫存' },
          { k: 'buy', l: '需採購' },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            padding: '6px 14px', borderRadius: 999, border: '1px solid',
            borderColor: tab === t.k ? TOKENS.brand : TOKENS.line,
            background: tab === t.k ? TOKENS.brand : TOKENS.surface,
            color: tab === t.k ? '#fff' : TOKENS.ink2,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{t.l}</button>
        ))}
      </div>

      {/* 卡片列 */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1, paddingBottom: 80 }}>
        {list.map(p => {
          const cur = stocks[p.id];
          const delta = pending[p.id] || 0;
          const c = STATUS_COLORS[p.status];
          return (
            <div key={p.id} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 12, overflow: 'hidden' }}>
              <div onClick={() => setSel(p)} style={{ padding: 12, display: 'flex', gap: 10 }}>
                <div style={{ width: 4, borderRadius: 2, background: c.dot, alignSelf: 'stretch' }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, color: TOKENS.muted }}>{p.category}</span>
                    <StatusPill status={p.status} dense/>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: TOKENS.ink2, marginBottom: 6 }}>{p.nameZh} · {p.brand}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <StockBar stock={Math.max(0, cur + delta)} min={p.minStock} width={120}/>
                    <span style={{ background: TOKENS.line2, padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{p.location}</span>
                  </div>
                </div>
              </div>
              <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: TOKENS.surfaceAlt, borderTop: `1px solid ${TOKENS.line2}` }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: TOKENS.muted }}>NT$ {p.unitPrice.toLocaleString()}</span>
                <Stepper value={delta} onChange={v => setPending(prev => ({ ...prev, [p.id]: v }))} min={-cur} max={99} size="sm"/>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部 tab bar with center QR */}
      <nav style={{ background: TOKENS.surface, borderTop: `1px solid ${TOKENS.line}`, display: 'flex', padding: '6px 0', alignItems: 'center', position: 'relative' }}>
        {[
          { i: 'boxes', l: '庫存', a: true },
          { i: 'history', l: '紀錄' },
          { i: '', l: '' }, // QR placeholder
          { i: 'chart', l: '報表' },
          { i: 'user', l: '我' },
        ].map((t, idx) => (
          <button key={idx} style={{ flex: 1, padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: t.a ? TOKENS.brand : TOKENS.muted, visibility: t.l ? 'visible' : 'hidden' }}>
            <Icon name={t.i || 'boxes'} size={18}/>
            <span style={{ fontSize: 10, fontWeight: t.a ? 700 : 500 }}>{t.l}</span>
          </button>
        ))}
        <button style={{ position: 'absolute', left: '50%', top: -22, transform: 'translateX(-50%)', width: 56, height: 56, borderRadius: 999, background: TOKENS.brand, color: '#fff', border: '4px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px #1F6E4360' }}>
          <Icon name="qrcode" size={22} color="#fff"/>
        </button>
      </nav>

      {/* 底部 Sheet */}
      {sel && (
        <>
          <div onClick={() => setSel(null)} style={{ position: 'absolute', inset: 0, background: '#0006', zIndex: 50 }}/>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: TOKENS.surface, borderRadius: '16px 16px 0 0', zIndex: 51, maxHeight: '88%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: TOKENS.line }}/>
            </div>
            <div style={{ padding: '4px 16px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <StatusPill status={sel.status} dense/>
                <span style={{ fontSize: 10, color: TOKENS.muted }}>{sel.id} · {sel.category}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{sel.name}</div>
              <div style={{ fontSize: 12, color: TOKENS.ink2 }}>{sel.nameZh}</div>
              <div style={{ marginTop: 12, padding: 12, background: TOKENS.brandLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 10, color: TOKENS.brandDark, fontWeight: 600 }}>目前庫存</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: TOKENS.brandDark, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{stocks[sel.id]}<span style={{ fontSize: 11, color: TOKENS.muted, fontWeight: 500 }}> / 最低 {sel.minStock}</span></div>
                </div>
                <Stepper value={pending[sel.id] || 0} onChange={v => setPending(prev => ({ ...prev, [sel.id]: v }))} min={-stocks[sel.id]} max={99} size="md"/>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.muted, letterSpacing: 0.5, marginBottom: 8 }}>規格資訊</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[
                  ['規格描述', sel.spec], ['原採購編號', sel.originPN],
                  ['國光備品編號', sel.fcmPN || '—'], ['部品編號', sel.partNo],
                  ['可替代性', sel.replaceable], ['共用性', sel.sharedLine],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: TOKENS.surfaceAlt, borderRadius: 6, padding: 8, border: `1px solid ${TOKENS.line2}` }}>
                    <div style={{ fontSize: 10, color: TOKENS.muted, marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'ui-monospace, Menlo, monospace', wordBreak: 'break-all' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.muted, letterSpacing: 0.5, marginBottom: 8 }}>進出紀錄</div>
              {sel.history.length === 0 ? <div style={{ fontSize: 12, color: TOKENS.muted, padding: 12, textAlign: 'center' }}>暫無紀錄</div> :
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {sel.history.map((h, i) => {
                    const isIn = h.delta.startsWith('+');
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, background: TOKENS.surfaceAlt, borderRadius: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 999, background: isIn ? TOKENS.okBg : TOKENS.dangerBg, color: isIn ? TOKENS.ok : TOKENS.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={isIn ? 'arrowDown' : 'arrowUp'} size={12}/>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{h.user} <span style={{ color: isIn ? TOKENS.ok : TOKENS.danger, fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700 }}>{h.delta}</span></div>
                          <div style={{ fontSize: 10, color: TOKENS.muted, fontFamily: 'ui-monospace, Menlo, monospace' }}>{h.date}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              }
            </div>
            <div style={{ padding: 12, borderTop: `1px solid ${TOKENS.line2}`, display: 'flex', gap: 8 }}>
              <Button style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSel(null)}>關閉</Button>
              <Button variant="primary" icon="save" style={{ flex: 1, justifyContent: 'center' }}>儲存</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
window.M2 = M2;

// ========== M3: Dashboard 駕駛艙手機版 ==========
const M3 = () => {
  const [stocks] = useMS(() => Object.fromEntries(SPARE_PARTS.map(p => [p.id, p.stock])));
  const lowStock = SPARE_PARTS.filter(p => stocks[p.id] < p.minStock);
  const totalValue = SPARE_PARTS.reduce((s, p) => s + stocks[p.id] * p.unitPrice, 0);
  const catData = CATEGORIES.slice(1).map(c => ({
    cat: c, count: SPARE_PARTS.filter(p => p.category === c).length,
  }));
  const maxCat = Math.max(...catData.map(c => c.count));
  const recent = SPARE_PARTS.flatMap(p => p.history.map(h => ({ ...h, name: p.name }))).slice(-4).reverse();

  return (
    <div style={{ fontFamily: FONT_STACK, background: TOKENS.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: `linear-gradient(180deg, ${TOKENS.brand}, ${TOKENS.brandDark})`, color: '#fff', padding: '14px 16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>備品駕駛艙</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>SPS Dashboard</div>
          </div>
          <button style={{ background: '#ffffff20', border: 'none', width: 34, height: 34, borderRadius: 999, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="refresh" size={14} color="#fff"/>
          </button>
        </div>
        <div style={{ background: '#ffffff15', backdropFilter: 'blur(10px)', borderRadius: 12, padding: 12, border: '1px solid #ffffff20' }}>
          <div style={{ fontSize: 10, opacity: 0.85 }}>總庫存價值</div>
          <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>NT$ {(totalValue / 1000).toFixed(1)}<span style={{ fontSize: 13, fontWeight: 500, marginLeft: 4, opacity: 0.7 }}>K</span></div>
          <div style={{ fontSize: 10, opacity: 0.75, marginTop: 4 }}>{SPARE_PARTS.length} 項備品 · 最後更新 14:32</div>
        </div>
      </header>

      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 警示卡 */}
        <Card padding={0}>
          <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${TOKENS.line2}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: TOKENS.dangerBg, color: TOKENS.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="bell" size={14}/></div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>低庫存警示</div>
                <div style={{ fontSize: 10, color: TOKENS.muted }}>{lowStock.length} 項需注意</div>
              </div>
            </div>
            <button style={{ background: 'none', border: 'none', color: TOKENS.brand, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>查看全部 →</button>
          </div>
          {lowStock.slice(0, 3).map((p, i) => (
            <div key={p.id} style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderTop: i > 0 ? `1px solid ${TOKENS.line2}` : 'none' }}>
              <div style={{ width: 4, height: 28, borderRadius: 2, background: p.status === '需採購' ? TOKENS.danger : TOKENS.warn }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontSize: 10, color: TOKENS.muted }}>{p.location} · {p.brand}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: stocks[p.id] === 0 ? TOKENS.danger : TOKENS.warn, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{stocks[p.id]}</div>
                <div style={{ fontSize: 9, color: TOKENS.muted, fontVariantNumeric: 'tabular-nums' }}>min {p.minStock}</div>
              </div>
            </div>
          ))}
        </Card>

        {/* 類別分布 */}
        <Card title="類別分布" padding={14}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {catData.map(c => (
              <div key={c.cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600 }}>{c.cat}</span>
                  <span style={{ color: TOKENS.muted, fontVariantNumeric: 'tabular-nums' }}>{c.count} 項</span>
                </div>
                <div style={{ height: 6, background: TOKENS.line2, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(c.count / maxCat) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${TOKENS.brandAccent}, ${TOKENS.brand})`, borderRadius: 3 }}/>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 近期領用 */}
        <Card title="近期領用" padding={0}>
          {recent.map((h, i) => {
            const isIn = h.delta.startsWith('+');
            return (
              <div key={i} style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderTop: i > 0 ? `1px solid ${TOKENS.line2}` : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: isIn ? TOKENS.okBg : TOKENS.dangerBg, color: isIn ? TOKENS.ok : TOKENS.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: 'ui-monospace, Menlo, monospace' }}>{h.delta}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                  <div style={{ fontSize: 10, color: TOKENS.muted }}>{h.user} · {h.date}</div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* 底部 tab bar */}
      <nav style={{ background: TOKENS.surface, borderTop: `1px solid ${TOKENS.line}`, display: 'flex', padding: '6px 0' }}>
        {[
          { i: 'dashboard', l: '駕駛艙', a: true },
          { i: 'boxes', l: '庫存' },
          { i: 'qrcode', l: 'QR' },
          { i: 'chart', l: '報表' },
          { i: 'user', l: '我' },
        ].map(t => (
          <button key={t.l} style={{ flex: 1, padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: t.a ? TOKENS.brand : TOKENS.muted }}>
            <Icon name={t.i} size={18}/>
            <span style={{ fontSize: 10, fontWeight: t.a ? 700 : 500 }}>{t.l}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
window.M3 = M3;
