export const SPARE_PARTS = [
  { id: 'SP001', status: '需採購', category: '電控元件', name: 'OPTICAL FIBRE PHOTOCELL', nameZh: '光纖感測器', brand: 'SICK', model: 'WLL170-2P430 6029 514', stock: 0, minStock: 2, supplier: 'MG(里壱)', unitPrice: 4850, location: 'F1-A03',
    spec: 'NPN 集極開路，感測距離 200mm，12-24VDC', originPN: 'E32077C24210', fcmPN: '', partNo: 'B71.1, B71.2, B82.3, B82.4', replaceable: '無', sharedLine: 'SLA210貼標機',
    history: [{ user: '林易賢', date: '260430', delta: '+3' }, { user: '林易賢', date: '260501', delta: '-3' }], line: '2.1', equipment: 'DTS002' },

  { id: 'SP002', status: '需採購', category: '電控元件', name: 'OPTICAL FIBRE PHOTOCELL', nameZh: '光纖感測器', brand: 'SICK', model: 'WLL170-2P430 6029 514', stock: 0, minStock: 2, supplier: 'XXX(台廠)', unitPrice: 3960, location: 'F1-A03',
    spec: 'NPN 集極開路，感測距離 200mm，12-24VDC', originPN: 'E32077C24210', fcmPN: '', partNo: 'B71.1, B71.2, B82.3, B82.4', replaceable: '無', sharedLine: 'SLA210貼標機',
    history: [], line: '2.1', equipment: 'DTS002' },

  { id: 'SP003', status: '正常', category: '電控元件', name: 'PHOTOCELL', nameZh: '光電傳感器', brand: 'MD', model: 'SP2/0P-1E', stock: 3, minStock: 2, supplier: 'MD原廠', unitPrice: 2280, location: 'F1-B12',
    spec: 'PNP 常開，感測距離 300mm，10-30VDC', originPN: 'E32012024270', fcmPN: '', partNo: 'B23.6, B32.4, B34.4, B36.4', replaceable: '無', sharedLine: '無',
    history: [{ user: '陳冠宇', date: '260415', delta: '+5' }, { user: '王怡君', date: '260428', delta: '-2' }], line: '2.1', equipment: 'DTS002' },

  { id: 'SP004', status: '正常', category: '氣動元件', name: 'AIR CYLINDER', nameZh: '氣壓缸', brand: 'SMC', model: 'CDQ2B25-30DZ', stock: 8, minStock: 3, supplier: 'SMC台灣', unitPrice: 1860, location: 'F1-C05',
    spec: '缸徑 25mm，行程 30mm，雙作動，磁石型', originPN: 'CDQ2B25-30DZ', fcmPN: 'FCM-AIR-0021', partNo: 'C12.1, C12.2', replaceable: 'CDQ2B25-30DCZ', sharedLine: 'SLA210, DTS002',
    history: [{ user: '黃志明', date: '260320', delta: '+10' }, { user: '陳冠宇', date: '260418', delta: '-2' }], line: '2.1', equipment: 'DTS002' },

  { id: 'SP005', status: '低庫存', category: '氣動元件', name: 'SOLENOID VALVE', nameZh: '電磁閥', brand: 'SMC', model: 'SY5120-5DZD-01', stock: 1, minStock: 3, supplier: 'SMC台灣', unitPrice: 2450, location: 'F1-C08',
    spec: '5口2位，DC24V，Rc1/8 接口，回彈型', originPN: 'SY5120-5DZD-01', fcmPN: 'FCM-VAL-0034', partNo: 'V03.1, V03.2', replaceable: 'SY5120-5LZD-01', sharedLine: 'SLA210貼標機, DTS002',
    history: [{ user: '王怡君', date: '260502', delta: '-2' }], line: '2.1', equipment: 'DTS002' },

  { id: 'SP006', status: '正常', category: '機械元件', name: 'TIMING BELT', nameZh: '同步皮帶', brand: 'GATES', model: '5GT-450-15', stock: 12, minStock: 4, supplier: '台灣蓋茲', unitPrice: 720, location: 'F2-A02',
    spec: '節距 5mm，齒數 90T，寬度 15mm，氯丁橡膠', originPN: '5GT-450-15', fcmPN: 'FCM-MEC-0102', partNo: 'M08.1', replaceable: '無', sharedLine: '無',
    history: [{ user: '黃志明', date: '260205', delta: '+20' }, { user: '黃志明', date: '260411', delta: '-8' }], line: '3.1', equipment: 'PKG101' },

  { id: 'SP007', status: '正常', category: '機械元件', name: 'BEARING', nameZh: '深溝滾珠軸承', brand: 'NSK', model: '6204ZZ', stock: 24, minStock: 6, supplier: '台灣恩斯克', unitPrice: 180, location: 'F2-A05',
    spec: '內徑 20mm，外徑 47mm，寬度 14mm，雙側鋼蓋', originPN: '6204ZZ', fcmPN: 'FCM-MEC-0301', partNo: 'M02.3, M02.4', replaceable: '6204DDU', sharedLine: '所有產線',
    history: [], line: '3.1', equipment: 'PKG101' },

  { id: 'SP008', status: '需採購', category: '電控元件', name: 'PROXIMITY SENSOR', nameZh: '近接感測器', brand: 'OMRON', model: 'E2B-M12KS04-WP-B1', stock: 0, minStock: 2, supplier: 'OMRON台灣', unitPrice: 1320, location: 'F1-A07',
    spec: 'M12 螺紋，感測距離 4mm，NPN 常開，防水 IP67', originPN: 'E2B-M12KS04-WP-B1', fcmPN: 'FCM-SEN-0055', partNo: 'B45.1, B45.2', replaceable: '無', sharedLine: 'DTS002',
    history: [{ user: '陳冠宇', date: '260429', delta: '-2' }], line: '2.1', equipment: 'DTS002' },

  { id: 'SP009', status: '低庫存', category: '電控元件', name: 'SERVO MOTOR', nameZh: '伺服馬達', brand: 'MITSUBISHI', model: 'HG-KR43', stock: 1, minStock: 2, supplier: '三菱電機', unitPrice: 28500, location: 'F2-D01',
    spec: '額定輸出 400W，額定轉速 3000rpm，編碼器 22bit', originPN: 'HG-KR43', fcmPN: 'FCM-MOT-0011', partNo: 'M-SRV-04', replaceable: '無', sharedLine: 'PKG101',
    history: [{ user: '林易賢', date: '260101', delta: '+2' }, { user: '王怡君', date: '260420', delta: '-1' }], line: '3.1', equipment: 'PKG101' },

  { id: 'SP010', status: '正常', category: '耗材', name: 'GREASE', nameZh: '潤滑油脂 80g', brand: 'THK', model: 'AFA', stock: 18, minStock: 5, supplier: 'THK台灣', unitPrice: 350, location: 'F2-X01',
    spec: '鋰基脂，NLGI 2號，適用溫度 -20~120°C，80g 裝', originPN: 'AFA-80G', fcmPN: 'FCM-CON-0008', partNo: '通用', replaceable: 'AFB-70G', sharedLine: '所有產線',
    history: [{ user: '黃志明', date: '260301', delta: '+30' }, { user: '黃志明', date: '260410', delta: '-12' }], line: '3.1', equipment: 'PKG101' },

  { id: 'SP011', status: '正常', category: '電控元件', name: 'PLC MODULE', nameZh: 'PLC擴充模組', brand: 'MITSUBISHI', model: 'FX5-16EX/ES', stock: 4, minStock: 1, supplier: '三菱電機', unitPrice: 6800, location: 'F1-E02',
    spec: '16點數位輸入，DC24V，漏型/源型共用，FX5系列', originPN: 'FX5-16EX/ES', fcmPN: 'FCM-PLC-0003', partNo: 'E-PLC-12', replaceable: '無', sharedLine: 'SLA210貼標機',
    history: [], line: '2.1', equipment: 'SLA210' },

  { id: 'SP012', status: '需採購', category: '耗材', name: 'LABEL ROLL', nameZh: '標籤卷材', brand: 'SLA', model: 'L100-5K', stock: 0, minStock: 10, supplier: '佑立科技', unitPrice: 480, location: 'F1-X05',
    spec: '寬度 100mm，長度 5000張/捲，熱感應紙，防油', originPN: 'L100-5K', fcmPN: 'FCM-CON-0099', partNo: '通用', replaceable: 'L100-3K', sharedLine: 'SLA210貼標機',
    history: [{ user: '王怡君', date: '260503', delta: '-5' }], line: '2.1', equipment: 'SLA210' },
]

export const LINES      = ['全部', '2.1', '3.1', '4.2']
export const EQUIPMENT  = ['全部', 'DTS002', 'SLA210', 'PKG101', 'CNV301']
export const CATEGORIES = ['全部', '電控元件', '氣動元件', '機械元件', '耗材']
