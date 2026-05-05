# 🔧 備品管理系統 (SPS — Spare Parts System)

> 專為製造業設計的備品庫存管理平台，支援備品建檔、庫存異動、領用申請、採購管理與盤點作業。

---

## 🌐 線上網址

| 服務 | 網址 |
|------|------|
| 🖥️ **前端** | https://sps-sytem.vercel.app |
| ⚙️ **後端 API** | https://sps-sytem-production-a7a3.up.railway.app |
| 🗄️ **資料庫** | Neon PostgreSQL（雲端託管） |

---

## 🏗️ 系統架構圖

```
使用者瀏覽器
     │
     ▼
┌─────────────────────┐
│   Vercel (前端)      │  https://sps-sytem.vercel.app
│   React 18 + Vite   │
└────────┬────────────┘
         │ HTTPS API 請求
         │ Authorization: Bearer <JWT Token>
         ▼
┌─────────────────────┐
│  Railway (後端)      │  https://sps-sytem-production-a7a3.up.railway.app
│  Node.js + Express  │
│  Prisma ORM         │
└────────┬────────────┘
         │ DATABASE_URL (SSL)
         ▼
┌─────────────────────┐
│  Neon (資料庫)       │  ep-cold-surf-antrgtxx.us-east-1.aws.neon.tech
│  PostgreSQL 16      │
└─────────────────────┘
```

---

## 🔐 身份驗證流程

```
1. 使用者輸入帳號密碼
         │
         ▼
2. 前端 POST /api/v1/auth/login
         │
         ▼
3. 後端比對 bcrypt 加密密碼
         │
         ▼
4. 驗證成功 → 產生 JWT Token（有效期 8h）
         │
         ▼
5. 前端將 Token 存入 localStorage
         │
         ▼
6. 之後每次 API 請求自動帶入 Header：
   Authorization: Bearer <token>
         │
         ▼
7. 後端 middleware 驗證 Token → 確認身份與角色
```

---

## 🗄️ 資料庫設計

### 資料表關係

```
Role ──< User
ProductionLine ──< Equipment ──< Inventory >── Part
                              ──< StockTransaction >── Part
                              ──< InventoryCount
                              ──< InventoryCountItem >── Part

Part ──< PartSupplier >── Supplier
Part ──< Inventory
Part ──< StockTransaction
Part ──< PurchaseRequestItem >── PurchaseRequest >── User
Part ──< PurchaseOrderItem >── PurchaseOrder >── Supplier
Part ──< InventoryCountItem

Category ──< Part
```

### 主要資料表說明

| 資料表 | 說明 |
|--------|------|
| `roles` | 系統角色（admin / warehouse / requester / viewer） |
| `users` | 使用者帳號，關聯角色 |
| `production_lines` | 產線（2.1、2.2…） |
| `equipment` | 設備，屬於某條產線 |
| `categories` | 備品分類（電控元件、機構件、氣壓元件…） |
| `parts` | 備品主資料（料號、名稱、規格、品牌） |
| `suppliers` | 供應商資料 |
| `part_suppliers` | 備品與供應商的對應（含單價） |
| `inventory` | 庫存量（每備品 × 每設備 一筆） |
| `stock_transactions` | 庫存異動紀錄（入庫/出庫/退料/盤盈虧） |
| `purchase_requests` | 採購申請單 |
| `purchase_orders` | 採購單（對供應商） |
| `inventory_counts` | 盤點單 |
| `inventory_count_items` | 盤點明細（系統量 vs 實盤量） |
| `activity_logs` | 操作日誌 |

### 庫存異動類型

| 類型 | 說明 |
|------|------|
| `STOCK_IN` | 入庫 |
| `STOCK_OUT` | 出庫（領用） |
| `RETURN_IN` | 退料入庫 |
| `ADJUST_PLUS` | 盤盈（實盤 > 系統） |
| `ADJUST_MINUS` | 盤虧（實盤 < 系統） |

