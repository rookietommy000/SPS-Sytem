# 備品管理系統 (SPS — Spare Parts System)

> 專為製造業設計的備品庫存管理平台，支援備品建檔、庫存異動、領用申請、採購管理與盤點作業。

---

## 線上網址

| 服務 | 網址 |
|------|------|
| **前端** | https://sps-sytem.vercel.app |
| **後端 API** | https://sps-sytem-production-a7a3.up.railway.app |

---

## 功能模組

### 儀表板
- 庫存總覽統計（備品數、低庫存警示、待處理申請）
- 近期異動紀錄

### 備品管理
- 備品建檔（料號、中文名、規格、分類、供應商）
- 設備對應、庫存上下限設定
- 搜尋、篩選、分頁

### 庫存異動
- 入庫、出庫、領用紀錄
- 異動歷史查詢

### 領用申請
- 申請單建立與審核流程
- 申請狀態追蹤

### 採購管理
- 採購單建立
- 採購進度追蹤

### 盤點作業
- 盤點單建立
- 實盤數量登錄與差異計算

### 報表
- 庫存報表、異動統計

### 系統設定
- 產線管理
- 設備管理
- 備品分類管理
- 供應商管理
- 使用者與權限管理

---

## 技術架構

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
| Prisma ORM | 資料庫存取層 |
| JWT | 身份驗證 |
| bcryptjs | 密碼加密 |

### 資料庫
| 技術 | 說明 |
|------|------|
| PostgreSQL 16 | 關聯式資料庫 |
| Neon | Serverless PostgreSQL 雲端服務 |

### 部署
| 服務 | 用途 |
|------|------|
| Vercel | 前端靜態部署 |
| Railway | 後端 API 部署 |
| Neon | 資料庫託管 |

---

## 專案結構

```
SPS/
├── frontend/          # React + Vite 前端
│   ├── src/
│   │   ├── pages/     # 各頁面元件
│   │   ├── components/# 共用元件（Modal、FormField、Icon...）
│   │   ├── context/   # AuthContext（登入狀態管理）
│   │   └── api/       # API 請求封裝
│   └── .env.production
│
├── backend/           # Express + Prisma 後端
│   ├── src/
│   │   ├── routes/    # API 路由（auth, parts, inventory...）
│   │   ├── middlewares/# 驗證、錯誤處理
│   │   └── utils/     # 共用工具
│   └── prisma/
│       ├── schema.prisma  # 資料庫結構定義
│       └── seed.js        # 初始資料匯入
│
└── device/
    └── devices.json   # 設備清單（產線、設備代碼、名稱）
```

---

## API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/v1/auth/login` | 登入 |
| GET | `/api/v1/parts` | 備品列表 |
| POST | `/api/v1/parts` | 新增備品 |
| GET | `/api/v1/inventory` | 庫存列表 |
| POST | `/api/v1/transactions` | 建立庫存異動 |
| GET | `/api/v1/purchase` | 採購單列表 |
| GET | `/api/v1/counts` | 盤點單列表 |
| GET | `/api/v1/settings/lines` | 產線列表 |
| GET | `/api/v1/settings/equipment` | 設備列表 |
| GET | `/api/v1/settings/categories` | 分類列表 |
| GET | `/api/v1/settings/suppliers` | 供應商列表 |
| GET | `/api/v1/settings/users` | 使用者列表 |
| GET | `/health` | 健康檢查 |

---

## 權限角色

| 角色 | 說明 |
|------|------|
| `admin` | 系統管理員，全部權限 |
| `warehouse` | 倉管人員，可執行入出庫 |
| `requester` | 領用申請人員，可提出申請 |
| `viewer` | 唯讀檢視 |

---

## 本機開發

### 環境需求
- Node.js 18+
- PostgreSQL 或 Neon 帳號

### 啟動步驟

```bash
# 1. 安裝後端依賴
cd backend
npm install

# 2. 設定環境變數
cp .env.example .env
# 編輯 .env 填入 DATABASE_URL、JWT_SECRET

# 3. 執行資料庫 migration 與 seed
npx prisma migrate deploy
npm run seed

# 4. 啟動後端
npm run dev

# 5. 安裝前端依賴（另開終端機）
cd frontend
npm install

# 6. 啟動前端
npm run dev
```

前端預設連線 `http://localhost:3000/api/v1`，後端預設跑在 port 3000。
