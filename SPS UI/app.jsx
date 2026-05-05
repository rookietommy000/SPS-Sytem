// 主應用：用 design canvas 包三個變化 + tweaks panel
const { useState: useS } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "navLayout": "auto",
  "rowDensity": "standard",
  "fontSize": 13,
  "primaryColor": "#1F6E43"
}/*EDITMODE-END*/;

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // 套用 Tweaks 到全域樣式
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand', tweaks.primaryColor);
    root.style.setProperty('--app-fz', tweaks.fontSize + 'px');
    const rh = tweaks.rowDensity === 'compact' ? 6 : tweaks.rowDensity === 'comfy' ? 14 : 10;
    root.style.setProperty('--row-pad', rh + 'px');
  }, [tweaks]);

  return (
    <>
      <style>{`
        body, html { margin: 0; padding: 0; font-size: var(--app-fz, 13px); }
        body { font-family: ${FONT_STACK}; }
        * { box-sizing: border-box; }
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: #F4F6F3; }
        ::-webkit-scrollbar-thumb { background: #C6CFC8; border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: #A8B5AC; }
      `}</style>

      <DesignCanvas
        title="備品管理系統 (SPS) · 介面探索"
        subtitle="三種版型 × 桌機 / 平板 / 手機 RWD · 綠色工廠風"
      >
        <DCSection id="overview" title="A. 桌機版型 (1280px)" subtitle="三個主要設計方向比較">
          <DCArtboard id="v1" label="V1 · 經典 ERP 表格 + Modal 詳情" width={1280} height={860}>
            <V1/>
          </DCArtboard>
          <DCArtboard id="v2" label="V2 · 卡片式現代化 + 側邊抽屜" width={1280} height={860}>
            <V2/>
          </DCArtboard>
          <DCArtboard id="v3" label="V3 · Dashboard 駕駛艙 + 展開行 / 詳情頁" width={1280} height={860}>
            <V3/>
          </DCArtboard>
        </DCSection>

        <DCSection id="tablet" title="B. 平板 (834px)" subtitle="現場人員觸控操作的中等寬度">
          <DCArtboard id="v1-tab" label="V1 在平板尺寸" width={834} height={1100}>
            <V1/>
          </DCArtboard>
          <DCArtboard id="v2-tab" label="V2 在平板尺寸" width={834} height={1100}>
            <V2/>
          </DCArtboard>
          <DCArtboard id="v3-tab" label="V3 在平板尺寸" width={834} height={1100}>
            <V3/>
          </DCArtboard>
        </DCSection>

        <DCSection id="mobile" title="C. 手機 (390 × 780)" subtitle="專為行動裝置重新設計：底部 Tab Bar、Bottom Sheet、QR FAB">
          <DCArtboard id="v1-m" label="M1 · 經典清單 + Bottom Sheet" width={390} height={780}>
            <M1/>
          </DCArtboard>
          <DCArtboard id="v2-m" label="M2 · 卡片現代化（推薦）" width={390} height={780}>
            <M2/>
          </DCArtboard>
          <DCArtboard id="v3-m" label="M3 · Dashboard 駕駛艙" width={390} height={780}>
            <M3/>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection title="版型">
          <TweakRadio
            label="導覽版型"
            value={tweaks.navLayout}
            onChange={v => setTweak('navLayout', v)}
            options={[
              { value: 'auto', label: '依版型' },
              { value: 'top', label: '頂部選單' },
              { value: 'side', label: '側邊欄' },
            ]}
          />
          <TweakRadio
            label="行高密度"
            value={tweaks.rowDensity}
            onChange={v => setTweak('rowDensity', v)}
            options={[
              { value: 'compact', label: '緊湊' },
              { value: 'standard', label: '標準' },
              { value: 'comfy', label: '寬鬆' },
            ]}
          />
        </TweakSection>
        <TweakSection title="字體">
          <TweakSlider
            label="字級大小"
            value={tweaks.fontSize}
            onChange={v => setTweak('fontSize', v)}
            min={11} max={17} step={1}
            unit="px"
          />
        </TweakSection>
        <TweakSection title="主題色">
          <TweakColor
            label="品牌色"
            value={tweaks.primaryColor}
            onChange={v => setTweak('primaryColor', v)}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {[
              { c: '#1F6E43', n: '森林綠' },
              { c: '#2E7D32', n: '工業綠' },
              { c: '#0D6E6E', n: '青綠' },
              { c: '#1565C0', n: '商務藍' },
              { c: '#5D4037', n: '工廠棕' },
            ].map(p => (
              <button key={p.c} onClick={() => setTweak('primaryColor', p.c)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 6,
                border: tweaks.primaryColor === p.c ? `2px solid ${p.c}` : '1px solid #ddd',
                background: '#fff', cursor: 'pointer', fontSize: 11,
              }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: p.c }}/>
                {p.n}
              </button>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