---

## ⚙️ 環境變數設定

### 後端（Railway）

| 變數名稱 | 說明 | 範例 |
|----------|------|------|
| `DATABASE_URL` | Neon PostgreSQL 連線字串 | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | JWT 簽名密鑰（任意長字串） | `sps-prod-secret-2024-abc123` |
| `JWT_EXPIRES_IN` | Token 有效期 | `8h` |
| `NODE_ENV` | 環境模式 | `production` |

### 前端（Vercel）

| 變數名稱 | 說明 | 值 |
|----------|------|-----|
| `VITE_API_BASE_URL` | 後端 API 網址 | `https://sps-sytem-production-a7a3.up.railway.app/api/v1` |

---

## 📡 API 端點一覽

### 身份驗證
| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/v1/auth/login` | 登入，回傳 JWT Token |
| GET | `/api/v1/auth/roles` | 取得所有角色列表 |

### 備品管理
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/v1/parts` | 備品列表（支援搜尋、篩選、分頁） |
| POST | `/api/v1/parts` | 新增備品 |
| PATCH | `/api/v1/parts/:id` | 修改備品 |
| DELETE | `/api/v1/parts/:id` | 刪除備品 |

### 庫存
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/v1/inventory` | 庫存列表 |
| PATCH | `/api/v1/inventory/:id` | 更新庫存（位置、最低庫存） |

### 庫存異動
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/v1/transactions` | 異動紀錄列表 |
| POST | `/api/v1/transactions` | 建立異動（入庫/出庫） |

### 採購
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/v1/purchase/requests` | 採購申請列表 |
| POST | `/api/v1/purchase/requests` | 建立採購申請 |
| GET | `/api/v1/purchase/orders` | 採購單列表 |
| POST | `/api/v1/purchase/orders` | 建立採購單 |

### 盤點
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/v1/counts` | 盤點單列表 |
| POST | `/api/v1/counts` | 建立盤點單 |
| PATCH | `/api/v1/counts/:id/close` | 結束盤點 |

### 系統設定
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET/POST/PATCH/DELETE | `/api/v1/settings/lines` | 產線管理 |
| GET/POST/PATCH/DELETE | `/api/v1/settings/equipment` | 設備管理 |
| GET/POST/PATCH/DELETE | `/api/v1/settings/categories` | 分類管理 |
| GET/POST/PATCH/DELETE | `/api/v1/settings/suppliers` | 供應商管理 |
| GET/POST/PATCH/DELETE | `/api/v1/settings/users` | 使用者管理 |

### 其他
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/health` | 健康檢查 |
| GET | `/api/v1/reports` | 報表資料 |

---

## 🚀 部署流程

### 後端部署（Railway）

```
1. 推送程式碼到 GitHub main branch
         │
         ▼
2. Railway 自動偵測到 GitHub 變更
         │
         ▼
3. 從 /backend 目錄執行 npm install
         │
         ▼
4. 執行 prisma generate + 啟動 server
         │
         ▼
5. 對外提供 HTTPS API
```

### 前端部署（Vercel）

```
1. 推送程式碼到 GitHub main branch
         │
         ▼
2. Vercel 自動偵測到 GitHub 變更
         │
         ▼
3. 從 /frontend 目錄執行 npm run build
   （Vite 會將 VITE_API_BASE_URL 燒入打包檔）
         │
         ▼
4. 部署靜態檔案到 CDN
         │
         ▼
