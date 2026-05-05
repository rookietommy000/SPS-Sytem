-- ============================================================
-- 備品管理系統 (SPS) - PostgreSQL Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 使用者與權限
-- ============================================================

CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_no VARCHAR(30) UNIQUE,               -- 員工編號
    username    VARCHAR(100) NOT NULL UNIQUE,
    email       VARCHAR(200) UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    role_id     INT NOT NULL REFERENCES roles(id),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 產線 & 設備
-- ============================================================

CREATE TABLE production_lines (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(20) NOT NULL UNIQUE,       -- 例：2.1、3.2
    name        VARCHAR(100),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE equipment (
    id                 SERIAL PRIMARY KEY,
    production_line_id INT NOT NULL REFERENCES production_lines(id),
    code               VARCHAR(30) NOT NULL,       -- 例：DTS002
    name               VARCHAR(100),
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (production_line_id, code)
);

CREATE INDEX idx_equipment_line ON equipment(production_line_id);

-- ============================================================
-- 備品分類（類別欄：電控元件、機構件…）
-- ============================================================

CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    parent_id   INT REFERENCES categories(id),
    code        VARCHAR(30) NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,             -- 例：電控元件、機構件
    level       SMALLINT NOT NULL DEFAULT 1,
    sort_order  SMALLINT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 備品主資料
-- 對應欄位：規格描述、原廠部品採購編號、國光備品編號、部品編號、
--           品名、廠牌、型號、類別、可替代性、共用性、單位、報價單
-- ============================================================

CREATE TABLE parts (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- 三種編號
    part_no               VARCHAR(50) UNIQUE,      -- 部品編號
    manufacturer_part_no  VARCHAR(100),            -- 原廠部品採購編號
    internal_part_no      VARCHAR(50) UNIQUE,      -- 國光備品編號
    -- 基本資料
    name                  VARCHAR(200) NOT NULL,   -- 品名
    spec_description      TEXT,                    -- 規格描述
    category_id           INT REFERENCES categories(id),
    brand                 VARCHAR(100),            -- 廠牌（例：SICK、MD）
    model_no              VARCHAR(100),            -- 型號（例：WLL170-2P430）
    unit                  VARCHAR(20) NOT NULL DEFAULT '個', -- 單位
    -- 可替代性 & 共用性
    is_substitutable      BOOLEAN NOT NULL DEFAULT FALSE, -- 可替代性
    substitute_note       TEXT,                   -- 可替代說明（替代料號或品名）
    shared_equipment      TEXT,                   -- 共用性（共用的設備，例：SLA210貼標機）
    -- 庫存控管
    min_stock             INT NOT NULL DEFAULT 0, -- 最低庫存量
    -- 採購參考
    quotation_ref         VARCHAR(100),           -- 報價單號
    -- 其他
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    created_by            UUID REFERENCES users(id),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parts_part_no              ON parts(part_no);
CREATE INDEX idx_parts_internal_no          ON parts(internal_part_no);
CREATE INDEX idx_parts_manufacturer_no      ON parts(manufacturer_part_no);
CREATE INDEX idx_parts_category             ON parts(category_id);
CREATE INDEX idx_parts_name_search          ON parts USING gin(to_tsvector('simple', name));

-- ============================================================
-- 供應商
-- ============================================================

CREATE TABLE suppliers (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code          VARCHAR(30) NOT NULL UNIQUE,
    name          VARCHAR(200) NOT NULL,
    supplier_type VARCHAR(50),                    -- 例：單點、台灣、國際
    contact       VARCHAR(100),
    phone         VARCHAR(50),
    email         VARCHAR(200),
    address       TEXT,
    tax_id        VARCHAR(30),
    payment_terms VARCHAR(200),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 備品與供應商對應（一備品可有多供應商）
CREATE TABLE part_suppliers (
    part_id          UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    supplier_id      UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_part_no VARCHAR(100),               -- 供應商料號
    unit_price       NUMERIC(12, 2),
    currency         VARCHAR(10) DEFAULT 'TWD',
    is_preferred     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (part_id, supplier_id)
);

-- ============================================================
-- 庫存（每備品 × 每設備 × 每位置 一筆）
-- 位置：簡單代碼，例 F1、B2
-- ============================================================

CREATE TABLE inventory (
    id           BIGSERIAL PRIMARY KEY,
    part_id      UUID NOT NULL REFERENCES parts(id),
    equipment_id INT NOT NULL REFERENCES equipment(id),
    location     VARCHAR(20),                    -- 位置代碼，例：F1
    quantity     INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_stock    INT NOT NULL DEFAULT 0,         -- 可在此層覆蓋備品主資料的最低庫存
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (part_id, equipment_id)
);

CREATE INDEX idx_inventory_part      ON inventory(part_id);
CREATE INDEX idx_inventory_equipment ON inventory(equipment_id);

-- ============================================================
-- 庫存異動紀錄（進出記錄）
-- 對應畫面右側：人員/日期、領用 +/-
-- ============================================================

CREATE TYPE transaction_type AS ENUM (
    'STOCK_IN',       -- 入庫
    'STOCK_OUT',      -- 出庫（領用）
    'RETURN_IN',      -- 退料
    'ADJUST_PLUS',    -- 盤盈
    'ADJUST_MINUS'    -- 盤虧
);

CREATE TABLE stock_transactions (
    id             BIGSERIAL PRIMARY KEY,
    txn_no         VARCHAR(30) NOT NULL UNIQUE,
    txn_type       transaction_type NOT NULL,
    part_id        UUID NOT NULL REFERENCES parts(id),
    equipment_id   INT NOT NULL REFERENCES equipment(id),
    location       VARCHAR(20),
    quantity       INT NOT NULL,                 -- 正數=入，負數=出
    quantity_before INT NOT NULL,
    quantity_after  INT NOT NULL,
    ref_type       VARCHAR(50),                  -- 關聯單據類型
    ref_id         VARCHAR(50),
    remark         TEXT,
    operated_by    UUID REFERENCES users(id),    -- 人員
    operated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW() -- 日期
);

CREATE INDEX idx_txn_part        ON stock_transactions(part_id);
CREATE INDEX idx_txn_equipment   ON stock_transactions(equipment_id);
CREATE INDEX idx_txn_type        ON stock_transactions(txn_type);
CREATE INDEX idx_txn_operated_at ON stock_transactions(operated_at);

-- ============================================================
-- 採購申請
-- ============================================================

CREATE TYPE request_status AS ENUM (
    'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ORDERED', 'CANCELLED'
);

CREATE TABLE purchase_requests (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_no    VARCHAR(30) NOT NULL UNIQUE,
    status        request_status NOT NULL DEFAULT 'DRAFT',
    reason        TEXT,
    requested_by  UUID NOT NULL REFERENCES users(id),
    approved_by   UUID REFERENCES users(id),
    approved_at   TIMESTAMPTZ,
    reject_reason TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_request_items (
    id         BIGSERIAL PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
    part_id    UUID NOT NULL REFERENCES parts(id),
    quantity   INT NOT NULL CHECK (quantity > 0),
    remark     TEXT
);

-- ============================================================
-- 採購單
-- ============================================================

CREATE TYPE po_status AS ENUM (
    'DRAFT', 'CONFIRMED', 'PARTIAL', 'COMPLETED', 'CANCELLED'
);

CREATE TABLE purchase_orders (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_no          VARCHAR(30) NOT NULL UNIQUE,
    supplier_id    UUID NOT NULL REFERENCES suppliers(id),
    status         po_status NOT NULL DEFAULT 'DRAFT',
    order_date     DATE,
    expected_date  DATE,
    total_amount   NUMERIC(14, 2),
    currency       VARCHAR(10) DEFAULT 'TWD',
    remark         TEXT,
    created_by     UUID NOT NULL REFERENCES users(id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
    id           BIGSERIAL PRIMARY KEY,
    po_id        UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    part_id      UUID NOT NULL REFERENCES parts(id),
    quantity     INT NOT NULL CHECK (quantity > 0),
    received_qty INT NOT NULL DEFAULT 0,
    unit_price   NUMERIC(12, 2),
    remark       TEXT
);

-- ============================================================
-- 盤點
-- ============================================================

CREATE TYPE count_status AS ENUM ('OPEN', 'CLOSED', 'ADJUSTED');

CREATE TABLE inventory_counts (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    count_no     VARCHAR(30) NOT NULL UNIQUE,
    status       count_status NOT NULL DEFAULT 'OPEN',
    equipment_id INT REFERENCES equipment(id),
    count_date   DATE NOT NULL,
    remark       TEXT,
    created_by   UUID NOT NULL REFERENCES users(id),
    closed_by    UUID REFERENCES users(id),
    closed_at    TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_count_items (
    id           BIGSERIAL PRIMARY KEY,
    count_id     UUID NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
    part_id      UUID NOT NULL REFERENCES parts(id),
    equipment_id INT NOT NULL REFERENCES equipment(id),
    location     VARCHAR(20),
    system_qty   INT NOT NULL,
    counted_qty  INT,
    remark       TEXT
);

-- ============================================================
-- 操作日誌
-- ============================================================

CREATE TABLE activity_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id   VARCHAR(100),
    detail      JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_log_user    ON activity_logs(user_id);
CREATE INDEX idx_log_entity  ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_log_created ON activity_logs(created_at);

-- ============================================================
-- 自動更新 updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_parts_updated_at
    BEFORE UPDATE ON parts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_suppliers_updated_at
    BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_purchase_requests_updated_at
    BEFORE UPDATE ON purchase_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Views（彙整視圖）
-- 每個 View 含所有可用欄位，查詢時自行選取欄位與條件：
--   SELECT 欄位1, 欄位2 FROM v_inventory_full WHERE equipment_code = 'DTS002'
-- ============================================================

-- 庫存全覽（備品 × 設備 × 產線，含低庫存旗標）
CREATE OR REPLACE VIEW v_inventory_full AS
SELECT
    -- 產線 & 設備
    pl.id              AS production_line_id,
    pl.code            AS production_line_code,
    pl.name            AS production_line_name,
    eq.id              AS equipment_id,
    eq.code            AS equipment_code,
    eq.name            AS equipment_name,
    -- 備品編號（三種）
    p.id               AS part_id,
    p.part_no,
    p.manufacturer_part_no,
    p.internal_part_no,
    -- 備品基本資料
    p.name             AS part_name,
    p.spec_description,
    p.brand,
    p.model_no,
    p.unit,
    p.is_substitutable,
    p.substitute_note,
    p.shared_equipment,
    p.quotation_ref,
    -- 分類
    c.code             AS category_code,
    c.name             AS category_name,
    -- 庫存
    inv.location,
    inv.quantity,
    inv.min_stock,
    (inv.quantity <= inv.min_stock) AS is_low_stock,
    (inv.quantity = 0)              AS is_out_of_stock,
    inv.updated_at     AS inventory_updated_at
FROM inventory inv
JOIN parts     p   ON p.id   = inv.part_id
JOIN equipment eq  ON eq.id  = inv.equipment_id
JOIN production_lines pl ON pl.id = eq.production_line_id
LEFT JOIN categories c ON c.id = p.category_id;

-- 低庫存警示（直接過濾）
CREATE OR REPLACE VIEW v_low_stock AS
SELECT *
FROM v_inventory_full
WHERE is_low_stock = TRUE
ORDER BY production_line_code, equipment_code, part_name;

-- 進出記錄全覽（含操作人員姓名）
CREATE OR REPLACE VIEW v_stock_history AS
SELECT
    txn.id,
    txn.txn_no,
    txn.txn_type,
    txn.operated_at,
    -- 人員
    u.employee_no      AS operator_employee_no,
    u.full_name        AS operator_name,
    -- 產線 & 設備
    pl.code            AS production_line_code,
    eq.code            AS equipment_code,
    eq.name            AS equipment_name,
    txn.location,
    -- 備品
    p.part_no,
    p.internal_part_no,
    p.name             AS part_name,
    p.brand,
    p.model_no,
    p.unit,
    -- 異動數量
    txn.quantity,
    txn.quantity_before,
    txn.quantity_after,
    txn.remark
FROM stock_transactions txn
JOIN parts        p   ON p.id   = txn.part_id
JOIN equipment    eq  ON eq.id  = txn.equipment_id
JOIN production_lines pl ON pl.id = eq.production_line_id
LEFT JOIN users   u   ON u.id   = txn.operated_by;

-- 盤點用清單（列出所有備品的系統帳面數量，供人員對照填寫）
CREATE OR REPLACE VIEW v_count_sheet AS
SELECT
    pl.code            AS production_line_code,
    eq.id              AS equipment_id,
    eq.code            AS equipment_code,
    eq.name            AS equipment_name,
    p.id               AS part_id,
    p.part_no,
    p.internal_part_no,
    p.name             AS part_name,
    p.brand,
    p.model_no,
    p.spec_description,
    p.unit,
    c.name             AS category_name,
    inv.location,
    inv.quantity       AS system_qty,
    inv.min_stock,
    NULL::INT          AS counted_qty,   -- 盤點時填入，預設空白
    NULL::TEXT         AS count_remark
FROM inventory inv
JOIN parts        p   ON p.id   = inv.part_id
JOIN equipment    eq  ON eq.id  = inv.equipment_id
JOIN production_lines pl ON pl.id = eq.production_line_id
LEFT JOIN categories  c ON c.id  = p.category_id
ORDER BY pl.code, eq.code, c.name, p.name;

-- 供應商備品對應（查詢某備品的所有供應商）
CREATE OR REPLACE VIEW v_part_supplier AS
SELECT
    p.part_no,
    p.internal_part_no,
    p.name             AS part_name,
    p.brand,
    p.model_no,
    s.code             AS supplier_code,
    s.name             AS supplier_name,
    s.supplier_type,
    s.contact,
    s.phone,
    ps.supplier_part_no,
    ps.unit_price,
    ps.currency,
    ps.is_preferred
FROM part_suppliers ps
JOIN parts    p ON p.id = ps.part_id
JOIN suppliers s ON s.id = ps.supplier_id;
