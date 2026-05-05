# 備品管理系統 (SPS - Spare Parts System) 建置計畫

## 一、系統概述

備品管理系統用於追蹤與管理公司備用零件的庫存、採購、入出庫作業，確保備品供應充足且庫存成本可控。

---

## 二、技術架構

```
┌─────────────────────────────────────────────────┐
│                  Frontend (React)                │
│            (備品查詢 / 作業表單 / 報表)            │
└───────────────────┬─────────────────────────────┘
                    │ REST API / JSON
┌───────────────────▼─────────────────────────────┐
│              Backend (Node.js + Express)         │
│         (業務邏輯 / 驗證 / 權限控管)              │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│              PostgreSQL Database                 │
│         (主資料 / 庫存 / 交易紀錄)                │
└─────────────────────────────────────────────────┘
```

### 技術選型

| 層級 | 技術 | 版本 |
|------|------|------|
| 前端 | React + Ant Design | React 18 |
| 後端 | Node.js + Express | Node 20 LTS |
| 資料庫 | PostgreSQL | 16 |
| ORM | Prisma | 最新版 |
| 認證 | JWT | - |
| 容器化 | Docker + Docker Compose | - |

---

## 三、核心模組

### 模組 1：使用者與權限管理
- 使用者帳號管理
- 角色設定（管理員 / 倉管 / 申請人 / 檢視者）
- 操作日誌

### 模組 2：備品主資料管理
- 備品分類（多層級）
- 備品基本資料（料號、名稱、規格、單位）
- 備品圖片/附件
- 最低安全庫存設定

### 模組 3：倉儲管理
- 倉庫設定
- 儲位（貨架/格位）設定
- 備品儲位對應

### 模組 4：供應商管理
- 供應商基本資料
- 供應商備品對應（一備品可對應多供應商）

### 模組 5：庫存管理
- 即時庫存查詢
- 庫存異動明細（每筆入/出/調整皆有紀錄）
- 低庫存警示

### 模組 6：入庫作業
- 採購入庫
- 退貨入庫
- 盤盈入庫

### 模組 7：出庫作業
- 領用申請
- 出庫核准流程
- 盤虧出庫

### 模組 8：採購管理
- 採購申請
- 採購單建立
- 採購單追蹤（待確認 → 已訂購 → 部分到貨 → 已完成）

### 模組 9：盤點管理
- 建立盤點單
- 盤點差異確認
- 盤點調整入帳

### 模組 10：報表與統計
- 庫存現況報表
- 庫存異動報表
- 低庫存報表
- 採購統計報表

---

## 四、資料庫設計概覽

### 資料表清單

```
users                   使用者
roles                   角色
categories              備品分類
parts                   備品主資料
part_suppliers          備品-供應商對應
warehouses              倉庫
locations               儲位
suppliers               供應商
inventory               庫存（每備品每儲位一筆）
stock_transactions      庫存異動紀錄
purchase_requests       採購申請
purchase_orders         採購單
purchase_order_items    採購單明細
inventory_counts        盤點單
inventory_count_items   盤點明細
activity_logs           操作日誌
```

### 關聯圖（簡化）

```
categories (1) ──── (N) parts
parts      (1) ──── (N) inventory ──── (1) locations ──── (1) warehouses
parts      (N) ──── (N) suppliers  (透過 part_suppliers)
inventory  (1) ──── (N) stock_transactions
purchase_orders (1) ──── (N) purchase_order_items ──── (N) parts
```

---

## 五、API 設計原則

- RESTful 風格，路徑以資源命名（複數）
- 版本前綴：`/api/v1/`
- 統一回應格式：

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "pagination": { "page": 1, "limit": 20, "total": 100 }
}
```

### 主要 API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | /api/v1/parts | 備品清單 |
| POST | /api/v1/parts | 新增備品 |
| GET | /api/v1/inventory | 庫存查詢 |
| POST | /api/v1/stock-in | 入庫作業 |
| POST | /api/v1/stock-out | 出庫作業 |
| GET | /api/v1/purchase-orders | 採購單清單 |
| POST | /api/v1/purchase-orders | 建立採購單 |
| GET | /api/v1/reports/low-stock | 低庫存報表 |

---

## 六、實作階段規劃

### Phase 1：基礎建設（第 1-2 週）
- [ ] 建立 PostgreSQL 資料庫與 Schema
- [ ] 建立 Node.js 後端骨架（Express + Prisma）
- [ ] 使用者認證模組（JWT 登入/登出）
- [ ] Docker Compose 開發環境設定

### Phase 2：主資料模組（第 3-4 週）
- [ ] 備品分類 CRUD
- [ ] 備品主資料 CRUD
- [ ] 倉庫與儲位 CRUD
- [ ] 供應商管理 CRUD

### Phase 3：庫存核心模組（第 5-7 週）
- [ ] 庫存初始化
- [ ] 入庫作業 API
- [ ] 出庫申請與核准流程 API
- [ ] 庫存異動查詢 API
- [ ] 低庫存警示邏輯

### Phase 4：採購與盤點（第 8-10 週）
- [ ] 採購申請流程
- [ ] 採購單管理
- [ ] 採購入庫串接
- [ ] 盤點作業流程

### Phase 5：前端介面（第 11-14 週）
- [ ] 登入畫面
- [ ] 備品主資料管理頁
- [ ] 庫存查詢頁
- [ ] 入/出庫作業頁
- [ ] 採購管理頁
- [ ] 報表頁面

### Phase 6：上線準備（第 15-16 週）
- [ ] 效能測試與 Index 調優
- [ ] 權限控管驗證
- [ ] 生產環境 Docker 設定
- [ ] 初始資料匯入工具

---

## 七、專案目錄結構

```
SPS/
├── PLAN.md                         # 本文件
├── .env.example                    # 環境變數範本（進 git）
├── .env                            # 實際環境變數（不進 git）
├── .gitignore
├── docker-compose.yml              # 開發環境容器設定
├── docker-compose.prod.yml         # 生產環境覆蓋設定
├── database/
│   ├── schema.sql                  # 完整 Schema 參考（以 Prisma 為主）
│   ├── seed.sql                    # 初始測試資料
│   └── migrations/                 # 手動 SQL 補丁（特殊情況用）
├── backend/
│   ├── src/
│   │   ├── controllers/            # 路由控制器
│   │   ├── services/               # 業務邏輯
│   │   ├── middlewares/            # 認證/錯誤處理
│   │   ├── routes/                 # API 路由定義
│   │   └── utils/                  # 工具函式
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma Schema（資料庫唯一真實來源）
│   │   └── migrations/             # 自動生成的版本化 migration
│   └── package.json
└── frontend/                       # 待 Claude Design 設計完成後再建立
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── services/
    │   └── store/
    └── package.json
```

## 八、環境快速啟動

```bash
# 1. 複製環境變數
cp .env.example .env
# 修改 .env 內的密碼與金鑰

# 2. 啟動開發環境
docker compose up

# 3. 執行資料庫 migration（首次或有新 migration 時）
docker compose exec backend npx prisma migrate dev

# 4. 生產環境啟動
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose exec backend npx prisma migrate deploy
```