5. 全球加速，使用者存取
```

---

## 🛠️ 功能模組

| 模組 | 功能 |
|------|------|
| 📊 **儀表板** | 庫存統計、低庫存警示、近期異動 |
| 📦 **備品管理** | 建檔、搜尋、篩選、分類、供應商對應 |
| 🔄 **庫存異動** | 入庫、出庫、退料、歷史查詢 |
| 📋 **領用申請** | 申請單建立、審核流程、狀態追蹤 |
| 🛒 **採購管理** | 採購申請、採購單、進度追蹤 |
| 📝 **盤點作業** | 盤點單、實盤登錄、差異計算 |
| 📈 **報表** | 庫存報表、異動統計 |
| ⚙️ **系統設定** | 產線、設備、分類、供應商、使用者 |

---

## 👥 權限角色

| 角色 | 說明 |
|------|------|
| `admin` | 系統管理員，全部權限 |
| `warehouse` | 倉管人員，可執行入出庫 |
| `requester` | 領用申請人員，可提出申請 |
| `viewer` | 唯讀檢視 |

---

## 💻 技術架構

### 前端
| 技術 | 說明 |
|------|------|
| React 18 | UI 框架 |
| React Router v6 | 前端路由 |
| Vite | 建置工具 |
| 原生 CSS | 無 UI 框架，全客製化樣式 |

### 後端
| 技術 | 說明 |
|------|------|
| Node.js + Express | API 伺服器 |
| Prisma ORM | 資料庫存取層，型別安全查詢 |
| JWT | 無狀態身份驗證 |
| bcryptjs | 密碼雜湊加密 |

### 資料庫
| 技術 | 說明 |
|------|------|
| PostgreSQL 16 | 關聯式資料庫 |
| Neon | Serverless PostgreSQL，支援自動休眠 |

### 部署
| 服務 | 用途 |
|------|------|
| Vercel | 前端靜態部署，全球 CDN |
| Railway | 後端 API 部署，自動 CI/CD |
| Neon | 資料庫雲端託管 |

---

## 📁 專案結構

```
SPS/
├── frontend/                  # React + Vite 前端
│   ├── src/
│   │   ├── pages/             # 各頁面元件
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── Purchase.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Login.jsx
│   │   ├── components/        # 共用元件
│   │   │   ├── Modal.jsx
│   │   │   ├── FormField.jsx
│   │   │   ├── PartModal.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Icon.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # 登入狀態管理
│   │   └── api/
│   │       └── client.js      # API 請求封裝（自動帶 JWT）
│   └── .env.production        # 生產環境變數
│
├── backend/                   # Express + Prisma 後端
│   ├── src/
│   │   ├── routes/            # API 路由
│   │   │   ├── auth.js
│   │   │   ├── parts.js
│   │   │   ├── inventory.js
│   │   │   ├── transactions.js
│   │   │   ├── purchase.js
│   │   │   ├── counts.js
│   │   │   ├── settings.js
│   │   │   └── reports.js
│   │   ├── middlewares/
│   │   │   └── auth.js        # JWT 驗證 middleware
│   │   └── utils/
│   │       └── response.js    # 統一回應格式
│   └── prisma/
│       ├── schema.prisma      # 資料庫結構定義
│       └── seed.js            # 初始資料（角色、帳號、產線、設備）
│
└── device/
    └── devices.json           # 設備清單（產線、設備代碼、名稱）
```

---

## 🔧 本機開發

### 環境需求
- Node.js 18+
- PostgreSQL 或 Neon 帳號

### 啟動步驟

```bash
# 1. Clone 專案
git clone https://github.com/rookietommy000/SPS-Sytem.git
cd SPS-Sytem

# 2. 安裝後端依賴
cd backend
npm install

# 3. 設定環境變數
# 建立 backend/.env 並填入以下內容：
# DATABASE_URL=postgresql://...
# JWT_SECRET=your-secret-key
# JWT_EXPIRES_IN=8h
# NODE_ENV=development

# 4. 執行資料庫 migration
npx prisma migrate deploy

# 5. 匯入初始資料
npm run seed

# 6. 啟動後端（port 3000）
npm run dev

# 7. 另開終端機，安裝前端依賴
cd ../frontend
npm install

# 8. 啟動前端（port 5173）
npm run dev
```

前端開發模式下自動略過登入，直接以 admin 身份進入系統。
