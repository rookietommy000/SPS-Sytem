import { useState, useEffect } from 'react'
import { TOKENS } from '../tokens'
import { Button, Notice } from '../components/ui'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import { Field, TextInput, SelectInput, TextArea } from '../components/FormField'
import { api } from '../api/client'

const TABS = [
  { key: 'lines',      label: '產線管理', icon: 'factory'  },
  { key: 'equipment',  label: '設備管理', icon: 'settings' },
  { key: 'categories', label: '備品分類', icon: 'list'     },
  { key: 'suppliers',  label: '供應商',   icon: 'package'  },
  { key: 'users',      label: '使用者',   icon: 'user'     },
]

function TableWrap({ headers, cols, children, loading }) {
  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '10px 18px', background: TOKENS.brandLight, borderBottom: `2px solid ${TOKENS.brand}` }}>
        {headers.map(h => <div key={h} style={{ fontSize: 12, fontWeight: 700, color: TOKENS.brandDark, overflow: 'hidden', whiteSpace: 'nowrap' }}>{h}</div>)}
      </div>
      {loading
        ? <div style={{ padding: 32, textAlign: 'center', color: TOKENS.muted, fontSize: 13 }}>載入中…</div>
        : children}
    </div>
  )
}

const cell = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }

function SectionHeader({ title, onAdd }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
      <Button icon="plus" size="sm" onClick={onAdd}>新增</Button>
    </div>
  )
}

function EditBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${TOKENS.line}`, background: TOKENS.surface, cursor: 'pointer', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon name="edit" size={12}/> 編輯
    </button>
  )
}

// ── 產線 ─────────────────────────────────────────────────────
function LinesTab() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null) // null | { mode:'add'|'edit', item? }
  const [form,    setForm]    = useState({ code: '', name: '' })
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState('')

  const load = () => {
    setLoading(true)
    api.get('/settings/lines').then(r => setData(r.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function openAdd() { setForm({ code: '', name: '' }); setErr(''); setModal({ mode: 'add' }) }
  function openEdit(item) { setForm({ code: item.code, name: item.name ?? '' }); setErr(''); setModal({ mode: 'edit', item }) }

  async function save() {
    if (!form.code) return setErr('代碼為必填')
    setSaving(true); setErr('')
    try {
      if (modal.mode === 'add') await api.post('/settings/lines', form)
      else await api.patch(`/settings/lines/${modal.item.id}`, form)
      setModal(null); load()
    } catch (e) { setErr(e.message) } finally { setSaving(false) }
  }

  return (
    <>
      <SectionHeader title="產線管理" onAdd={openAdd}/>
      <TableWrap headers={['代碼', '名稱', '設備數', '']} cols="100px 1fr 70px 80px" loading={loading}>
        {data.map((r, i) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 70px 80px', padding: '12px 18px', borderBottom: i < data.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', alignItems: 'center', background: i % 2 === 0 ? TOKENS.surface : TOKENS.surfaceAlt }}>
            <span style={{ ...cell, fontFamily: 'ui-monospace,Menlo,monospace', fontWeight: 600 }}>{r.code}</span>
            <span style={cell}>{r.name ?? '—'}</span>
            <span style={{ ...cell, color: TOKENS.muted }}>{r._count?.equipment ?? 0} 台</span>
            <EditBtn onClick={() => openEdit(r)}/>
          </div>
        ))}
      </TableWrap>

      {modal && (
        <Modal title={modal.mode === 'add' ? '新增產線' : '編輯產線'} onClose={() => setModal(null)} onConfirm={save} loading={saving} width={400}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {err && <Notice kind="danger" icon="bell">{err}</Notice>}
            <Field label="產線代碼" required><TextInput value={form.code} onChange={v => setForm(f => ({ ...f, code: v }))} placeholder="例：2.1"/></Field>
            <Field label="名稱"><TextInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="例：包裝產線"/></Field>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── 設備 ─────────────────────────────────────────────────────
function EquipmentTab() {
  const [data,    setData]    = useState([])
  const [lines,   setLines]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState({ productionLineId: '', code: '', name: '' })
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/settings/equipment'), api.get('/settings/lines')])
      .then(([e, l]) => { setData(e.data ?? []); setLines(l.data ?? []) })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  function openAdd() { setForm({ productionLineId: '', code: '', name: '' }); setErr(''); setModal({ mode: 'add' }) }
  function openEdit(item) { setForm({ productionLineId: String(item.productionLineId), code: item.code, name: item.name ?? '' }); setErr(''); setModal({ mode: 'edit', item }) }

  async function save() {
    if (!form.productionLineId || !form.code) return setErr('產線與代碼為必填')
    setSaving(true); setErr('')
    try {
      if (modal.mode === 'add') await api.post('/settings/equipment', { ...form, productionLineId: Number(form.productionLineId) })
      else await api.patch(`/settings/equipment/${modal.item.id}`, form)
      setModal(null); load()
    } catch (e) { setErr(e.message) } finally { setSaving(false) }
  }

  const lineOptions = lines.map(l => ({ value: String(l.id), label: `${l.code}${l.name ? ' · ' + l.name : ''}` }))

  return (
    <>
      <SectionHeader title="設備管理" onAdd={openAdd}/>
      <TableWrap headers={['代碼', '名稱', '產線', '']} cols="140px 1fr 60px 80px" loading={loading}>
        {data.map((r, i) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 60px 80px', padding: '12px 18px', borderBottom: i < data.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', alignItems: 'center', background: i % 2 === 0 ? TOKENS.surface : TOKENS.surfaceAlt }}>
            <span style={{ ...cell, fontFamily: 'ui-monospace,Menlo,monospace', fontWeight: 600, fontSize: 13 }}>{r.code}</span>
            <span style={cell}>{r.name ?? '—'}</span>
            <span style={{ ...cell, color: TOKENS.muted, fontSize: 13 }}>{r.productionLine?.code ?? '—'}</span>
            <EditBtn onClick={() => openEdit(r)}/>
          </div>
        ))}
      </TableWrap>

      {modal && (
        <Modal title={modal.mode === 'add' ? '新增設備' : '編輯設備'} onClose={() => setModal(null)} onConfirm={save} loading={saving} width={400}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {err && <Notice kind="danger" icon="bell">{err}</Notice>}
            <Field label="所屬產線" required>
              <SelectInput value={form.productionLineId} onChange={v => setForm(f => ({ ...f, productionLineId: v }))} options={lineOptions} placeholder="請選擇產線"/>
            </Field>
            <Field label="設備代碼" required><TextInput value={form.code} onChange={v => setForm(f => ({ ...f, code: v }))} placeholder="例：DTS002"/></Field>
            <Field label="設備名稱"><TextInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="例：DTS 點膠機"/></Field>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── 備品分類 ──────────────────────────────────────────────────
function CategoriesTab() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState({ code: '', name: '', sortOrder: '0' })
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState('')

  const load = () => {
    setLoading(true)
    api.get('/settings/categories').then(r => setData(r.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function openAdd() { setForm({ code: '', name: '', sortOrder: '0' }); setErr(''); setModal({ mode: 'add' }) }
  function openEdit(item) { setForm({ code: item.code, name: item.name, sortOrder: String(item.sortOrder ?? 0) }); setErr(''); setModal({ mode: 'edit', item }) }

  async function save() {
    if (!form.code || !form.name) return setErr('代碼與名稱為必填')
    setSaving(true); setErr('')
    try {
      await api.post('/settings/categories', { ...form, sortOrder: Number(form.sortOrder) })
      setModal(null); load()
    } catch (e) { setErr(e.message) } finally { setSaving(false) }
  }

  return (
    <>
      <SectionHeader title="備品分類" onAdd={openAdd}/>
      <TableWrap headers={['代碼', '名稱', '備品數', '']} cols="100px 1fr 70px 80px" loading={loading}>
        {data.map((r, i) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 70px 80px', padding: '12px 18px', borderBottom: i < data.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', alignItems: 'center', background: i % 2 === 0 ? TOKENS.surface : TOKENS.surfaceAlt }}>
            <span style={{ ...cell, fontFamily: 'ui-monospace,Menlo,monospace', fontWeight: 600 }}>{r.code}</span>
            <span style={cell}>{r.name}</span>
            <span style={{ ...cell, color: TOKENS.muted }}>{r._count?.parts ?? 0} 種</span>
            <EditBtn onClick={() => openEdit(r)}/>
          </div>
        ))}
      </TableWrap>

      {modal && (
        <Modal title={modal.mode === 'add' ? '新增分類' : '編輯分類'} onClose={() => setModal(null)} onConfirm={save} loading={saving} width={400}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {err && <Notice kind="danger" icon="bell">{err}</Notice>}
            <Field label="分類代碼" required><TextInput value={form.code} onChange={v => setForm(f => ({ ...f, code: v }))} placeholder="例：ELEC" disabled={modal.mode === 'edit'}/></Field>
            <Field label="分類名稱" required><TextInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="例：電控元件"/></Field>
            <Field label="排序"><TextInput type="number" value={form.sortOrder} onChange={v => setForm(f => ({ ...f, sortOrder: v }))} placeholder="0"/></Field>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── 供應商 ────────────────────────────────────────────────────
function SuppliersTab() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState({ code: '', name: '', supplierType: '', contact: '', phone: '', email: '', address: '', taxId: '', paymentTerms: '' })
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState('')

  const load = () => {
    setLoading(true)
    api.get('/settings/suppliers').then(r => setData(r.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function openAdd() { setForm({ code: '', name: '', supplierType: '', contact: '', phone: '', email: '', address: '', taxId: '', paymentTerms: '' }); setErr(''); setModal({ mode: 'add' }) }
  function openEdit(item) {
    setForm({ code: item.code, name: item.name, supplierType: item.supplierType ?? '', contact: item.contact ?? '', phone: item.phone ?? '', email: item.email ?? '', address: item.address ?? '', taxId: item.taxId ?? '', paymentTerms: item.paymentTerms ?? '' })
    setErr(''); setModal({ mode: 'edit', item })
  }

  async function save() {
    if (!form.code || !form.name) return setErr('代碼與名稱為必填')
    setSaving(true); setErr('')
    try {
      if (modal.mode === 'add') await api.post('/settings/suppliers', form)
      else await api.patch(`/settings/suppliers/${modal.item.id}`, form)
      setModal(null); load()
    } catch (e) { setErr(e.message) } finally { setSaving(false) }
  }

  const typeOptions = [{ value: '單點', label: '單點' }, { value: '台灣', label: '台灣' }, { value: '國際', label: '國際' }]

  return (
    <>
      <SectionHeader title="供應商管理" onAdd={openAdd}/>
      <TableWrap headers={['代碼', '名稱', '類型', '聯絡人', '']} cols="120px 1fr 70px 120px 80px" loading={loading}>
        {data.map((r, i) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 70px 120px 80px', padding: '12px 18px', borderBottom: i < data.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', alignItems: 'center', background: i % 2 === 0 ? TOKENS.surface : TOKENS.surfaceAlt }}>
            <span style={{ ...cell, fontFamily: 'ui-monospace,Menlo,monospace', fontWeight: 600 }}>{r.code}</span>
            <span style={cell}>{r.name}</span>
            <span style={{ fontSize: 12, background: TOKENS.line2, padding: '2px 6px', borderRadius: 999, textAlign: 'center', whiteSpace: 'nowrap' }}>{r.supplierType ?? '—'}</span>
            <span style={{ ...cell, color: TOKENS.muted, fontSize: 13 }}>{r.contact ?? '—'}</span>
            <EditBtn onClick={() => openEdit(r)}/>
          </div>
        ))}
      </TableWrap>

      {modal && (
        <Modal title={modal.mode === 'add' ? '新增供應商' : '編輯供應商'} onClose={() => setModal(null)} onConfirm={save} loading={saving} width={520}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {err && <Notice kind="danger" icon="bell">{err}</Notice>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="供應商代碼" required><TextInput value={form.code} onChange={v => setForm(f => ({ ...f, code: v }))} placeholder="例：SMC-TW" disabled={modal.mode === 'edit'}/></Field>
              <Field label="類型"><SelectInput value={form.supplierType} onChange={v => setForm(f => ({ ...f, supplierType: v }))} options={typeOptions} placeholder="請選擇…"/></Field>
            </div>
            <Field label="供應商名稱" required><TextInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="例：SMC台灣"/></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="聯絡人"><TextInput value={form.contact} onChange={v => setForm(f => ({ ...f, contact: v }))} placeholder="姓名"/></Field>
              <Field label="電話"><TextInput value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="02-XXXX-XXXX"/></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Email"><TextInput value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="example@mail.com"/></Field>
              <Field label="統一編號"><TextInput value={form.taxId} onChange={v => setForm(f => ({ ...f, taxId: v }))} placeholder="12345678"/></Field>
            </div>
            <Field label="地址"><TextInput value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="縣市區路…"/></Field>
            <Field label="付款條件"><TextInput value={form.paymentTerms} onChange={v => setForm(f => ({ ...f, paymentTerms: v }))} placeholder="例：月結 30 天"/></Field>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── 使用者 ────────────────────────────────────────────────────
function UsersTab() {
  const [data,    setData]    = useState([])
  const [roles,   setRoles]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState({ employeeNo: '', username: '', password: '', fullName: '', roleId: '' })
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/settings/users'),
      api.get('/auth/roles').catch(() => ({ data: [] })),
    ]).then(([u, r]) => { setData(u.data ?? []); setRoles(r.data ?? []) }).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function openAdd() { setForm({ employeeNo: '', username: '', password: '', fullName: '', roleId: '' }); setErr(''); setModal({ mode: 'add' }) }
  function openEdit(item) { setForm({ employeeNo: item.employeeNo ?? '', username: item.username, password: '', fullName: item.fullName, roleId: String(item.role?.id ?? '') }); setErr(''); setModal({ mode: 'edit', item }) }

  async function save() {
    if (modal.mode === 'add' && (!form.username || !form.password || !form.fullName || !form.roleId)) return setErr('帳號、密碼、姓名、角色為必填')
    if (modal.mode === 'edit' && (!form.fullName || !form.roleId)) return setErr('姓名與角色為必填')
    setSaving(true); setErr('')
    try {
      if (modal.mode === 'add') {
        await api.post('/settings/users', { ...form, roleId: Number(form.roleId) })
      } else {
        const payload = { fullName: form.fullName, roleId: Number(form.roleId) }
        if (form.password) payload.password = form.password
        await api.patch(`/settings/users/${modal.item.id}`, payload)
      }
      setModal(null); load()
    } catch (e) { setErr(e.message) } finally { setSaving(false) }
  }

  const roleOptions = roles.map(r => ({ value: String(r.id), label: r.name }))

  return (
    <>
      <SectionHeader title="使用者管理" onAdd={openAdd}/>
      <TableWrap headers={['員工編號', '姓名', '帳號', '角色', '狀態', '']} cols="100px 1fr 1fr 80px 60px 80px" loading={loading}>
        {data.map((r, i) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 80px 60px 80px', padding: '12px 18px', borderBottom: i < data.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', alignItems: 'center', background: i % 2 === 0 ? TOKENS.surface : TOKENS.surfaceAlt }}>
            <span style={{ ...cell, fontFamily: 'ui-monospace,Menlo,monospace', fontWeight: 600, fontSize: 12 }}>{r.employeeNo ?? '—'}</span>
            <span style={{ ...cell, fontWeight: 500 }}>{r.fullName}</span>
            <span style={{ ...cell, color: TOKENS.muted, fontSize: 12, fontFamily: 'ui-monospace,Menlo,monospace' }}>{r.username}</span>
            <span style={{ ...cell, color: TOKENS.ink2, fontSize: 13 }}>{r.role?.name ?? '—'}</span>
            <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: 999, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', background: r.isActive ? TOKENS.okBg : TOKENS.line2, color: r.isActive ? TOKENS.ok : TOKENS.muted }}>
              {r.isActive ? '啟用' : '停用'}
            </span>
            <EditBtn onClick={() => openEdit(r)}/>
          </div>
        ))}
      </TableWrap>

      {modal && (
        <Modal title={modal.mode === 'add' ? '新增使用者' : '編輯使用者'} onClose={() => setModal(null)} onConfirm={save} loading={saving} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {err && <Notice kind="danger" icon="bell">{err}</Notice>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="姓名" required><TextInput value={form.fullName} onChange={v => setForm(f => ({ ...f, fullName: v }))} placeholder="王小明"/></Field>
              <Field label="員工編號"><TextInput value={form.employeeNo} onChange={v => setForm(f => ({ ...f, employeeNo: v }))} placeholder="A001"/></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="帳號" required><TextInput value={form.username} onChange={v => setForm(f => ({ ...f, username: v }))} placeholder="user01" disabled={modal.mode === 'edit'}/></Field>
              <Field label={modal.mode === 'edit' ? '新密碼（留空不更改）' : '密碼'} required={modal.mode === 'add'}>
                <TextInput type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} placeholder={modal.mode === 'edit' ? '留空不更改' : '請輸入密碼'}/>
              </Field>
            </div>
            <Field label="角色" required>
              <SelectInput value={form.roleId} onChange={v => setForm(f => ({ ...f, roleId: v }))} options={roleOptions} placeholder="請選擇角色"/>
            </Field>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── 主頁面 ────────────────────────────────────────────────────
export default function Settings() {
  const [tab, setTab] = useState('lines')

  return (
    <main style={{ flex: 1, overflow: 'auto', background: TOKENS.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 24px', background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.line}` }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>系統設定</h1>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: 180, background: TOKENS.surface, borderRight: `1px solid ${TOKENS.line}`, padding: 12, flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 2, textAlign: 'left',
              background: tab === t.key ? TOKENS.brandLight : 'transparent',
              color: tab === t.key ? TOKENS.brand : TOKENS.ink2,
              fontWeight: tab === t.key ? 700 : 500, fontSize: 13,
            }}>
              <Icon name={t.icon} size={15}/>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {tab === 'lines'      && <LinesTab/>}
          {tab === 'equipment'  && <EquipmentTab/>}
          {tab === 'categories' && <CategoriesTab/>}
          {tab === 'suppliers'  && <SuppliersTab/>}
          {tab === 'users'      && <UsersTab/>}
        </div>
      </div>
    </main>
  )
}
