import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()
const __dirname = dirname(fileURLToPath(import.meta.url))
const devices = JSON.parse(readFileSync(resolve(__dirname, '../../device/devices.json'), 'utf-8'))

async function main() {
  // 角色
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'admin' },     update: {}, create: { name: 'admin',     description: '系統管理員' } }),
    prisma.role.upsert({ where: { name: 'warehouse' }, update: {}, create: { name: 'warehouse', description: '倉管人員' } }),
    prisma.role.upsert({ where: { name: 'requester' }, update: {}, create: { name: 'requester', description: '領用申請人員' } }),
    prisma.role.upsert({ where: { name: 'viewer' },    update: {}, create: { name: 'viewer',    description: '唯讀檢視' } }),
  ])
  console.log('✓ 角色建立完成:', roles.map(r => r.name).join(', '))

  // 管理員帳號
  const hashed = await bcrypt.hash('Admin@1234', 10)
  const admin = await prisma.user.upsert({
    where:  { username: 'admin' },
    update: {},
    create: {
      username:   'admin',
      password:   hashed,
      fullName:   '系統管理員',
      employeeNo: 'A001',
      roleId:     roles[0].id,
    },
  })
  console.log('✓ 管理員帳號建立完成:', admin.username, '/ 密碼: Admin@1234')

  // 備品分類
  const cats = await Promise.all([
    prisma.category.upsert({ where: { code: 'ELEC' }, update: {}, create: { code: 'ELEC', name: '電控元件', level: 1, sortOrder: 1 } }),
    prisma.category.upsert({ where: { code: 'MECH' }, update: {}, create: { code: 'MECH', name: '機構件',   level: 1, sortOrder: 2 } }),
    prisma.category.upsert({ where: { code: 'PNEU' }, update: {}, create: { code: 'PNEU', name: '氣壓元件', level: 1, sortOrder: 3 } }),
    prisma.category.upsert({ where: { code: 'SENS' }, update: {}, create: { code: 'SENS', name: '感測器',   level: 1, sortOrder: 4 } }),
    prisma.category.upsert({ where: { code: 'CONS' }, update: {}, create: { code: 'CONS', name: '耗材',     level: 1, sortOrder: 5 } }),
  ])
  console.log('✓ 備品分類建立完成:', cats.map(c => c.name).join(', '))

  // 產線（從 devices.json 取得不重複的產線）
  const linesCodes = [...new Set(devices.map(d => d.line))].sort()
  const lineMap = {}
  for (const code of linesCodes) {
    const line = await prisma.productionLine.upsert({
      where:  { code },
      update: {},
      create: { code, name: `產線 ${code}` },
    })
    lineMap[code] = line.id
  }
  console.log('✓ 產線建立完成:', linesCodes.join(', '))

  // 設備（從 devices.json 匯入）
  let equipCount = 0
  for (const d of devices) {
    await prisma.equipment.upsert({
      where:  { productionLineId_code: { productionLineId: lineMap[d.line], code: d.model } },
      update: { name: d.category },
      create: {
        productionLineId: lineMap[d.line],
        code: d.model,
        name: d.category,
      },
    })
    equipCount++
  }
  console.log(`✓ 設備建立完成：共 ${equipCount} 台`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
