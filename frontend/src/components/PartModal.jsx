import { useState, useEffect } from 'react'
import Modal from './Modal'
import { Field, TextInput, SelectInput, TextArea } from './FormField'
import { Notice } from './ui'
import { TOKENS } from '../tokens'
import { api } from '../api/client'

const UNIT_OPTIONS = [
  { value: '個', label: '個' },
  { value: '組', label: '組' },
  { value: '條', label: '條' },
  { value: '捲', label: '捲' },
  { value: '片', label: '片' },
  { value: '包', label: '包' },
  { value: '箱', label: '箱' },
  { value: '支', label: '支' },
  { value: '套', label: '套' },
  { value: 'm',  label: 'm'  },
]

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.muted, letterSpacing: 0.5, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${TOKENS.line2}` }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

const empty = {
  name: '', partNo: '', manufacturerPartNo: '', internalPartNo: '',
  brand: '', modelNo: '', categoryId: '', unit: '個',
  specDescription: '', minStock: '0', quotationRef: '',
  isSubstitutable: false, substituteNote: '', sharedEquipment: '',
}

export default function PartModal({ mode = 'add', item, onClose, onSaved }) {
  const [form,       setForm]       = useState(empty)
  const [categories, setCategories] = useState([])
  const [saving,     setSaving]     = useState(false)
  const [err,        setErr]        = useState('')

  useEffect(() => {
    api.get('/settings/categories').then(r => setCategories(r.data ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (mode === 'edit' && item) {
      setForm({
        name:               item.name ?? '',
        partNo:             item.partNo ?? '',
        manufacturerPartNo: item.manufacturerPartNo ?? '',
        internalPartNo:     item.internalPartNo ?? '',
        brand:              item.brand ?? '',
        modelNo:            item.modelNo ?? '',
        categoryId:         item.categoryId ? String(item.categoryId) : '',
        unit:               item.unit ?? '個',
        specDescription:    item.specDescription ?? '',
        minStock:           String(item.minStock ?? 0),
        quotationRef:       item.quotationRef ?? '',
        isSubstitutable:    item.isSubstitutable ?? false,
        substituteNote:     item.substituteNote ?? '',
        sharedEquipment:    item.sharedEquipment ?? '',
      })
    }
  }, [mode, item])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  async function save() {
    if (!form.name) return setErr('品名為必填')
    setSaving(true); setErr('')
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        minStock:   Number(form.minStock) || 0,
      }
      if (mode === 'add') await api.post('/parts', payload)
      else await api.patch(`/parts/${item.id}`, payload)
      onSaved?.()
      onClose()
    } catch (e) { setErr(e.message) } finally { setSaving(false) }
  }

  const catOptions = categories.map(c => ({ value: String(c.id), label: c.name }))

  return (
    <Modal
      title={mode === 'add' ? '新增備品' : '編輯備品'}
      onClose={onClose}
      onConfirm={save}
      loading={saving}
      width={640}
    >
      {err && <div style={{ marginBottom: 16 }}><Notice kind="danger" icon="bell">{err}</Notice></div>}

      <Section title="編號資訊">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="部品編號"><TextInput value={form.partNo} onChange={v => set('partNo', v)} placeholder="例：B71.1"/></Field>
          <Field label="原廠部品採購編號"><TextInput value={form.manufacturerPartNo} onChange={v => set('manufacturerPartNo', v)} placeholder="原廠 PN"/></Field>
          <Field label="國光備品編號"><TextInput value={form.internalPartNo} onChange={v => set('internalPartNo', v)} placeholder="內部編號"/></Field>
        </div>
      </Section>

      <Section title="基本資料">
        <Field label="品名" required><TextInput value={form.name} onChange={v => set('name', v)} placeholder="例：OPTICAL FIBRE PHOTOCELL"/></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="廠牌"><TextInput value={form.brand} onChange={v => set('brand', v)} placeholder="例：SICK"/></Field>
          <Field label="型號"><TextInput value={form.modelNo} onChange={v => set('modelNo', v)} placeholder="例：WLL170-2P430"/></Field>
          <Field label="單位"><SelectInput value={form.unit} onChange={v => set('unit', v)} options={UNIT_OPTIONS} placeholder=""/></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="類別"><SelectInput value={form.categoryId} onChange={v => set('categoryId', v)} options={catOptions} placeholder="請選擇分類"/></Field>
          <Field label="報價單參考"><TextInput value={form.quotationRef} onChange={v => set('quotationRef', v)} placeholder="報價單號或備註"/></Field>
        </div>
        <Field label="規格描述"><TextArea value={form.specDescription} onChange={v => set('specDescription', v)} placeholder="規格、電氣特性、尺寸等…" rows={2}/></Field>
      </Section>

      <Section title="庫存控管">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="最低庫存量"><TextInput type="number" value={form.minStock} onChange={v => set('minStock', v)} placeholder="0"/></Field>
          <Field label="共用設備"><TextInput value={form.sharedEquipment} onChange={v => set('sharedEquipment', v)} placeholder="例：DTS002, SLA210"/></Field>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            id="isSubstitutable"
            checked={form.isSubstitutable}
            onChange={e => set('isSubstitutable', e.target.checked)}
            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: TOKENS.brand }}
          />
          <label htmlFor="isSubstitutable" style={{ fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>可替代</label>
        </div>
        {form.isSubstitutable && (
          <Field label="替代品說明">
            <TextInput value={form.substituteNote} onChange={v => set('substituteNote', v)} placeholder="例：可替代型號 XXX"/>
          </Field>
        )}
      </Section>
    </Modal>
  )
}
