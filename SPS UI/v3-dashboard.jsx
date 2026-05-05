// Variation 3: Dashboard 駕駛艙 + 可展開行 + 內嵌詳情頁
const V3 = () => {
  const [line, setLine] = useState('全部');
  const [equip, setEquip] = useState('全部');
  const [cat, setCat] = useState('全部');
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState(new Set());
  const [detailPage, setDetailPage] = useState(null); // 獨立頁
  const [stocks, setStocks] = useState(() => Object.fromEntries(SPARE_PARTS.map(p => [p.id, p.stock])));
  const [pending, setPending] = useState({});
  const [toast, setToast] = useState('');

  const filtered = SPARE_PARTS.filter(p => {
    if (line !== '全部' && p.line !== line) return false;
    if (equip !== '全部' && p.equipment !== equip) return false;
    if (cat !== '全部' && p.category !== cat) return false;
    if (q && !(p.name + p.nameZh + p.model + p.brand + p.id).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const lowStock = SPARE_PARTS.filter(p => stocks[p.id] < p.minStock);
  const needBuy = SPARE_PARTS.filter(p => p.status === '需採購');
  const totalValue = SPARE_PARTS.reduce((s, p) => s + stocks[p.id] * p.unitPrice, 0);

  const toggleExpand = id => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  const adjust = (id, v) => setPending(prev => ({ ...prev, [id]: v }));
  const save = () => {
    setStocks(prev => {
      const next = { ...prev };
      Object.entries(pending).forEach(([id, d]) => { next[id] = Math.max(0, (next[id] || 0) + d); });
      return next;
    });
    setPending({});
    setToast('已儲存變更');
    setTimeout(() => setToast(''), 2000);
  };

  // 類別分布
  const catData = CATEGORIES.slice(1).map(c => ({
    cat: c,
    count: SPARE_PARTS.filter(p => p.category === c).length,
    value: SPARE_PARTS.filter(p => p.category === c).reduce((s, p) => s + stocks[p.id] * p.unitPrice, 0),
  }));
  const maxCat = Math.max(...catData.map(c => c.count));

  if (detailPage) {
    return <V3Detail part={detailPage} onBack={() => setDetailPage(null)} stocks={stocks} pending={pending} onAdjust={adjust} onSave={save}/>;
  }

  return (
    <div style={{ fontFamily: FONT_STACK, color: TOKENS.ink, background: TOKENS.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 頂部 */}
      <header style={{
        background: `linear-gradient(180deg, ${TOKENS.brand} 0%, ${TOKENS.brandDark} 100%)`,
        color: '#fff', padding: '16px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ffffff20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="boxes" size={20} color="#fff"/>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>備品管理駕駛艙</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Spare Parts Dashboard · 國光生技</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
            <span style={{ opacity: 0.85 }}>2026-05-04 14:32 · 林易賢</span>
            <button style={{ background: '#ffffff20', border: '1px solid #ffffff30', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="refresh" size={14}/> 重新整理
            </button>
          </div>
        </div>

        {/* KPI 列 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {[
            { label: '備品種類', val: SPARE_PARTS.length, unit: '項', icon: 'boxes' },
            { label: '低庫存警示', val: lowStock.length, unit: '項', icon: 'bell', warn: true },
            { label: '需採購', val: needBuy.length, unit: '項', icon: 'package', warn: true },
            { label: '總庫存價值', val: 'NT$ ' + (totalValue / 1000).toFixed(1) + 'K', unit: '', icon: 'chart' },
          ].map(k => (
            <div key={k.label} style={{
              background: '#ffffff15', backdropFilter: 'blur(10px)',
              border: '1px solid #ffffff20', borderRadius: 10, padding: 12,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: k.warn ? '#FFFFFF20' : '#ffffff15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={k.icon} size={18} color={k.warn ? '#FFD54F' : '#fff'}/>
              </div>
              <div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{k.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
                  {k.val}<span style={{ fontSize: 11, fontWeight: 500, marginLeft: 4, opacity: 0.7 }}>{k.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16, padding: 20, flex: 1 }}>
        {/* 左側主表 */}
        <div>
          {/* 工具列 */}
          <Card padding={12} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <Input value={q} onChange={setQ} placeholder="搜尋品名/型號/編號…" icon="search" width={240}/>
              <Select label="產線" value={line} options={LINES} onChange={setLine}/>
              <Select label="設備" value={equip} options={EQUIPMENT} onChange={setEquip}/>
              <Select label="類別" value={cat} options={CATEGORIES} onChange={setCat}/>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <Button icon="qrcode" size="sm">QR</Button>
                <Button icon="export" size="sm">匯出</Button>
                <Button icon="plus" variant="primary" size="sm">新增</Button>
              </div>
            </div>
          </Card>

          {/* 表格 */}
          <Card padding={0}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 880 }}>
                <thead>
                  <tr style={{ background: TOKENS.surfaceAlt, borderBottom: `1px solid ${TOKENS.line}` }}>
                    {['', '狀態', '品名 / 型號', '品牌', '位置', '庫存量', '單價', '領用'].map((h, i) => (
                      <th key={i} style={{ padding: '12px 14px', textAlign: i >= 5 ? (i === 7 ? 'center' : 'right') : 'left', fontSize: 11, color: TOKENS.muted, fontWeight: 700, letterSpacing: 0.4 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                {filtered.map((p, i) => {
                    const cur = stocks[p.id];
                    const delta = pending[p.id] || 0;
                    const previewStock = Math.max(0, cur + delta);
                    const isOpen = expanded.has(p.id);
                    return (
                      <tbody key={p.id} style={{ display: 'table-row-group' }}>
                        <tr style={{ borderBottom: `1px solid ${TOKENS.line2}`, background: isOpen ? TOKENS.brandLight + '50' : 'transparent', cursor: 'pointer' }}>
                          <td style={{ padding: '10px 8px 10px 14px', width: 28 }}>
                            <button onClick={() => toggleExpand(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.muted, padding: 4, display: 'inline-flex', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }}>
                              <Icon name="chevron" size={14}/>
                            </button>
                          </td>
                          <td style={{ padding: '10px 14px' }} onClick={() => toggleExpand(p.id)}><StatusPill status={p.status} dense/></td>
                          <td style={{ padding: '10px 14px' }} onClick={() => toggleExpand(p.id)}>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: TOKENS.muted, fontFamily: 'ui-monospace, Menlo, monospace' }}>{p.nameZh} · {p.model}</div>
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, fontFamily: 'ui-monospace, Menlo, monospace' }} onClick={() => toggleExpand(p.id)}>{p.brand}</td>
                          <td style={{ padding: '10px 14px' }} onClick={() => toggleExpand(p.id)}>
                            <span style={{ background: TOKENS.line2, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{p.location}</span>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right' }} onClick={() => toggleExpand(p.id)}>
                            <StockBar stock={previewStock} min={p.minStock}/>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }} onClick={() => toggleExpand(p.id)}>NT$ {p.unitPrice.toLocaleString()}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <Stepper value={delta} onChange={v => adjust(p.id, v)} min={-cur} max={99} size="sm"/>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr>
                            <td colSpan={8} style={{ padding: 0, background: TOKENS.brandLight + '40', borderBottom: `1px solid ${TOKENS.line2}` }}>
                              <div style={{ padding: '14px 24px 16px 50px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                                <div>
                                  <div style={{ fontSize: 11, color: TOKENS.brandDark, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>規格 / 編號</div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                                    {[
                                      ['規格描述', p.spec],
                                      ['原始備品採購編號', p.originPN],
                                      ['國光備品編號', p.fcmPN || '—'],
                                      ['部品編號', p.partNo],
                                      ['可替代性', p.replaceable],
                                      ['共用性', p.sharedLine],
                                    ].map(([k, v]) => (
                                      <div key={k} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line2}`, borderRadius: 6, padding: 8 }}>
                                        <div style={{ fontSize: 10, color: TOKENS.muted, marginBottom: 2 }}>{k}</div>
                                        <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'ui-monospace, Menlo, monospace' }}>{v}</div>
                                      </div>
                                    ))}
                                  </div>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <Button size="sm" icon="info" onClick={() => setDetailPage(p)}>開啟詳情頁</Button>
                                    <Button size="sm" icon="edit">編輯</Button>
                                    <Button size="sm" icon="export">匯出明細</Button>
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: 11, color: TOKENS.brandDark, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Icon name="history" size={12}/> 進出紀錄
                                  </div>
                                  {p.history.length === 0 ? (
                                    <div style={{ fontSize: 12, color: TOKENS.muted, padding: '12px 0', textAlign: 'center', background: TOKENS.surface, borderRadius: 6, border: `1px solid ${TOKENS.line2}` }}>暫無紀錄</div>
                                  ) : (
                                    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line2}`, borderRadius: 6, overflow: 'hidden' }}>
                                      {p.history.map((h, hi) => (
                                        <div key={hi} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderBottom: hi < p.history.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', fontSize: 12 }}>
                                          <span style={{ fontWeight: 600 }}>{h.user}</span>
                                          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <span style={{ color: h.delta.startsWith('+') ? TOKENS.ok : TOKENS.danger, fontWeight: 700, fontFamily: 'ui-monospace, Menlo, monospace' }}>{h.delta}</span>
                                            <span style={{ color: TOKENS.muted, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11 }}>{h.date}</span>
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    );
                  })}
              </table>
            </div>
            <div style={{ padding: '10px 16px', borderTop: `1px solid ${TOKENS.line2}`, background: TOKENS.surfaceAlt, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: TOKENS.muted }}>
              <span>共 {filtered.length} 項</span>
              {Object.keys(pending).length > 0 ? (
                <Button size="sm" variant="primary" icon="save" onClick={save}>儲存 {Object.keys(pending).length} 項變更</Button>
              ) : <span>無未儲存變更</span>}
            </div>
          </Card>
        </div>

        {/* 右側欄 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 低庫存警示 */}
          <Card padding={0} title="低庫存警示" action={<span style={{ background: TOKENS.dangerBg, color: TOKENS.danger, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{lowStock.length}</span>}>
            <div>
              {lowStock.slice(0, 5).map((p, i) => (
                <div key={p.id} onClick={() => setDetailPage(p)} style={{ padding: '12px 16px', borderTop: i > 0 ? `1px solid ${TOKENS.line2}` : 'none', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div style={{ width: 6, height: 30, borderRadius: 3, background: p.status === '需採購' ? TOKENS.danger : TOKENS.warn }}/>
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
              {lowStock.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: TOKENS.muted, fontSize: 12 }}>所有備品庫存正常 ✓</div>}
            </div>
          </Card>

          {/* 類別分布 */}
          <Card title="類別分布" padding={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {catData.map(c => (
                <div key={c.cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{c.cat}</span>
                    <span style={{ color: TOKENS.muted, fontVariantNumeric: 'tabular-nums' }}>{c.count} 項</span>
                  </div>
                  <div style={{ height: 8, background: TOKENS.line2, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(c.count / maxCat) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${TOKENS.brandAccent}, ${TOKENS.brand})`, borderRadius: 4 }}/>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 近期領用 */}
          <Card title="近期領用" padding={0}>
            {SPARE_PARTS.flatMap(p => p.history.map(h => ({ ...h, name: p.name }))).slice(-5).reverse().map((h, i) => (
              <div key={i} style={{ padding: '10px 16px', borderTop: i > 0 ? `1px solid ${TOKENS.line2}` : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: h.delta.startsWith('+') ? TOKENS.okBg : TOKENS.dangerBg, color: h.delta.startsWith('+') ? TOKENS.ok : TOKENS.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'ui-monospace, Menlo, monospace' }}>{h.delta}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                  <div style={{ fontSize: 10, color: TOKENS.muted }}>{h.user} · {h.date}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 60 }}>
          <Notice kind="ok" icon="check">{toast}</Notice>
        </div>
      )}
    </div>
  );
};

// 獨立詳情頁
const V3Detail = ({ part, onBack, stocks, pending, onAdjust, onSave }) => {
  const cur = stocks[part.id];
  const delta = pending[part.id] || 0;
  return (
    <div style={{ fontFamily: FONT_STACK, color: TOKENS.ink, background: TOKENS.bg, minHeight: '100%' }}>
      <div style={{ background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.line}`, padding: '16px 24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.brand, fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0 }}>
          ← 返回庫存列表
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <StatusPill status={part.status}/>
              <span style={{ fontSize: 12, color: TOKENS.muted }}>{part.id} · {part.category}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{part.name}</h1>
            <div style={{ fontSize: 14, color: TOKENS.ink2, marginTop: 2 }}>{part.nameZh} · {part.brand} {part.model}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon="edit">編輯</Button>
            <Button icon="export">匯出</Button>
            <Button icon="trash" variant="danger">刪除</Button>
            <Button icon="save" variant="primary" onClick={onSave}>儲存</Button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 16, padding: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="規格 / 編號資訊" padding={20}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {[
                ['規格描述', part.spec],
                ['原始備品採購編號', part.originPN],
                ['國光備品編號', part.fcmPN || '—'],
                ['部品編號', part.partNo],
                ['可替代性', part.replaceable],
                ['共用性', part.sharedLine],
                ['品牌', part.brand],
                ['型號', part.model],
                ['位置', part.location],
                ['供應商', part.supplier],
                ['單價', 'NT$ ' + part.unitPrice.toLocaleString()],
                ['報價單', part.quotePrice ? 'NT$ ' + part.quotePrice.toLocaleString() : '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: TOKENS.muted, fontWeight: 600, letterSpacing: 0.3, marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 14, color: TOKENS.ink, fontWeight: 600, fontFamily: 'ui-monospace, Menlo, monospace' }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title={`進出紀錄 · 共 ${part.history.length} 筆`} padding={0}>
            {part.history.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: TOKENS.muted, fontSize: 13 }}>尚無進出紀錄</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: TOKENS.surfaceAlt, borderBottom: `1px solid ${TOKENS.line2}` }}>
                    {['類型', '人員', '數量', '日期'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: TOKENS.muted, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {part.history.map((h, i) => {
                    const isIn = h.delta.startsWith('+');
                    return (
                      <tr key={i} style={{ borderBottom: i < part.history.length - 1 ? `1px solid ${TOKENS.line2}` : 'none' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: isIn ? TOKENS.ok : TOKENS.danger }}>
                            <Icon name={isIn ? 'arrowDown' : 'arrowUp'} size={12}/>
                            {isIn ? '入庫' : '領用'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{h.user}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700, color: isIn ? TOKENS.ok : TOKENS.danger }}>{h.delta}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: TOKENS.muted, fontFamily: 'ui-monospace, Menlo, monospace' }}>{h.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding={20} style={{ background: `linear-gradient(135deg, ${TOKENS.brand}, ${TOKENS.brandDark})`, border: 'none', color: '#fff' }}>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>目前庫存</div>
            <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{Math.max(0, cur + delta)}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>最低庫存量 {part.minStock} · 位置 {part.location}</div>
            <div style={{ marginTop: 16, padding: 12, background: '#ffffff20', borderRadius: 8 }}>
              <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 8 }}>領用 / 入庫</div>
              <Stepper value={delta} onChange={v => onAdjust(part.id, v)} min={-cur} max={99} size="lg"/>
              {delta !== 0 && <div style={{ fontSize: 11, marginTop: 8, opacity: 0.9 }}>變更後庫存：{Math.max(0, cur + delta)}</div>}
            </div>
          </Card>

          <Card title="QR Code" padding={20}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 140, height: 140, background: '#000', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 14, background: 'repeating-conic-gradient(#fff 0% 25%, #000 0% 50%) 0 / 10px 10px' }}/>
              </div>
              <div style={{ fontSize: 11, color: TOKENS.muted, fontFamily: 'ui-monospace, Menlo, monospace' }}>{part.id}</div>
              <Button icon="export" size="sm">下載/列印</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
window.V3 = V3;
