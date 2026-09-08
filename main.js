// 师者印象墙（黑板 + 粉笔 + 诗意怀旧版）
// 纯 DOM + CSS

// ============= 1. 配置 =============

// 信纸预设色（5 种 + 1 个自定义"轮盘"入口）
const PAPER_COLORS = [
  { name: '米白', hex: '#fdf6e3' },
  { name: '粉便条', hex: '#ffd6d6' },
  { name: '蓝便条', hex: '#cfe5f0' },
  { name: '绿便条', hex: '#d6e9c6' },
  { name: '黄便条', hex: '#fbe9b6' },
];

// 自定义信纸色：唯一 key（实际颜色用 localStorage 持久化）
const CUSTOM_PAPER_KEY = 'impression_custom_paper';

// 9 支粉笔：纯白/纯黑 + 7 种彩色
const CHALK_COLORS = [
  { id: 'white',   hex: '#ffffff', label: '纯白' },
  { id: 'black',   hex: '#1a1a1a', label: '纯黑' },
  { id: 'ink',     hex: '#3a2818', label: '墨黑' },
  { id: 'red',     hex: '#a83232', label: '朱红' },
  { id: 'orange',  hex: '#c8601f', label: '橙' },
  { id: 'yellow',  hex: '#c89e1f', label: '暖黄' },
  { id: 'green',   hex: '#4a7a2f', label: '草绿' },
  { id: 'blue',    hex: '#2d5a8a', label: '青蓝' },
  { id: 'purple',  hex: '#6b4a8a', label: '淡紫' },
];

// 常用表情（点击插入到光标位置）
const QUICK_EMOJI = ['❤️', '✨', '🌸', '⭐', '📚', '🍎', '☀️', '🙏', '🎓', '🌷', '💪', '😊'];

// ============= 黑板氛围：9 学科 + 课程池（随机轮播）=============
// 每个学科的丰富内容池。JS 在 init 时随机抽取，每页/每次刷新内容都不同。
const SUBJECT_POOLS = {
  chinese: [
    '床前明月光', '春眠不觉晓', '白日依山尽', '黄河入海流',
    '会当凌绝顶', '一览众山小', '举头望明月', '低头思故乡',
    '为中华之崛起而读书', '天生我材必有用', '长风破浪会有时',
    '海内存知己', '天涯若比邻', '学而不思则罔', '思而不学则殆',
    '落霞与孤鹜齐飞', '秋水共长天一色',
    '先天下之忧而忧', '后天下之乐而乐',
    '斯是陋室，惟吾德馨', '不以物喜，不以己己',
    '温故而知新', '可以为师矣', '三人行必有我师',
    '天行健，君子以自强不息', '地势坤，君子以厚德载物',
  ],
  math: [
    'a² + b² = c²', 'f(x) = sin x', 'sin²θ + cos²θ = 1',
    'e^(iπ) + 1 = 0', 'f(x) = ax² + bx + c', 'y = k/x',
    'y = logₐx', 'lim(x→0) sinx/x = 1', 'lim(1+1/n)ⁿ = e',
    'sin(α+β) = sinαcosβ + cosαsinβ', 'A ∩ B = ∅',
    'A ∪ B = U', '△ABC ≌ △DEF', 'AB ⊥ CD',
    '∫₀¹ x² dx = 1/3', '∂f/∂x = 0', '∇·E = ρ/ε₀',
    'φ(x) = 1/√(2π) · e^(-x²/2)',
    'P(A|B) = P(B|A)·P(A)/P(B)',
    'cos²α + sin²α = 1', 'tan(α+β)',
    '向量 a · b = |a||b|cosθ',
  ],
  english: [
    'Knowledge is power', 'Time is money', 'Practice makes perfect',
    'How are you?', 'Good morning!', 'Once upon a time',
    'To be or not to be', 'Actions speak louder than words',
    'A B C / a b c', 'The early bird catches the worm',
    'Where there is a will, there is a way', 'No pain, no gain',
    'East or west, home is the best', 'Live and learn',
    'All that glitters is not gold', 'Better late than never',
    'A friend in need is a friend indeed', 'Time and tide wait for no man',
    'Practice makes perfect', 'Never say die',
    'Rome was not built in a day', 'A good beginning is half done',
  ],
  physics: [
    'F = ma', 'E = mc²', 'v = s/t', 'P = UI', 'W = Fs',
    'p = mv', 'F = Gm₁m₂/r²', 'PV = nRT', 'Q = cmΔt',
    'E = hν', 'λ = h/p', 'U = IR', 'F = qE', 'F = BIL',
    'ω = 2πf', 'T = 2π√(L/g)', 'I = P/U', 'η = W/Q',
    'a = Δv/Δt', 's = ½(v₀+v)t',
    'Eₖ = ½mv²', 'Eₚ = mgh',
  ],
  chemistry: [
    'H₂O', 'NaCl', 'CO₂', 'O₂', 'H₂SO₄', 'NaOH', 'HCl',
    '2H₂ + O₂ = 2H₂O', 'H₂O + CO₂ = H₂CO₃',
    'NaOH + HCl = NaCl + H₂O', 'CaCO₃ → CaO + CO₂↑',
    'N₂ + 3H₂ ⇌ 2NH₃', 'pH = -log[H⁺]',
    'PV = nRT', 'n = m/M', 'c = n/V',
    'Fe + CuSO₄ = FeSO₄ + Cu', '2Na + 2H₂O = 2NaOH + H₂↑',
    'Zn + H₂SO₄ = ZnSO₄ + H₂↑', 'AgNO₃ + NaCl = AgCl↓ + NaNO₃',
  ],
  biology: [
    'DNA', 'RNA', 'A T C G', 'A U C G', '细胞', '染色体',
    '蛋白质', '酶', '光合作用', '呼吸作用', '有丝分裂',
    '减数分裂', '线粒体', '叶绿体', '核糖体', '中心体',
    'ATP ⇌ ADP + Pi', 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
    'DNA 双螺旋', '碱基互补配对', '基因表达',
    '翻译 · 转录', '酶的专一性',
  ],
  history: [
    '1949.10.1', '1840 鸦片战争', '1911 辛亥革命', '1921 建党',
    '1937 抗战', '1978 改革开放', '1842 南京条约',
    '1900 八国联军', '《史记》', '《资治通鉴》', '孔子',
    '秦始皇', '贞观之治', '丝绸之路', '洋务运动',
    '五四运动 1919', '长征 1934-1936', '遵义会议 1935',
    '开国大典', '一五计划 1953', '十一届三中全会',
  ],
  geography: [
    'N E S W', '东南西北', '30°N', '23.5°', '116°E', '40°N',
    '长江 6300km', '黄河 5464km', '喜马拉雅', '珠穆朗玛 8848',
    '季风气候', '洋流', '大气环流', '地中海气候',
    '温带季风', '热带雨林', '东八区 UTC+8',
    '黄赤交角 23.5°', '自转 24h', '公转 365d',
    '黑潮', '秘鲁寒流', '西风带',
  ],
  politics: [
    '为人民服务', '实事求是', '实践是检验真理的唯一标准',
    '社会主义核心价值观', '富强 民主 文明 和谐',
    '自由 平等 公正 法治', '爱国 敬业 诚信 友善',
    '中国梦', '一国两制', '可持续发展',
    '绿水青山就是金山银山', '人类命运共同体',
    '以人民为中心', '新发展理念', '供给侧结构性改革',
    '三个代表', '科学发展观', '新时代',
  ],
};

// 课题（今日课）池
const TOPIC_POOLS = {
  chinese: ['第3课《背影》', '第5课《滕王阁序》', '古诗词鉴赏', '文言文复习', '现代文阅读', '第1课《沁园春·长沙》', '第4课《荷塘月色》', '议论文写作'],
  math: ['函数的概念', '函数的单调性', '指数函数', '对数函数', '三角函数', '平面向量', '数列', '不等式', '立体几何', '解析几何', '导数与微分'],
  english: ['Unit 2 English around the world', 'Module 3 Music', 'Unit 5 Travelling abroad', '定语从句', '阅读理解训练', 'Module 1 Deep South', 'Unit 4 Body language', '虚拟语气'],
  physics: ['牛顿第一定律', '匀变速直线运动', '力的分解', '万有引力', '电场强度', '欧姆定律', '磁场', '电磁感应', '光的折射', '原子物理'],
  chemistry: ['氧气的性质', '水的组成', '元素周期律', '化学键', '化学反应速率', '原电池', '电解原理', '酸碱中和', '氧化还原反应'],
  biology: ['细胞的基本结构', '有丝分裂', '减数分裂', 'DNA 复制', '基因表达', '遗传规律', '生态系统', '光合作用', '呼吸作用'],
  history: ['辛亥革命', '五四运动', '抗日战争', '新中国成立', '改革开放', '工业革命', '美国独立战争', '法国大革命', '冷战', '丝绸之路'],
  geography: ['中国气候', '中国的河流', '中国地形', '全球气候变化', '世界海洋', '城市化', '农业地域类型', '工业区位', '人口与城市'],
  politics: ['中华文化', '人民当家作主', '中国共产党的领导', '社会主义核心价值观', '改革开放', '可持续发展', '国际关系', '唯物论', '辩证法'],
};

// 值日生姓名池（常见高中姓名）
const NAMES_POOL = [
  '张明', '李华', '王芳', '赵强', '刘洋', '陈静', '杨帆', '黄磊',
  '周雪', '吴明', '徐婷婷', '孙浩', '马超', '朱丽', '胡军', '林涛',
  '何敏', '高峰', '罗静', '梁宇', '宋佳', '韩雪', '冯磊', '邓超',
  '曹颖', '彭涛', '曾子墨', '萧雅', '田园', '蒋欣', '沈月', '韩冰',
];

// 倒计时事件池
const COUNTDOWN_POOL = [
  { event: '月 考', days: [3, 5, 7, 10, 14, 21] },
  { event: '期 中', days: [7, 12, 18, 25, 30] },
  { event: '期 末', days: [14, 21, 30, 45, 60] },
  { event: '国 庆', days: [5, 12, 21, 30] },
  { event: '中 秋', days: [3, 7, 15, 28] },
  { event: '元 旦', days: [7, 14, 30, 45] },
  { event: '寒 假', days: [10, 20, 30, 45, 60] },
  { event: '运动 会', days: [3, 5, 7, 14, 21] },
  { event: '高 考', days: [60, 100, 200, 286, 365] },
  { event: '春 游', days: [3, 5, 7] },
];

// 作业池
const HOMEWORK_POOL = [
  '数 学 P.23 · 语 文 背 诵', '英 语 单 词 30 个 · 物 理 P.15',
  '化 学 写 方 程 式 · 历 史 答 卷', '生 物 绘 图 · 语 文 作 文',
  '数 学 练 习 册 · 英 语 翻 译', '物 理 实 验 报 告 · 化 学 习 题',
  '文 综 答 卷 · 理 综 模 拟', '政 治 简 答 · 地 理 看 图',
  '数 学 卷 子 · 物 理 错 题', '语 文 周 记 · 英 语 听 力',
];

// 5 节课的固定顺序（上午 5 节：语数英理化）
const FIXED_PERIOD_SUBJECTS = ['chinese', 'math', 'english', 'physics', 'chemistry'];

// 工具：从池里随机抽一个
function pickOne(pool) {
  if (!pool || pool.length === 0) return '';
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// 随机抽取并填到黑板
function randomizeBlackboard() {
  // 1) 学科涂鸦（按 data-subject 从对应池抽）
  document.querySelectorAll('.chalk-subject[data-subject]').forEach(el => {
    const subj = el.dataset.subject;
    const pool = SUBJECT_POOLS[subj];
    if (pool) el.textContent = pickOne(pool);
  });

  // 2) 课题（按 data-subject 主学科抽）
  document.querySelectorAll('.chalk-topic[data-subject]').forEach(el => {
    const subj = el.dataset.subject;
    const pool = TOPIC_POOLS[subj];
    const subjLabel = SUBJECT_LABEL[subj] || subj;
    if (pool) {
      const topic = pickOne(pool);
      el.innerHTML = `今 日 课 题 · <strong>${subjLabel} ${topic}</strong>`;
    }
  });

  // 3) 课程表 5 节课
  document.querySelectorAll('.chalk-card-period').forEach((row, i) => {
    if (i >= FIXED_PERIOD_SUBJECTS.length) return;
    const subj = FIXED_PERIOD_SUBJECTS[i];
    const subjLabel = SUBJECT_LABEL[subj];
    const topicPool = TOPIC_POOLS[subj];
    const topic = topicPool ? pickOne(topicPool) : '';
    // 数字 + 学科 + 课题
    const num = row.querySelector('.num');
    const subjEl = row.querySelector('.subj');
    const topicEl = row.querySelector('.topic');
    if (num) num.textContent = String(i + 1);
    if (subjEl) subjEl.textContent = subjLabel;
    if (topicEl) topicEl.textContent = topic;
  });

  // 4) 值日生（2 行 4 人 = 2 行）
  const dutyLines = document.querySelectorAll('.chalk-card-duty .duty-line');
  if (dutyLines.length > 0) {
    // 抽 2*2 = 4 个不重复的名字
    const shuffled = [...NAMES_POOL].sort(() => Math.random() - 0.5);
    const names = shuffled.slice(0, dutyLines.length * 2);
    dutyLines.forEach((line, i) => {
      const a = names[i * 2] || '';
      const b = names[i * 2 + 1] || '';
      line.textContent = a && b ? `${a} · ${b}` : (a || b);
    });
  }

  // 5) 倒计时
  document.querySelectorAll('.chalk-countdown').forEach(el => {
    const cd = pickOne(COUNTDOWN_POOL);
    const days = pickOne(cd.days);
    el.innerHTML = `距 ${cd.event} 还 有 <span class="num">${days}</span> 天`;
  });

  // 6) 作业 / 通知
  document.querySelectorAll('.chalk-notice .notice-content').forEach(el => {
    el.textContent = pickOne(HOMEWORK_POOL);
  });
}

// 学科 label（中文）
const SUBJECT_LABEL = {
  chinese: '语 文', math: '数 学', english: '英 语',
  physics: '物 理', chemistry: '化 学', biology: '生 物',
  history: '历 史', geography: '地 理', politics: '政 治',
};

// 写效果/字体颜色用 chalkColor
// 兼容旧 localStorage：老用户可能存 #3a2818 / #a83232 等
// bindChalkBox 会从 #chalk-box 里读，所以 PAPER_COLORS 改颜色不会丢

// ============= 2. 状态 =============
const state = {
  currentPage: 'welcome',
  pageHistory: ['welcome'],   // 页面栈，支持返回
  currentTeacher: null,
  selectedColor: PAPER_COLORS[0].hex,  // 信纸底色
  isCustomPaper: false,                 // 是否自定义
  chalkColor: '#3a2818',                // 当前粉笔颜色（=字体颜色）
  pendingDeleteIdx: null,
  pendingDeleteTeacher: null,           // 待删除老师名
  pendingImage: null,                   // 当前待附图（base64 dataURL）
  snapshot: null,                       // 快照模式：链接/导出文件带来的这面墙（只读）
};

// ============= 3. 数据持久化 =============
function loadTeachers() {
  try {
    const raw = localStorage.getItem('impression_teachers');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('数据格式异常');
    // 健壮性：剔除空名 / 缺 notes 字段的脏数据
    return parsed.filter(t => t && typeof t.name === 'string' && t.name && Array.isArray(t.notes));
  } catch (e) {
    // 数据损坏：清掉副本 + 提示用户（不静默覆盖）
    try { localStorage.removeItem('impression_teachers'); } catch (e2) {}
    console.warn('[impression-wall] 本地数据已损坏，已重置。', e);
    if (!state._dataCorruptedWarned) {
      state._dataCorruptedWarned = true;
      setTimeout(() => alert('本 地 存 储 数 据 异 已 重 置'), 100);
    }
    return [];
  }
}

// 已弃用：保留空函数为向后兼容（不再做"清演示数据"操作，因为新用户默认就是空）
function purgeSeedTeachers() {
  // no-op
}

function saveTeachers(teachers) {
  // S3 修复：捕获 quota 异常 + 提示用户
  try {
    localStorage.setItem('impression_teachers', JSON.stringify(teachers));
    return true;
  } catch (e) {
    if (e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014)) {
      // 计算当前便签数，提示最老的可删
      const totalNotes = teachers.reduce((n, t) => n + (t.notes?.length || 0), 0);
      const withImg = teachers.reduce((n, t) => n + (t.notes || []).filter(x => x.image).length, 0);
      alert(`本 地 存 储 已 满\n\n已 有 ${totalNotes} 封 来 信（${withImg} 张 附 图）\n建 议 抹 去 几 封 旧 的、或 选 小 一 点 的 贴 纸`);
    } else if (e && e.name === 'SecurityError') {
      // 隐私模式
      console.warn('[impression-wall] localStorage 被禁用（隐私模式）', e);
    } else {
      console.error('[impression-wall] 保存失败', e);
    }
    return false;
  }
}

function getCurrentNotes() {
  if (isSnapshotMode()) return state.snapshot.notes;
  const teachers = loadTeachers();
  const t = teachers.find(x => x.name === state.currentTeacher);
  return t ? t.notes : [];
}

// 快照模式只读守卫：拦截会改动本机数据或误删来信的操作
function snapshotGuard(msg) {
  if (!isSnapshotMode()) return false;
  if (msg) {
    const toast = document.getElementById('wall-toast');
    if (toast) {
      toast.textContent = msg;
      toast.hidden = false;
      clearTimeout(state._toastTimer);
      state._toastTimer = setTimeout(() => { toast.hidden = true; }, 2200);
    }
  }
  return true;
}

function addNote(text, color, signature, image) {
  if (snapshotGuard('这 是 别 人 寄 来 的 墙，先 点 「收 下 这 面 墙」再 续 写')) return;
  const teachers = loadTeachers();
  const t = teachers.find(x => x.name === state.currentTeacher);
  if (!t) return;
  const canvas = document.getElementById('notes-canvas');
  const W = canvas.clientWidth || 800;
  const H = canvas.clientHeight || 600;
  // M2 修复：根据画布尺寸动态算位置，避免窄屏出框
  const noteW = 170;   // 与 .note clamp 上限对齐
  const noteH = 115;
  const maxX = Math.max(40, W - noteW - 20);
  const maxY = Math.max(60, H - noteH - 20);
  const note = {
    text, color,
    signature: signature || '',          // 署名（可空）
    image: image || null,                // 附图（base64 dataURL，可空）
    date: formatNowDate(),                // 当天日期字符串
    x: 30 + Math.random() * Math.max(0, maxX - 30),
    y: 60 + Math.random() * Math.max(0, maxY - 60),
    rotate: (Math.random() - 0.5) * 8,
    ts: Date.now(),
  };
  t.notes.push(note);
  saveTeachers(teachers);
}

function deleteTeacher(name) {
  const teachers = loadTeachers();
  const idx = teachers.findIndex(x => x.name === name);
  if (idx < 0) return;
  teachers.splice(idx, 1);
  saveTeachers(teachers);
}

function formatNowDate() {
  // 落款日期：当天时间戳
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function formatLongDate() {
  // 长格式：显示在署名旁
  const d = new Date();
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function updateNotePosition(idx, x, y) {
  if (isSnapshotMode()) {
    // 只读模式：位置只改内存，不落 localStorage，也不动原信
    const n = state.snapshot.notes[idx];
    if (!n) return;
    const canvas = document.getElementById('notes-canvas');
    const W = canvas?.clientWidth || 800;
    const H = canvas?.clientHeight || 600;
    n.x = x; n.y = y;
    n.fx = unpct(pct(x / W));
    n.fy = unpct(pct(y / H));
    return;
  }
  const teachers = loadTeachers();
  const t = teachers.find(x => x.name === state.currentTeacher);
  if (!t || !t.notes[idx]) return;
  t.notes[idx].x = x;
  t.notes[idx].y = y;
  saveTeachers(teachers);
}

function deleteNote(idx) {
  if (isSnapshotMode()) {
    // 别人寄来的信：只从眼前这面墙上取下，不影响寄件人，也不写本机
    // 重绘交给调用方（删除确认按钮统一 renderNotes）
    if (state.snapshot.notes[idx]) state.snapshot.notes.splice(idx, 1);
    return;
  }
  const teachers = loadTeachers();
  const t = teachers.find(x => x.name === state.currentTeacher);
  if (!t) return;
  t.notes.splice(idx, 1);
  saveTeachers(teachers);
}

// ============= 4. 页面栈 & 返回 =============
// 改用真实 history API：showPage 时 pushState，goBack 时 history.back()。
// popstate 监听器负责把状态同步回 state.pageHistory（不调用 goBack）。
function showPage(pageId, options = {}) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + pageId);
  if (el) el.classList.add('active');

  // 推入历史栈（去重连续项）
  if (state.pageHistory[state.pageHistory.length - 1] !== pageId) {
    state.pageHistory.push(pageId);
  }
  state.currentPage = pageId;

  // 同步浏览器历史（S1 修复）
  // 快照模式：hash 里装着整面墙的内容，切页时保持原 hash 不动，
  // 否则老师复制地址栏链接就只剩 #wall，内容丢失。
  if (isSnapshotMode()) {
    // no-op：不动 hash
  } else if (!options.skipHistory && options.replace !== true) {
    try { history.pushState({ page: pageId, t: Date.now() }, '', '#' + pageId); } catch (e) { /* file:// 等 */ }
  } else if (options.replace) {
    try { history.replaceState({ page: pageId, t: Date.now() }, '', '#' + pageId); } catch (e) {}
  }

  // 顶部栏：仅非 welcome 页显示
  const topbar = document.getElementById('topbar');
  topbar.hidden = (pageId === 'welcome');

  // 同步标题
  const titleEl = document.getElementById('topbar-title');
  if (pageId === 'select') titleEl.textContent = '黑板 · 上的话';
  else if (pageId === 'impression') titleEl.textContent = state.currentTeacher || '提笔';
  else if (pageId === 'wall') titleEl.textContent = state.currentTeacher || '师者';
}

// 关闭所有模态（返回前先关）
function closeAllModals() {
  const ids = ['add-modal', 'delete-modal', 'delete-teacher-modal', 'note-view-modal', 'share-modal'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.hidden) el.hidden = true;
  });
  state.pendingDeleteIdx = null;
  state.pendingDeleteTeacher = null;
}

// a11y：把焦点放到模态内第一个可聚焦元素；记录打开前的焦点
function trapFocusInModal(modal) {
  if (!modal) return;
  const previouslyFocused = document.activeElement;
  const focusable = modal.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) {
    modal.focus();
    return () => {
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  first.focus();
  // Tab 循环
  const onKey = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  modal.addEventListener('keydown', onKey);
  return () => {
    modal.removeEventListener('keydown', onKey);
    if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
  };
}

function goBack() {
  // 模态框优先（S2 修复：现在包含 note-view / share / delete-teacher 三个）
  const modals = [
    { id: 'add-modal', clear: null },
    { id: 'delete-modal', clear: () => { state.pendingDeleteIdx = null; } },
    { id: 'delete-teacher-modal', clear: () => { state.pendingDeleteTeacher = null; } },
    { id: 'note-view-modal', clear: null },
    { id: 'share-modal', clear: null },
  ];
  for (const m of modals) {
    const el = document.getElementById(m.id);
    if (el && !el.hidden) {
      el.hidden = true;
      if (m.clear) m.clear();
      return;
    }
  }

  // 页面返回：用 history.back() 让浏览器也同步
  if (state.pageHistory.length <= 1) return;
  // 快照模式：为保住带内容的 hash，我们没有 pushState，
  // 因此手动用内部栈回退，否则 history.back() 无处可退会卡住。
  if (isSnapshotMode()) {
    state.pageHistory.pop();
    const prev = state.pageHistory[state.pageHistory.length - 1] || 'welcome';
    showPage(prev, { skipHistory: true });
    if (prev === 'select') renderTeacherGrid();
    return;
  }
  // popstate 监听器会负责 pop 栈 + showPage
  try { history.back(); } catch (e) { /* fallback: 手动 pop */
    state.pageHistory.pop();
    const prev = state.pageHistory[state.pageHistory.length - 1];
    state.pageHistory.pop();
    showPage(prev);
    if (prev === 'select') renderTeacherGrid();
  }
}

// ============= 5. 老师列表 =============
function renderTeacherGrid() {
  const grid = document.getElementById('teacher-grid');
  const teachers = loadTeachers();
  grid.innerHTML = '';

  if (teachers.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'teacher-empty';
    empty.innerHTML = `
      <div class="teacher-empty-text">还 没 有 老 师</div>
      <div class="teacher-empty-hint">点 下 方 「记 一 位」开 始</div>
    `;
    grid.appendChild(empty);
    return;
  }

  teachers.forEach(t => {
    const card = document.createElement('div');
    card.className = 'teacher-card';
    card.innerHTML = `
      <button type="button" class="teacher-delete" title="抹去这位" aria-label="抹去这位">×</button>
      <div class="teacher-name">${escapeHTML(t.name)}</div>
      <div class="teacher-count">${t.notes.length} 封</div>
    `;
    // 删除 ×：单独事件，阻止冒泡触发卡片
    const del = card.querySelector('.teacher-delete');
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      const noteCount = (t.notes || []).length;
      state.pendingDeleteTeacher = t.name;
      document.getElementById('delete-teacher-quote').textContent = `「${t.name}」`;
      const hint = document.getElementById('delete-teacher-hint');
      hint.textContent = noteCount > 0
        ? `会 一 并 抹 去 ${noteCount} 封 来 信`
        : `这 一 位 还 没 收 到 来 信`;
      if (state._openDeleteTeacherModal) state._openDeleteTeacherModal();
    });
    // 卡片本身：进入写信/墙
    card.addEventListener('click', (e) => {
      if (e.target.closest('.teacher-delete')) return;
      state.currentTeacher = t.name;
      document.getElementById('impression-teacher-name').textContent = `给「${t.name}」`;
      if ((t.notes || []).length > 0) {
        enterWall();
      } else {
        showPage('impression');
        setTimeout(() => document.getElementById('keyword-input').focus(), 200);
      }
    });
    grid.appendChild(card);
  });
}

function bindDeleteTeacherModal() {
  const modal = document.getElementById('delete-teacher-modal');
  if (!modal) return;
  let releaseTrap = null;
  const close = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    state.pendingDeleteTeacher = null;
    if (releaseTrap) { releaseTrap(); releaseTrap = null; }
  };
  const open = () => {
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => { releaseTrap = trapFocusInModal(modal); }, 50);
  };
  document.getElementById('delete-teacher-cancel-btn').addEventListener('click', close);
  document.getElementById('delete-teacher-confirm-btn').addEventListener('click', () => {
    if (state.pendingDeleteTeacher) {
      const name = state.pendingDeleteTeacher;
      deleteTeacher(name);
      // 删的是当前正在看的那位 → 退回 select
      if (state.currentTeacher === name) state.currentTeacher = null;
      renderTeacherGrid();
    }
    close();
  });
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  state._openDeleteTeacherModal = open;
}

function escapeHTML(s) {
  // m5 修复：加反引号
  return String(s).replace(/[&<>"'`]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;'
  })[c]);
}

// ============= 6. 信纸颜色 =============
function renderPaperPicker() {
  const picker = document.getElementById('color-picker');
  if (!picker) return;
  picker.innerHTML = '';

  // 1) 5 个预设便条色
  PAPER_COLORS.forEach(c => {
    const dot = document.createElement('div');
    dot.className = 'paper-dot';
    dot.style.background = c.hex;
    dot.title = c.name;
    if (!state.isCustomPaper && c.hex.toLowerCase() === state.selectedColor.toLowerCase()) {
      dot.classList.add('selected');
    }
    dot.addEventListener('click', () => {
      state.selectedColor = c.hex;
      state.isCustomPaper = false;
      applyPaperColor(c.hex);
      renderPaperPicker();
    });
    picker.appendChild(dot);
  });

  // 2) 分隔
  const div = document.createElement('div');
  div.className = 'picker-divider';
  picker.appendChild(div);

  // 3) 彩色轮盘：自定义颜色（input[type=color] 藏在 conic-gradient 圆盘下）
  const wheel = document.createElement('label');
  wheel.className = 'paper-wheel';
  if (state.isCustomPaper) wheel.classList.add('selected');
  wheel.title = '自定义信纸颜色';
  const input = document.createElement('input');
  input.type = 'color';
  input.value = state.isCustomPaper ? state.selectedColor : '#fdf6e3';
  input.addEventListener('input', (e) => {
    const hex = e.target.value;
    state.selectedColor = hex;
    state.isCustomPaper = true;
    applyPaperColor(hex);
    wheel.classList.add('selected');
    // 持久化
    try { localStorage.setItem(CUSTOM_PAPER_KEY, hex); } catch (err) {}
  });
  input.addEventListener('change', (e) => {
    // change 时也同步一次（部分浏览器 input 事件不触发）
    const hex = e.target.value;
    state.selectedColor = hex;
    state.isCustomPaper = true;
    applyPaperColor(hex);
    wheel.classList.add('selected');
    try { localStorage.setItem(CUSTOM_PAPER_KEY, hex); } catch (err) {}
  });
  wheel.appendChild(input);
  const label = document.createElement('span');
  label.className = 'wheel-label';
  label.textContent = '彩';
  wheel.appendChild(label);
  picker.appendChild(wheel);

  // 初始化时同步一次
  applyPaperColor(state.selectedColor);
}

function loadCustomPaper() {
  try {
    const saved = localStorage.getItem(CUSTOM_PAPER_KEY);
    if (saved && /^#?[a-fA-F0-9]{6}$/.test(saved)) {
      state.selectedColor = saved.startsWith('#') ? saved : '#' + saved;
      state.isCustomPaper = true;
    }
  } catch (e) { /* ignore */ }
}

// 信纸颜色应用到 .notebook-paper（用 CSS 变量驱动）
function applyPaperColor(hex) {
  const paper = document.querySelector('.notebook-paper');
  if (!paper) return;
  paper.style.setProperty('--paper-bg', hex);
  // 底部略深一档（用 mix-blend 模拟），或直接用同色
  paper.style.setProperty('--paper-bg2', hex);
}

// ============= 7. 添加老师 =============
function bindAddTeacher() {
  const modal = document.getElementById('add-modal');
  const input = document.getElementById('new-teacher-input');
  let releaseTrap = null;
  const open = () => {
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    input.value = '';
    setTimeout(() => {
      releaseTrap = trapFocusInModal(modal);
      input.focus();
    }, 50);
  };
  const close = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    if (releaseTrap) { releaseTrap(); releaseTrap = null; }
  };
  const confirm = () => {
    const name = input.value.trim();
    if (!name) return;
    const teachers = loadTeachers();
    if (teachers.some(t => t.name === name)) {
      input.value = '';
      input.placeholder = '已经有了，换一个';
      return;
    }
    teachers.push({ name, notes: [] });
    saveTeachers(teachers);
    close();
    renderTeacherGrid();
  };
  document.getElementById('add-teacher-btn').addEventListener('click', open);
  document.getElementById('add-cancel-btn').addEventListener('click', close);
  document.getElementById('add-confirm-btn').addEventListener('click', confirm);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') confirm(); });
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
}

// ============= 8. 提交印象 =============
function bindSubmit() {
  const input = document.getElementById('keyword-input');
  document.getElementById('submit-btn').addEventListener('click', () => {
    const text = input.value.trim();
    if (!text && !state.pendingImage) return;     // 文本和图都没有
    if (!state.currentTeacher) return;
    const sigInput = document.getElementById('signature-input');
    const signature = (sigInput?.value || '').trim();
    addNote(text, state.selectedColor, signature, state.pendingImage);
    input.value = '';
    if (sigInput) sigInput.value = '';
    clearPendingImage();
    setTimeout(() => enterWall(), 280);
  });

  document.getElementById('add-note-btn').addEventListener('click', () => {
    document.getElementById('impression-teacher-name').textContent = `再给「${state.currentTeacher}」`;
    showPage('impression');
    const sigInput = document.getElementById('signature-input');
    if (sigInput) sigInput.value = '';
    clearPendingImage();
    updateSignatureDateDisplay();
    setTimeout(() => document.getElementById('keyword-input').focus(), 200);
  });
}

// 实时刷新日期显示（用户进页面时调一次）
function updateSignatureDateDisplay() {
  const el = document.getElementById('signature-date');
  if (!el) return;
  el.textContent = formatLongDate();
}

// ============= 9. 黑板墙 =============
function enterWall() {
  document.getElementById('wall-teacher-name').textContent = state.currentTeacher;
  applyWallMode();
  showPage('wall');
  renderNotes();
}

// 快照模式：隐藏"再写一封"，显示"收下这面墙"与只读横幅；正常模式反之
function applyWallMode() {
  const snap = isSnapshotMode();
  const addBtn = document.getElementById('add-note-btn');
  const saveBtn = document.getElementById('save-wall-btn');
  const badge = document.getElementById('wall-readonly-badge');
  const hint = document.getElementById('wall-hint');
  if (addBtn) addBtn.hidden = snap;
  if (saveBtn) saveBtn.hidden = !snap;
  if (badge) badge.hidden = !snap;
  if (hint) hint.textContent = snap ? '点 看 · 拖 动 · 点 「存」 收 下 这 面 墙' : '点 看 · 拖 动 · 双 击 抹 去';
}

function safeImageDataUrl(u) {
  return (typeof u === 'string' && /^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(u)) ? u : null;
}

function renderNotes() {
  const canvas = document.getElementById('notes-canvas');
  canvas.innerHTML = '';
  const notes = getCurrentNotes();
  document.getElementById('wall-stats').textContent = `${notes.length} 封 来 信`;

  // 快照模式：链接里存的是比例坐标，按当前画布尺寸还原（跨设备/跨屏宽不出框）
  const snapMode = isSnapshotMode();
  const CW = canvas.clientWidth || 800;
  const CH = canvas.clientHeight || 600;

  notes.forEach((n, idx) => {
    let px = n.x, py = n.y;
    if (snapMode) {
      const noteW = 170, noteH = 115;   // 与 .note clamp 上限对齐
      const maxX = Math.max(10, CW - noteW - 12);
      const maxY = Math.max(10, CH - noteH - 12);
      px = Math.max(10, Math.min(maxX, Math.round((typeof n.fx === 'number' ? n.fx : 0.5) * CW)));
      py = Math.max(10, Math.min(maxY, Math.round((typeof n.fy === 'number' ? n.fy : 0.5) * CH)));
      n.x = px; n.y = py;
    }
    const div = document.createElement('div');
    div.className = 'note';
    div.style.left = px + 'px';
    div.style.top = py + 'px';
    div.style.transform = `rotate(${n.rotate || 0}deg)`;
    div.style.background = n.color;
    div.style.animationDelay = (idx * 0.04) + 's';
    const sigHtml = n.signature
      ? `<span class="note-signature">— ${escapeHTML(n.signature)}</span>`
      : `<span class="note-signature"></span>`;
    const dateHtml = n.date
      ? `<span class="note-date">${escapeHTML(n.date)}</span>`
      : '';
    // 文本+图：如果有图放在文本上方（地址经白名单校验，快照数据不可全信）
    const textHtml = escapeHTML(n.text || '');
    const imgData = safeImageDataUrl(n.image);
    const imgHtml = imgData
      ? `<img class="note-image" src="${imgData}" alt="" />`
      : '';
    div.innerHTML = `
      ${imgHtml}
      <div class="note-text">${textHtml}</div>
      <div class="note-meta">${sigHtml}${dateHtml}</div>
    `;
    bindNoteInteraction(div, idx);
    canvas.appendChild(div);
  });
}

// ============= 10. 便签交互：拖动 + 单击查看 + 双击删除 =============
// 逻辑：pointerup 时根据「是否移动过」与「距上次 tap 间隔」三态分发
//   - moved=true                → 拖动过，保存新位置
//   - moved=false & 距上次<320ms → 双击，弹删除确认
//   - moved=false & 其余        → 单击，弹查看模态
//
// M6 备注：每个便签的 lastTapTime 是独立闭包变量（每个 bindNoteInteraction 调用一份）。
// 这意味着跨便签的 tap 计时互不干扰：便签 A 的单击不会让便签 B 的 pointerup 误判成"双击"。
// renderNotes 会重建 DOM（每次都重新 bind），所以删除后 idx 一定是最新的，无需关心 stale closure。
function bindNoteInteraction(el, idx) {
  let startX = 0, startY = 0, startLeft = 0, startTop = 0;
  let dragging = false, moved = false, lastTapTime = 0;

  el.addEventListener('pointerdown', e => {
    if (e.target.closest('.note-meta')) return;
    dragging = true;
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseFloat(el.style.left) || 0;
    startTop = parseFloat(el.style.top) || 0;
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    el.style.zIndex = 100;
    el.style.cursor = 'grabbing';
    el.classList.add('dragging');
  });

  el.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
    el.style.left = (startLeft + dx) + 'px';
    el.style.top = (startTop + dy) + 'px';
    if (moved) {
      const angle = Math.max(-8, Math.min(8, dx * 0.4));
      el.style.transform = `rotate(${angle}deg) scale(1.06) translateY(-2px)`;
    }
  });

  el.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    try { el.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    el.style.zIndex = '';
    el.style.cursor = 'grab';
    el.classList.remove('dragging');
    const notes = getCurrentNotes();
    if (notes[idx]) {
      el.style.transform = `rotate(${notes[idx].rotate || 0}deg)`;
    }
    if (moved) {
      // 拖动：保存新位置
      const newX = parseFloat(el.style.left) || 0;
      const newY = parseFloat(el.style.top) || 0;
      updateNotePosition(idx, newX, newY);
      lastTapTime = 0;  // 拖动后重置 tap 计时
      return;
    }
    // 未移动：根据距上次 tap 时间判断单击 vs 双击
    const now = Date.now();
    if (now - lastTapTime < 320) {
      // 双击：弹删除确认
      const note = notes[idx];
      if (!note) return;
      state.pendingDeleteIdx = idx;
      document.getElementById('delete-quote').textContent = `「${note.text || '这 一 封'}」`;
      if (state._openDeleteModal) state._openDeleteModal();
      lastTapTime = 0;
    } else {
      // 单击：弹查看模态
      openNoteView(idx);
      lastTapTime = now;
    }
  });

  // 键盘：Enter / Space 触发查看（a11y）
  el.setAttribute('tabindex', '0');
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', '查看便签');
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openNoteView(idx);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      const note = getCurrentNotes()[idx];
      if (!note) return;
      state.pendingDeleteIdx = idx;
      document.getElementById('delete-quote').textContent = `「${note.text || '这 一 封'}」`;
      if (state._openDeleteModal) state._openDeleteModal();
    }
  });

  el.addEventListener('pointercancel', () => {
    dragging = false;
    el.style.zIndex = '';
    el.style.cursor = 'grab';
    el.classList.remove('dragging');
    const notes = getCurrentNotes();
    if (notes[idx]) {
      el.style.transform = `rotate(${notes[idx].rotate || 0}deg)`;
    }
  });
}

// ============= 10.5 便签查看模态 =============
let _noteViewReleaseTrap = null;
function openNoteView(idx) {
  const notes = getCurrentNotes();
  const note = notes[idx];
  if (!note) return;
  const modal = document.getElementById('note-view-modal');
  const card = document.getElementById('note-view-card');
  if (!modal || !card) return;

  // 沿用原便签的纸色 + 旋转
  card.style.background = (/^#[0-9a-fA-F]{3,8}$/.test(note.color || '') ? note.color : 'var(--paper-1)');
  const rotate = (typeof note.rotate === 'number') ? note.rotate : -1;
  card.style.transform = `rotate(${rotate}deg)`;

  // 文本
  document.getElementById('note-view-text').textContent = note.text || '';

  // 图片（快照数据不可全信，地址走白名单校验）
  const imgWrap = document.getElementById('note-view-image');
  const img = document.getElementById('note-view-img');
  const imgData = safeImageDataUrl(note.image);
  if (imgData) {
    img.src = imgData;
    imgWrap.hidden = false;
  } else {
    img.removeAttribute('src');
    imgWrap.hidden = true;
  }

  // 署名 + 日期
  document.getElementById('note-view-signature').textContent = note.signature ? `— ${note.signature}` : '';
  document.getElementById('note-view-date').textContent = note.date || '';

  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => {
    if (_noteViewReleaseTrap) _noteViewReleaseTrap();
    _noteViewReleaseTrap = trapFocusInModal(modal);
  }, 50);
}

function bindNoteView() {
  const modal = document.getElementById('note-view-modal');
  if (!modal) return;
  const close = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    if (_noteViewReleaseTrap) { _noteViewReleaseTrap(); _noteViewReleaseTrap = null; }
  };
  document.getElementById('note-view-close-btn').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  state._closeNoteView = close;
}

// 全局 ESC 关闭所有模态（a11y）
function bindGlobalEscape() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (state._closeNoteView) {
      const modal = document.getElementById('note-view-modal');
      if (modal && !modal.hidden) { state._closeNoteView(); e.preventDefault(); return; }
    }
    ['share-modal', 'delete-teacher-modal', 'delete-modal', 'add-modal'].forEach(id => {
      const m = document.getElementById(id);
      if (m && !m.hidden) {
        m.hidden = true;
        m.setAttribute('aria-hidden', 'true');
        if (id === 'delete-modal') state.pendingDeleteIdx = null;
        if (id === 'delete-teacher-modal') state.pendingDeleteTeacher = null;
        e.preventDefault();
      }
    });
  });
}

function bindDeleteModal() {
  const modal = document.getElementById('delete-modal');
  let releaseTrap = null;
  const close = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    state.pendingDeleteIdx = null;
    if (releaseTrap) { releaseTrap(); releaseTrap = null; }
  };
  const open = () => {
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => { releaseTrap = trapFocusInModal(modal); }, 50);
  };
  document.getElementById('delete-cancel-btn').addEventListener('click', close);
  document.getElementById('delete-confirm-btn').addEventListener('click', () => {
    if (state.pendingDeleteIdx != null) {
      deleteNote(state.pendingDeleteIdx);
      renderNotes();
    }
    close();
  });
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  // 暴露 open 给 pointerup
  state._openDeleteModal = open;
}

// ============= 11.4 快照编解码（无后端分享的核心）=============
// 为什么需要这一节：整站零后端，信件只存在「写信人」本机的 localStorage 里。
// 旧版分享链接只带老师名（#teacher=xxx），老师在自己的设备上打开 → 本地无数据 →
// 落回空白欢迎页，这就是"信封发出去老师却看不到"的原因。
// 修法：把便签内容本身压进 URL 的 hash。hash 不会发给服务器，纯客户端可见，
// 因此静态托管也能做到"链接自带这面墙"。
//   #k1=...            链接快照（纯文本便签，不含附图）
//   window.__SNAPSHOT__  导出文件内的完整快照（含附图）
// 两者最终都汇到 applySnapshot()。

const SNAPSHOT_PREFIX = 'k1=';      // URL hash 前缀
const LINK_SOFT_LIMIT = 6000;       // 超过则提示链接偏长
const LINK_HARD_LIMIT = 24000;      // 超过则放弃带内容，降级为只带老师名
const QR_MAX = 1900;                // 二维码内容长度上限（超过只提示复制链接）

// --- 字节 <-> base64url（URL 安全，不含 + / =）---
function bytesToB64Url(bytes) {
  let bin = '';
  const CHUNK = 0x8000;             // 分块，避免 apply 的参数上限
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64UrlToBytes(str) {
  let s = String(str).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// mode: 'compress' | 'decompress'（fmt 固定 deflate-raw，无 zlib 头，省字节）
async function streamThrough(bytes, mode) {
  const StreamCtor = mode === 'decompress' ? DecompressionStream : CompressionStream;
  const ds = new Blob([bytes]).stream().pipeThrough(new StreamCtor('deflate-raw'));
  const buf = await new Response(ds).arrayBuffer();
  return new Uint8Array(buf);
}

// 首字节 1 = deflate-raw，0 = 原样存（老浏览器无 CompressionStream 时降级）
async function compressBytes(bytes) {
  if (typeof CompressionStream === 'function' && typeof Blob === 'function') {
    try {
      const z = await streamThrough(bytes, 'compress');
      if (z.length < bytes.length) {
        const out = new Uint8Array(z.length + 1);
        out[0] = 1; out.set(z, 1);
        return out;
      }
    } catch (e) { /* fall through to stored */ }
  }
  const out = new Uint8Array(bytes.length + 1);
  out[0] = 0; out.set(bytes, 1);
  return out;
}

async function decompressBytes(bytes) {
  if (!bytes.length) throw new Error('empty payload');
  if (bytes[0] === 1) {
    if (typeof DecompressionStream !== 'function') throw new Error('浏览器不支持解压缩');
    return await streamThrough(bytes.subarray(1), 'decompress');
  }
  return bytes.subarray(1);
}

const clamp01 = v => Math.max(0, Math.min(1, v));
const pct = v => Math.round(clamp01(v) * 100);
const unpct = v => (typeof v === 'number' && isFinite(v) ? clamp01(v / 100) : 0.5);

// 把当前这面墙做成快照对象（keepImages 仅在导出文件时使用）
// 快照模式下取链接带来的数据，而不是本机 localStorage
function buildSnapshot(keepImages) {
  let t = null;
  if (isSnapshotMode()) {
    t = { name: state.snapshot.teacher, notes: state.snapshot.notes };
  } else {
    const teachers = loadTeachers();
    t = teachers.find(x => x.name === state.currentTeacher) || null;
  }
  if (!t) return null;
  const canvas = document.getElementById('notes-canvas');
  const W = canvas?.clientWidth || 800;
  const H = canvas?.clientHeight || 600;
  const notes = (t.notes || []).map(n => {
    const nx = (typeof n.x === 'number' && isFinite(n.x)) ? n.x : W * 0.4;
    const ny = (typeof n.y === 'number' && isFinite(n.y)) ? n.y : H * 0.4;
    const o = {
      text: n.text || '',
      color: n.color || PAPER_COLORS[0].hex,
      signature: n.signature || '',
      date: n.date || '',
      rotate: (typeof n.rotate === 'number') ? Math.round(n.rotate * 10) / 10 : 0,
      fx: unpct(pct(nx / W)),   // 存比例：换设备/换屏宽也不出框
      fy: unpct(pct(ny / H)),
      image: null,
    };
    if (keepImages && typeof n.image === 'string' && /^data:image\//i.test(n.image)) {
      o.image = n.image;
    }
    return o;
  });
  return { v: 1, teacher: t.name, notes };
}

function compactToSnapshot(arr) {
  if (!Array.isArray(arr) || arr[0] !== 1 || typeof arr[1] !== 'string') return null;
  const list = Array.isArray(arr[2]) ? arr[2] : [];
  const notes = list.map(n => ({
    text: typeof n?.[0] === 'string' ? n[0] : '',
    color: /^#[0-9a-fA-F]{3,8}$/.test((n && n[1]) || '') ? n[1] : PAPER_COLORS[0].hex,
    signature: typeof n?.[2] === 'string' ? n[2].slice(0, 20) : '',
    date: typeof n?.[3] === 'string' ? n[3].slice(0, 12) : '',
    fx: unpct(n && n[4]),
    fy: unpct(n && n[5]),
    rotate: (typeof n?.[6] === 'number' && isFinite(n[6])) ? Math.max(-20, Math.min(20, n[6])) : 0,
    image: (typeof n?.[7] === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(n[7]) && n[7].length <= THUMB_MAX_LEN) ? n[7] : null,
    x: 0, y: 0,
  }));
  return { v: 1, teacher: arr[1].slice(0, 10), notes };
}

// 把原图压成小 JPEG 缩略图（dataURL），供链接携带
function makeThumb(dataUrl, maxW, quality) {
  return new Promise(resolve => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const w = img.naturalWidth || 1, h = img.naturalHeight || 1;
          const s = Math.min(1, maxW / w);
          const nw = Math.max(1, Math.round(w * s)), nh = Math.max(1, Math.round(h * s));
          const c = document.createElement('canvas');
          c.width = nw; c.height = nh;
          const ctx = c.getContext('2d');
          ctx.fillStyle = '#ffffff';            // 透明底转 JPEG 前先铺白
          ctx.fillRect(0, 0, nw, nh);
          ctx.drawImage(img, 0, 0, nw, nh);
          const out = c.toDataURL('image/jpeg', quality);
          resolve(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(out) ? out : null);
        } catch (e) { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    } catch (e) { resolve(null); }
  });
}

// 给快照里每封带图便签生成缩略图（替换原图，控制链接体积）
// 返回 { snap, thumbCount, thumbFail }
async function withLinkThumbs(snap) {
  if (!snap) return { snap: null, thumbCount: 0, thumbFail: 0 };
  let thumbCount = 0, thumbFail = 0;
  for (const n of snap.notes) {
    if (!n.image) continue;
    const t = await makeThumb(n.image, 132, 0.56);
    if (t) { n.image = t; thumbCount++; }
    else { n.image = null; thumbFail++; }   // 压不出来就丢图，保文字
  }
  return { snap, thumbCount, thumbFail };
}

// 快照对象（附图已换缩略图）-> 链接字符串。紧凑格式第 8 位（index 7）可选携带图片
async function encodeSnapshotLink(snap, withImages) {
  try {
    const compact = [1, snap.teacher, snap.notes.map(n => {
      const row = [n.text, n.color, n.signature, n.date, pct(n.fx), pct(n.fy), n.rotate];
      if (withImages && typeof n.image === 'string' && n.image.length <= THUMB_MAX_LEN) row.push(n.image);
      return row;
    })];
    const json = JSON.stringify(compact);
    const packed = await compressBytes(new TextEncoder().encode(json));
    return bytesToB64Url(packed);
  } catch (e) {
    console.warn('[impression-wall] 快照编码失败', e);
    return null;
  }
}

const THUMB_MAX_LEN = 60000;   // 单张缩略图 base64 长度上限（防御异常大数据）

// hash 字符串 -> 快照对象（解析失败返回 null，绝不抛异常）
async function decodeSnapshotLink(str) {
  try {
    const bytes = b64UrlToBytes(str);
    const json = new TextDecoder().decode(await decompressBytes(bytes));
    return compactToSnapshot(JSON.parse(json));
  } catch (e) {
    console.warn('[impression-wall] 快照解析失败', e);
    return null;
  }
}

// 进入快照模式：数据来自链接或导出文件，而不是本机 localStorage
function applySnapshot(snap) {
  if (!snap || !Array.isArray(snap.notes)) return false;
  state.snapshot = snap;
  state.currentTeacher = snap.teacher || '老师';
  return true;
}

function isSnapshotMode() {
  return !!(state.snapshot && Array.isArray(state.snapshot.notes));
}

// 退出快照模式：回到本机数据驱动的正常使用流程
function exitSnapshot() {
  state.snapshot = null;
}

// 导出文件里的内嵌快照（完整对象格式，含附图）→ 校验 + 规范化
function normalizeFullSnapshot(obj) {
  if (!obj || typeof obj !== 'object') return null;
  if (typeof obj.teacher !== 'string' || !obj.teacher || !Array.isArray(obj.notes)) return null;
  const notes = obj.notes.map(n => ({
    text: typeof n?.text === 'string' ? n.text.slice(0, 400) : '',
    color: /^#[0-9a-fA-F]{3,8}$/.test((n && n.color) || '') ? n.color : PAPER_COLORS[0].hex,
    signature: typeof n?.signature === 'string' ? n.signature.slice(0, 20) : '',
    date: typeof n?.date === 'string' ? n.date.slice(0, 12) : '',
    rotate: (typeof n?.rotate === 'number' && isFinite(n.rotate)) ? Math.max(-20, Math.min(20, n.rotate)) : 0,
    fx: clamp01((typeof n?.fx === 'number' && isFinite(n.fx)) ? n.fx : 0.5),
    fy: clamp01((typeof n?.fy === 'number' && isFinite(n.fy)) ? n.fy : 0.5),
    image: /^data:image\/(png|jpe?g|webp|gif);/i.test((n && n.image) || '') ? n.image : null,
    x: 0, y: 0,
  }));
  return { v: 1, teacher: obj.teacher.slice(0, 10), notes };
}

// 轻提示（复用墙上气泡元素）
function showToast(msg, ms) {
  const toast = document.getElementById('wall-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(state._toastTimer);
  state._toastTimer = setTimeout(() => { toast.hidden = true; }, ms || 2400);
}

// ---------- 收下这面墙：把寄来的信存进本机，之后可以续写、长期保留 ----------
function saveWallToLocal() {
  if (!isSnapshotMode()) return;
  const snap = state.snapshot;
  const name = (snap.teacher || '老师').slice(0, 10);
  const teachers = loadTeachers();
  let t = teachers.find(x => x.name === name);
  if (!t) { t = { name, notes: [] }; teachers.push(t); }
  const keyOf = n => `${n.date}|${n.signature}|${n.text}`;
  const seen = new Set(t.notes.map(keyOf));
  let added = 0;
  snap.notes.forEach(n => {
    const k = keyOf(n);
    if (seen.has(k)) return;
    seen.add(k);
    t.notes.push({
      text: n.text, color: n.color, signature: n.signature, date: n.date,
      image: n.image || null, rotate: n.rotate,
      x: (typeof n.x === 'number' ? n.x : 40), y: (typeof n.y === 'number' ? n.y : 40),
      ts: Date.now(),
    });
    added++;
  });
  if (!added) { showToast('这 面 墙 已 经 收 下 了'); return; }
  if (!saveTeachers(teachers)) return;   // 存储失败时已弹提示
  exitSnapshot();
  state.currentTeacher = name;
  // 数据已入本机：清掉带内容的 hash，补齐浏览器历史（welcome → wall），
  // 之后后退键、地址栏都和正常流程一致
  try {
    history.replaceState({ page: 'welcome', t: Date.now() }, '', '#welcome');
    history.pushState({ page: 'wall', t: Date.now() }, '', '#wall');
  } catch (e) { /* ignore */ }
  state.pageHistory = ['welcome', 'wall'];
  applyWallMode();
  renderNotes();
  showToast(`收 下 ${added} 封 信 · 可 以 拖 动 整 理、也 可 续 写 回 信`);
}

// ---------- 导出这一墙：把「页面 + 数据」打包成单个可双击打开的 HTML ----------
// 用途：便签带附图时 URL 装不下，导出文件是唯一能完整带走图片的方式。
function jsonForScriptTag(obj) {
  // 转义 < ：防止拼出提前闭合的 script 结束标签或注释起始符
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function sanitizeFileName(s) {
  return String(s || '').replace(/[\\/:*?"<>|\s]+/g, '').slice(0, 20) || '老师';
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function fetchAssetText(href) {
  if (state._assets && typeof state._assets[href] === 'string' && state._assets[href]) {
    return state._assets[href];
  }
  try {
    const r = await fetch(href, { cache: 'no-cache' });
    if (!r.ok) return '';
    return await r.text();
  } catch (e) { return ''; }
}

// 页面加载后预取自身源码：导出时直接用，避免二次网络失败
function prefetchAssets() {
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
  state._assets = {};
  Promise.all([fetchAssetText('./style.css'), fetchAssetText('./main.js')]).then(([css, js]) => {
    state._assets = { './style.css': css || '', './main.js': js || '' };
  }).catch(() => { /* 忽略：导出时再试一次 */ });
}

// 导出用：拉取服务端"原始 HTML"，而不是克隆实时 DOM。
// 托管平台会往页面注入悬浮条/评论/统计脚本（如 #prototypeOverlay、
// axureshow 的 link/script、百度统计），克隆 DOM 会把它们一起带走，
// 因此用 DOMParser 精确移除所有脚本与平台痕迹，再内联样式与快照数据。
const PLATFORM_HOST_RE = /(axxiu\.cn|axureshow\.com|hm\.baidu\.com)/i;

function cleanExportDoc(rawHtml, cssText, jsText, snap) {
  let doc;
  try { doc = new DOMParser().parseFromString(rawHtml, 'text/html'); } catch (e) { return null; }
  if (!doc || !doc.body || !doc.head) return null;

  // 1) 清空一切可执行内容：脚本、noscript、内联事件、注释
  doc.querySelectorAll('script, noscript').forEach(el => el.remove());
  (function dropComments(node) {
    const kids = Array.from(node.childNodes);
    for (const k of kids) {
      if (k.nodeType === 8) k.remove();
      else if (k.nodeType === 1) dropComments(k);
    }
  })(doc.documentElement);
  doc.querySelectorAll('*').forEach(el => {
    for (const at of Array.from(el.attributes)) {
      if (/^on[a-z]+$/i.test(at.name) ||
          (at.name === 'href' && /^\s*javascript:/i.test(at.value))) {
        el.removeAttribute(at.name);
      }
    }
  });

  // 2) 移除平台注入的样式表与宿主节点（悬浮条/评论容器等）
  doc.querySelectorAll('link[href], style').forEach(el => {
    const href = el.getAttribute('href') || '';
    if (PLATFORM_HOST_RE.test(href) || /style\.css(\?|$)/i.test(href)) el.remove();
  });
  doc.querySelectorAll('[id^="ax-"], [id*="prototypeOverlay"], [id*="axComment"], [class*="ax-comment"]').forEach(el => el.remove());
  doc.querySelectorAll('link[href*="fonts.g"], link[rel="preconnect"]').forEach(el => el.remove());

  // 3) 视图复位：快照数据由内嵌脚本在启动时读取并自动进墙
  // 注意：模态只设 hidden，绝不能清空内容——初始化会绑定模态内的按钮
  const canvas = doc.querySelector('#notes-canvas');
  if (canvas) canvas.textContent = '';
  const topbar = doc.querySelector('#topbar');
  if (topbar) topbar.setAttribute('hidden', '');
  ['share-modal', 'delete-modal', 'delete-teacher-modal', 'add-modal',
   'note-view-modal', 'wall-readonly-badge', 'save-wall-btn',
   'share-note', 'wall-toast'].forEach(id => {
    const el = doc.querySelector('#' + id);
    if (el) el.setAttribute('hidden', '');
  });
  const toastEl = doc.querySelector('#wall-toast');
  if (toastEl) toastEl.textContent = '';

  // 4) 内联样式 + 数据 + 应用脚本
  const title = `致${String(snap.teacher || '老师').slice(0, 10)}的黑板墙`;
  doc.title = title;
  const style = doc.createElement('style');
  style.textContent = cssText;
  doc.head.appendChild(style);

  // 清洗自检：在注入自身脚本之前查平台痕迹（main.js 源码里就带着这些域名字面量）
  if (PLATFORM_HOST_RE.test(doc.documentElement.outerHTML)) return null;

  const snapEl = doc.createElement('script');
  snapEl.textContent = 'window.__SNAPSHOT__=' + jsonForScriptTag(snap) + ';';
  const jsEl = doc.createElement('script');
  jsEl.textContent = jsText;
  doc.body.appendChild(snapEl);
  doc.body.appendChild(jsEl);

  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}

async function buildExportHtml(snap) {
  const [rawHtml, cssText, jsText] = await Promise.all([
    fetchAssetText(location.pathname + location.search),
    fetchAssetText('./style.css'), fetchAssetText('./main.js'),
  ]);
  if (!rawHtml || !cssText || !jsText) return null;
  let out = null;
  try { out = cleanExportDoc(rawHtml, cssText, jsText, snap); }
  catch (e) { console.warn('[impression-wall] 导出手术失败', e); return null; }
  if (!out || out.indexOf('__SNAPSHOT__') < 0) return null;   // 坏文件保护
  return out;
}

async function exportWallHtml() {
  const snap = buildSnapshot(true);   // 导出携带附图
  if (!snap || !snap.notes.length) { showToast('这 面 墙 还 没 有 信'); return; }
  const btn = document.getElementById('share-export-btn');
  if (btn) btn.disabled = true;
  try {
    const html = await buildExportHtml(snap);
    if (!html) { showToast('读 取 页 面 源 码 失 败，开 网 再 试'); return; }
    downloadTextFile(`致${sanitizeFileName(snap.teacher)}的黑板墙.html`, html);
    showToast('文 件 已 生 成，转 发 这 个 .html 给 老 师');
  } catch (e) {
    console.warn('[impression-wall] 导出失败', e);
    showToast('导 出 失 败，请 改 用 链 接 分 享');
  } finally {
    if (btn) btn.disabled = false;
  }
}

function bindWallSave() {
  const btn = document.getElementById('save-wall-btn');
  if (!btn) return;
  btn.addEventListener('click', saveWallToLocal);
}

// ---------- 入口路由：链接带什么，打开就看到什么 ----------
const BROKEN_LINK_MSG = '这 个 链 接 的 信 好 像 被 截 断 了\n请 让 写 信 的 人 重 新 复 制 完 整 链 接';
function noDataMsg(name) {
  return `这 台 设 备 上 看 不 到「${name}」\n如 果 你 是 收 到 信 的 老 师，\n请 让 写 信 的 人 用 最 新 版 重 新 分 享\n（新 链 接 会 带 上 信 的 内 容）`;
}

async function handleEntry() {
  // 导出文件：打开即进墙（数据内嵌在 window.__SNAPSHOT__）
  if (window.__SNAPSHOT__ && !isSnapshotMode()) {
    const embedded = normalizeFullSnapshot(window.__SNAPSHOT__);
    if (embedded && embedded.notes.length) {
      applySnapshot(embedded);
      setTimeout(() => enterWall(), 200);
      return;
    }
  }
  const hash = location.hash;
  if (hash.startsWith('#' + SNAPSHOT_PREFIX)) {
    const snap = await decodeSnapshotLink(hash.slice(1 + SNAPSHOT_PREFIX.length));
    if (snap && snap.notes.length) {
      applySnapshot(snap);
      setTimeout(() => enterWall(), 200);
      return;
    }
    // 链接内容损坏：清掉 hash 回到欢迎页，并说明原因（旧版是静默停在空白页）
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    showPage('welcome', { replace: true });
    setTimeout(() => alert(BROKEN_LINK_MSG), 150);
    return;
  }
  if (hash.startsWith('#teacher=')) {
    const name = decodeURIComponent(hash.slice(9));
    const t = loadTeachers().find(x => x.name === name);
    if (t) {
      state.currentTeacher = name;
      setTimeout(() => enterWall(), 200);
    } else {
      setTimeout(() => alert(noDataMsg(name)), 150);
    }
  }
}

// ============= 11.5 分享 =============
// 用公共 QR API 生成二维码图片，失败时显示文字降级
const QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=1&data=';

function setShareQR(imgEl, url) {
  if (!imgEl) return;
  imgEl.onerror = () => {
    imgEl.style.display = 'none';
    const hint = imgEl.parentElement.querySelector('.qr-hint');
    if (hint) hint.textContent = '链接复制走，扫码请到站';
  };
  imgEl.onload = () => { imgEl.style.display = 'block'; };
  imgEl.src = QR_API + encodeURIComponent(url);
}

// 旧式链接：只带老师名（内容仍在分享者本机，收件人看不到信——仅作降级用）
function teacherShareUrl(name) {
  const base = location.origin + location.pathname;
  return name ? `${base}#teacher=${encodeURIComponent(name)}` : base;
}

// 生成"自带内容"的分享链接：附图压成缩略图尽量带上，装不下则回退纯文字
// 返回 { url, withContent, hasThumbs, thumbFail, count, payloadLen, tooLong }
async function buildShareUrlAsync() {
  const base = location.origin + location.pathname;
  const snapFull = buildSnapshot(true);        // 含原图，稍后压成缩略图
  const count = snapFull ? snapFull.notes.length : 0;
  if (!snapFull || count === 0) {
    return { url: teacherShareUrl(state.currentTeacher), withContent: false, count, payloadLen: 0 };
  }
  const plain = () => ({ url: teacherShareUrl(state.currentTeacher), withContent: false, count, payloadLen: 0 });

  const imgCount = snapFull.notes.filter(n => n.image).length;
  let hasThumbs = false, thumbFail = 0, imgDropped = false;
  let payload = null;

  if (imgCount > 0) {
    // 先试"文字+缩略图"（独立副本，避免污染下次构建）
    const clone = JSON.parse(JSON.stringify(snapFull));
    const r = await withLinkThumbs(clone);
    const p = await encodeSnapshotLink(r.snap, true);
    if (p && p.length <= LINK_HARD_LIMIT) {
      payload = p; hasThumbs = r.thumbCount > 0; thumbFail = r.thumbFail;
    } else {
      imgDropped = true;   // 带图装不下：回退纯文字，提示用导出文件
    }
  }
  if (!payload) {
    // 回退：只带文字（图片走"导出这一墙"文件）
    const noImg = JSON.parse(JSON.stringify(snapFull));
    noImg.notes.forEach(n => { n.image = null; });
    payload = await encodeSnapshotLink(noImg, false);
  }
  if (!payload) return plain();
  if (payload.length > LINK_HARD_LIMIT) {
    return { url: teacherShareUrl(state.currentTeacher), withContent: false, count, payloadLen: payload.length, tooLong: true };
  }
  return {
    url: `${base}#${SNAPSHOT_PREFIX}${payload}`,
    withContent: true, hasThumbs, thumbFail, imgDropped, count, payloadLen: payload.length,
  };
}

function buildShareText() {
  const teacher = state.currentTeacher || '老师';
  const notes = isSnapshotMode() ? state.snapshot.notes
    : ((loadTeachers().find(x => x.name === teacher)?.notes) || []);
  if (!notes.length) {
    return `致 ${teacher}：心里的话，写在黑板上。`;
  }
  const sample = notes.slice(0, 2).map(n => n.text).join(' · ');
  return `致 ${teacher}：${sample}`;
}

function bindShare() {
  const btn = document.getElementById('share-btn');
  const modal = document.getElementById('share-modal');
  if (!btn || !modal) return;
  let releaseTrap = null;
  let shareUrl = '';
  let shareSeq = 0;
  const close = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    if (releaseTrap) { releaseTrap(); releaseTrap = null; }
  };

  btn.addEventListener('click', async () => {
    const count = getCurrentNotes().length;
    const summary = document.getElementById('share-summary');
    const noteEl = document.getElementById('share-note');
    const qrEl = document.getElementById('share-qr');
    const seq = ++shareSeq;   // 防抖：只认最后一次点击的结果
    summary.textContent = `给「${state.currentTeacher || '老师'}」的 ${count} 封信`;
    if (noteEl) noteEl.textContent = count ? '正在打包这一墙的话…' : '还没有信，链接只是个门牌。';
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => { releaseTrap = trapFocusInModal(modal); }, 50);

    const res = await buildShareUrlAsync();
    if (seq !== shareSeq) return;   // 期间被再次点击，丢弃旧结果
    shareUrl = res.url;

    if (noteEl) {
      if (res.tooLong) {
        noteEl.textContent = '信 太 多 太 长，链 接 装 不 下\n请 改 用 「导出这一墙」的 文 件 发 给 老 师';
      } else if (res.withContent && res.hasThumbs) {
        noteEl.textContent = `链 接 已带 ${res.count} 封 信（含 附 图 缩 略 图）\n老 师 打 开 就 能 看 到`;
      } else if (res.withContent && res.imgDropped) {
        noteEl.textContent = `链 接 已带 ${res.count} 封 信，但 附 图 装 不 下\n完 整 图 片 请 用「导出这一墙」发 文 件`;
      } else if (res.withContent) {
        noteEl.textContent = res.payloadLen > LINK_SOFT_LIMIT
          ? `链 接 已带 ${res.count} 封 信，但 比 较 长\n请 用 「复 制 链 接」完 整 发 送，不 要 手 工 截 短`
          : `链 接 已带 上 ${res.count} 封 信，老 师 打 开 就 能 看 到`;
      } else {
        noteEl.textContent = '链 接 只 有 门 牌，没 带 信 的 内 容';
      }
    }
    // 二维码容量有限（约 2KB）：链接过长时不画码，改为提示复制链接
    if (res.url.length > QR_MAX) {
      if (qrEl) { qrEl.style.display = 'none'; qrEl.removeAttribute('src'); }
      const hint = document.querySelector('.share-qr-wrap .qr-hint');
      if (hint) hint.textContent = '链 接 较 长 · 请 用 下 方「复 制 链 接」发 送';
    } else {
      const hint = document.querySelector('.share-qr-wrap .qr-hint');
      if (hint) hint.textContent = '扫码看看这面墙';
      setShareQR(qrEl, res.url);
    }

    const sysBtn = document.getElementById('share-system-btn');
    const onSys = async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: '师者印象墙', text: buildShareText(), url: shareUrl });
        } catch (e) { /* user cancel */ }
      } else {
        const ok = await copyToClipboard(shareUrl);
        sysBtn.textContent = ok ? '已复制链接' : '复制失败';
        setTimeout(() => { sysBtn.textContent = '系统分享'; }, 1600);
      }
    };
    sysBtn.onclick = onSys;

    const copyBtn = document.getElementById('share-copy-btn');
    copyBtn.onclick = async () => {
      const ok = await copyToClipboard(shareUrl);
      copyBtn.textContent = ok ? '已复制' : '复制失败';
      setTimeout(() => { copyBtn.textContent = '复制链接'; }, 1600);
    };

    const previewBtn = document.getElementById('share-preview-btn');
    if (previewBtn) {
      previewBtn.onclick = () => {
        if (!res.withContent) { showToast('链 接 没 带 内 容，无 需 预 览'); return; }
        close();
        const w = window.open(res.url, '_blank', 'noopener');
        if (!w) showToast('浏 览 器 拦 住 了 新 窗 口，请 允 许 弹 窗');
      };
    }
    const exportBtn = document.getElementById('share-export-btn');
    if (exportBtn) exportBtn.onclick = exportWallHtml;
  });

  document.getElementById('share-close-btn').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}

// ============= 12. 表情 + 附图 =============
function bindEmojiPicker() {
  const wrap = document.getElementById('emoji-picker');
  if (!wrap) return;
  wrap.innerHTML = '';
  QUICK_EMOJI.forEach(emoji => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'emoji-btn';
    btn.textContent = emoji;
    btn.title = `插入 ${emoji}`;
    btn.addEventListener('click', () => insertAtCursor(emoji));
    wrap.appendChild(btn);
  });
}

// 在 textarea 当前光标处插入文本
function insertAtCursor(text) {
  const ta = document.getElementById('keyword-input');
  if (!ta) return;
  const start = ta.selectionStart ?? ta.value.length;
  const end = ta.selectionEnd ?? ta.value.length;
  // 截断到 200 字
  const before = ta.value.slice(0, start);
  const after = ta.value.slice(end);
  const merged = (before + text + after).slice(0, 200);
  ta.value = merged;
  const newPos = Math.min(before.length + text.length, merged.length);
  ta.setSelectionRange(newPos, newPos);
  ta.focus();
  // 触发 input 让 chalk 效果 + 字数计数同步
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  updateCharcount();
}

// 允许的图片格式白名单（m7 修复：避免 SVG 等可能含脚本的格式）
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function bindImageUpload() {
  const file = document.getElementById('image-input');
  const remove = document.getElementById('image-remove-btn');
  if (!file) return;
  file.addEventListener('change', (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
      alert('只 支 持 JPG / PNG / WebP / GIF 哦');
      file.value = '';
      return;
    }
    // 限制大小：> 1.5MB 提示压缩
    if (f.size > 1.5 * 1024 * 1024) {
      alert('图 太 大 了（> 1.5MB），建 议 选 小 一 点 的 贴 纸');
      file.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      // 自动压缩到 600px 宽、JPEG 0.82，减小 localStorage 占用
      compressImage(dataUrl, 600, 0.82).then(compressed => {
        setPendingImage(compressed);
      }).catch((err) => {
        // M5 修复：失败不能静默回退到原图（可能撑爆 localStorage）
        console.warn('[impression-wall] 图片压缩失败', err);
        alert('图 片 处 理 失 败，请 换 一 张');
        file.value = '';
      });
    };
    reader.onerror = () => alert('读 取 失 败');
    reader.readAsDataURL(f);
  });
  if (remove) {
    remove.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearPendingImage();
    });
  }
}

function setPendingImage(dataUrl) {
  state.pendingImage = dataUrl;
  const preview = document.getElementById('image-preview');
  const img = document.getElementById('image-preview-img');
  if (preview && img) {
    img.src = dataUrl;
    preview.hidden = false;
  }
}

function clearPendingImage() {
  state.pendingImage = null;
  const preview = document.getElementById('image-preview');
  const img = document.getElementById('image-preview-img');
  const file = document.getElementById('image-input');
  if (preview) preview.hidden = true;
  if (img) img.src = '';
  if (file) file.value = '';
}

// 压缩图片到指定最大宽度，返回 dataURL
function compressImage(dataUrl, maxW, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w <= maxW) { resolve(dataUrl); return; }
      const scale = maxW / w;
      const nw = Math.round(w * scale);
      const nh = Math.round(h * scale);
      const c = document.createElement('canvas');
      c.width = nw; c.height = nh;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, nw, nh);
      // PNG 保持原格式（可能有透明度），其它转 JPEG
      const isPng = /^data:image\/png/i.test(dataUrl);
      try {
        const out = isPng ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', quality);
        resolve(out);
      } catch (e) { reject(e); }
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// 字数计数
function updateCharcount() {
  const ta = document.getElementById('keyword-input');
  const el = document.getElementById('charcount');
  if (!ta || !el) return;
  const len = ta.value.length;
  el.textContent = `${len} / 200`;
  el.style.color = len >= 200 ? '#e8a8a8' : '';
}

function bindCharcount() {
  const ta = document.getElementById('keyword-input');
  if (!ta) return;
  // 创建计数元素（如不存在）
  if (!document.getElementById('charcount')) {
    const el = document.createElement('p');
    el.id = 'charcount';
    el.className = 'charcount';
    el.textContent = '0 / 200';
    // 插入到 attach-row 之前
    const attach = document.querySelector('.attach-row');
    if (attach) attach.parentNode.insertBefore(el, attach);
  }
  ta.addEventListener('input', updateCharcount);
  updateCharcount();
}

// ============= 12. 顶部返回按钮 =============
function bindTopbar() {
  document.getElementById('back-btn').addEventListener('click', goBack);

  // 浏览器原生返回：只同步 state，不调 goBack（避免循环）
  // M3 修复：用 event.state 区分：仅当我们 pushState 过的页才响应
  window.addEventListener('popstate', (e) => {
    // e.state 是 pushState 时存的；null/undefined = 外部进入或初始态，忽略
    if (!e.state || !e.state.page) return;
    // 同步内部栈到当前页
    if (state.pageHistory.length > 1) {
      state.pageHistory.pop();
      const prev = state.pageHistory[state.pageHistory.length - 1];
      state.pageHistory.pop();  // 让 showPage 重新推入
      // 直接 showPage 但跳过 pushState
      showPage(prev, { skipHistory: true });
      if (prev === 'select') renderTeacherGrid();
    }
  });
}

// M1 修复：跨 tab 同步 + 老师失效检测
function bindStorageSync() {
  window.addEventListener('storage', (e) => {
    if (e.key !== 'impression_teachers') return;
    if (isSnapshotMode()) return;   // 寄来的墙：本机数据变化与它无关
    // 当前老师被另一 tab 删了
    if (state.currentTeacher) {
      const teachers = loadTeachers();
      const exists = teachers.some(t => t.name === state.currentTeacher);
      if (!exists) {
        state.currentTeacher = null;
        if (state.currentPage !== 'welcome') {
          alert('这 位 老 师 已 被 删 除');
          goBack();
        }
      } else {
        // 同一老师但便签变了：刷新墙
        if (state.currentPage === 'wall') renderNotes();
      }
    }
  });
}

// ============= 13. 粉笔写 / 黑板擦 模拟 =============
function setupChalkAnimation() {
  const textarea = document.getElementById('keyword-input');
  const overlay = document.getElementById('chalk-overlay');
  if (!textarea || !overlay) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  let lastValue = textarea.value;
  let isComposing = false;

  // 粉笔尖标记：跟随光标，常驻一个小点 + 一道竖线，让人能清楚看到落笔位置
  const tip = document.createElementNS(SVG_NS, 'g');
  tip.setAttribute('id', 'chalk-tip');
  tip.style.opacity = '0.55';
  // 一道短竖线（笔尖留下的痕迹）
  const tipLine = document.createElementNS(SVG_NS, 'line');
  tipLine.setAttribute('stroke', 'rgba(58, 42, 24, 0.7)');
  tipLine.setAttribute('stroke-width', '1.5');
  tipLine.setAttribute('stroke-linecap', 'round');
  tipLine.setAttribute('y1', '-9');
  tipLine.setAttribute('y2', '9');
  // 一个小三角点
  const tipDot = document.createElementNS(SVG_NS, 'polygon');
  tipDot.setAttribute('points', '-3,4 3,4 0,9');
  tipDot.setAttribute('fill', 'rgba(58, 42, 24, 0.7)');
  tip.appendChild(tipLine);
  tip.appendChild(tipDot);
  overlay.appendChild(tip);
  function updateTip() {
    if (document.activeElement !== textarea) {
      tip.style.opacity = '0';
      return;
    }
    tip.style.opacity = '0.55';
    const pos = textarea.selectionStart ?? textarea.value.length;
    const r = getCharRect(textarea, pos);
    if (!r) return;
    const oRect = overlay.getBoundingClientRect();
    const x = r.left - oRect.left;
    const y = r.top - oRect.top + r.height / 2;
    tip.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  }

  // IME 中文输入
  textarea.addEventListener('compositionstart', () => { isComposing = true; });
  textarea.addEventListener('compositionend', () => {
    isComposing = false;
    handleChange();
    updateTip();
  });
  textarea.addEventListener('input', () => {
    if (!isComposing) handleChange();
    updateTip();
  });
  textarea.addEventListener('keyup', updateTip);
  textarea.addEventListener('click', updateTip);
  textarea.addEventListener('focus', () => {
    updateTip();
    // m4 修复：重置 transform，避免上次的 transform 残留
    tip.setAttribute('transform', 'translate(-9999 -9999)');
    // 健壮性：移动端键盘弹起时把 textarea 滚到视口里
    setTimeout(() => {
      try { textarea.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
    }, 300);
  });
  textarea.addEventListener('blur', () => {
    tip.style.opacity = '0';
    // 清掉未触发的 effect（避免离开后还看到动画）
    if (effectTimer) { clearTimeout(effectTimer); effectTimer = null; pendingEffect = null; }
  });

  // 健壮性：粘贴时清洗多余空白/控制字符，截 200 字（保留换行让多行成为可能）
  textarea.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text') || '';
    // 去掉控制字符 / 连续空格；超 200 字截断
    const clean = text.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').replace(/[ \t]{2,}/g, ' ');
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const newVal = (before + clean + after).slice(0, 200);
    textarea.value = newVal;
    const cursor = Math.min(before.length + clean.length, newVal.length);
    textarea.setSelectionRange(cursor, cursor);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    updateCharcount();
  });

  // 200 字 + 多行：允许回车换行（不再 preventDefault）

  // 健壮性：节流 — 快速连按/连打时合并 effect，避免卡顿
  let effectTimer = null;
  let pendingEffect = null;  // { type, pos }
  function flushEffect() {
    if (!pendingEffect) return;
    spawnChalkEffect(textarea, overlay, SVG_NS, pendingEffect.pos, pendingEffect.type);
    if (pendingEffect.type === 'write') {
      textarea.classList.remove('just-wrote');
      void textarea.offsetWidth;
      textarea.classList.add('just-wrote');
    } else if (pendingEffect.type === 'erase') {
      textarea.classList.remove('just-erased');
      void textarea.offsetWidth;
      textarea.classList.add('just-erased');
    }
    pendingEffect = null;
  }

  function handleChange() {
    const newValue = textarea.value;
    const oldValue = lastValue;
    if (newValue === oldValue) return;

    let type = 'write';
    if (newValue.length < oldValue.length) type = 'erase';
    const pos = findDiffPos(oldValue, newValue);
    pendingEffect = { type, pos };

    // 短延迟内多次输入只触发一次 effect（更顺滑）
    if (effectTimer) clearTimeout(effectTimer);
    effectTimer = setTimeout(flushEffect, 50);

    lastValue = newValue;
  }

  function findDiffPos(oldVal, newVal) {
    let i = 0;
    const min = Math.min(oldVal.length, newVal.length);
    while (i < min && oldVal[i] === newVal[i]) i++;
    return i;
  }

  function getCharRect(textarea, pos) {
    // 用 mirror div 精确测量字符位置（中文也能用）
    // 关键：把 mirror div 绝对定位到 textarea 旁边（同一个 top-left 偏移），
    // 这样 mirror 里 span 的 getBoundingClientRect 就能直接对应到 textarea 里的字符位置。
    try {
      const text = textarea.value;
      if (pos < 0) pos = 0;
      if (pos > text.length) pos = text.length;
      const computed = getComputedStyle(textarea);
      const taRect = textarea.getBoundingClientRect();
      const mirror = document.createElement('div');
      // 复制 textarea 的关键样式
      const props = [
        'direction', 'boxSizing', 'width', 'height',
        'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'lineHeight', 'fontFamily',
        'textAlign', 'textTransform', 'textIndent', 'textDecoration',
        'letterSpacing', 'wordSpacing', 'tabSize',
        'whiteSpace', 'wordWrap'
      ];
      props.forEach(p => { mirror.style[p] = computed[p]; });
      // ★ 关键修复：把 mirror 绝对定位到 textarea 的位置（而不是 body 默认的 0,0）
      mirror.style.position = 'absolute';
      mirror.style.top = (window.scrollY + taRect.top) + 'px';
      mirror.style.left = (window.scrollX + taRect.left) + 'px';
      mirror.style.visibility = 'hidden';
      mirror.style.overflow = 'hidden';
      mirror.style.zIndex = '-9999';

      // 在 mirror 里塞入 textarea 的内容 + 标记 span
      const before = document.createTextNode(text.substring(0, pos));
      const span = document.createElement('span');
      // 用占位字符（避免空 span 没尺寸）
      span.textContent = text.substring(pos) || '\u200b';
      mirror.appendChild(before);
      mirror.appendChild(span);
      document.body.appendChild(mirror);

      const spanRect = span.getBoundingClientRect();
      // spanRect.left/top 现在是 mirror（=textarea 位置）里的字符绝对位置
      const result = {
        left: spanRect.left,
        top: spanRect.top,
        right: spanRect.left,
        bottom: spanRect.top,
        width: Math.max(spanRect.width, 1),
        height: Math.max(spanRect.height, parseFloat(computed.lineHeight) || 22),
      };
      document.body.removeChild(mirror);
      return result;
    } catch (e) {
      console.warn('[chalk] getCharRect failed', e);
      const r = textarea.getBoundingClientRect();
      return { left: r.left, top: r.top, width: 200, height: 24 };
    }
  }

  function spawnChalkEffect(textarea, overlay, SVG_NS, charPos, type) {
    const rect = getCharRect(textarea, charPos);
    if (!rect) return;
    const overlayRect = overlay.getBoundingClientRect();
    const baseX = rect.left - overlayRect.left;
    const baseY = rect.top - overlayRect.top + rect.height / 2;
    const isDemo = location.hash === '#demo';

    if (type === 'write') {
      // 写 = 简洁：1 道短笔划 + 2-3 颗紧贴光标的墨点（无粉笔灰）
      const ink = hexToRgb(state.chalkColor);
      const lineLen = Math.max(14, Math.min(28, rect.width || 18));
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', baseX);
      line.setAttribute('y1', baseY - 1.5);
      line.setAttribute('x2', baseX + lineLen);
      line.setAttribute('y2', baseY + 1.5);
      line.setAttribute('stroke', `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.9)`);
      line.setAttribute('stroke-width', '3.5');
      line.setAttribute('stroke-linecap', 'round');
      line.classList.add('chalk-write-line');
      overlay.appendChild(line);
      setTimeout(() => line.remove(), isDemo ? 99999 : 800);

      // 2-3 颗紧贴笔划的墨点
      const dotCount = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < dotCount; i++) {
        const c = document.createElementNS(SVG_NS, 'circle');
        c.setAttribute('cx', baseX + Math.random() * lineLen);
        c.setAttribute('cy', baseY + (Math.random() - 0.5) * 8);
        c.setAttribute('r', (1.5 + Math.random() * 1.2).toFixed(1));
        c.setAttribute('fill', `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.88)`);
        c.classList.add('chalk-write-dot');
        c.style.animationDelay = (i * 0.03) + 's';
        overlay.appendChild(c);
        setTimeout(() => c.remove(), isDemo ? 99999 : 900);
      }
    } else {
      // 擦 = 简洁：12 颗深色粉尘，紧贴光标向上飘散
      const count = 12;
      for (let i = 0; i < count; i++) {
        const c = document.createElementNS(SVG_NS, 'circle');
        const px = baseX + (Math.random() - 0.5) * 18;
        const py = baseY + (Math.random() - 0.5) * 10;
        c.setAttribute('cx', px);
        c.setAttribute('cy', py);
        c.setAttribute('r', (1.5 + Math.random() * 1.3).toFixed(1));
        c.setAttribute('fill', 'rgba(35, 28, 20, 0.85)');
        c.classList.add('chalk-erase-dust');
        c.style.setProperty('--dx', ((Math.random() - 0.5) * 26).toFixed(1) + 'px');
        c.style.setProperty('--dy', (-20 - Math.random() * 16).toFixed(1) + 'px');
        c.style.animationDelay = (i * 0.02) + 's';
        c.style.animationDuration = (1.0 + Math.random() * 0.4).toFixed(2) + 's';
        overlay.appendChild(c);
        setTimeout(() => c.remove(), isDemo ? 99999 : 1600);
      }
    }
  }
}

// ============= 13. 启动 =============
function bindStart() {
  // 快照浏览态下点"提笔/看看写过的"：退出只读快照，回到自己的正常流程
  const toSelect = () => {
    if (isSnapshotMode()) { exitSnapshot(); state.currentTeacher = null; }
    showPage('select');
    renderTeacherGrid();
  };
  document.getElementById('start-btn').addEventListener('click', toSelect);
  // 欢迎页"看看写过的"：跳到 select，由 renderTeacherGrid 处理空状态
  const viewBtn = document.getElementById('view-existing-btn');
  if (viewBtn) viewBtn.addEventListener('click', toSelect);
}

// ============= 14. 粉笔盒（粉笔槽）=============
function bindChalkBox() {
  const box = document.getElementById('chalk-box');
  if (!box) return;
  const ta = document.getElementById('keyword-input');
  // 默认选中第一支（墨黑）
  const sticks = box.querySelectorAll('.mini-chalk');
  if (sticks.length === 0) return;
  sticks[0].classList.add('active');
  applyChalkColor(state.chalkColor);
  sticks.forEach((btn) => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.color;
      sticks.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.chalkColor = color;
      applyChalkColor(color);
      // 持久化（健壮性：隐私模式可能抛错）
      try { localStorage.setItem('impression_chalk_color', color.replace('#', '')); } catch (e) {}
      // 焦点拉回 textarea 方便继续打字
      if (ta) ta.focus();
    });
  });
  // 如果 localStorage 已有保存的颜色，激活对应粉笔
  const match = Array.from(sticks).find(b => b.dataset.color.toLowerCase() === state.chalkColor.toLowerCase());
  if (match) {
    sticks.forEach(b => b.classList.remove('active'));
    match.classList.add('active');
  }
}

function applyChalkColor(hex) {
  // 1) textarea 字体颜色
  const ta = document.getElementById('keyword-input');
  if (ta) ta.style.color = hex;
  // 2) 粉笔尖 marker（直接找已渲染的 g#chalk-tip 的子元素）
  const tipLine = document.querySelector('#chalk-tip line');
  const tipPoly = document.querySelector('#chalk-tip polygon');
  if (tipLine) {
    tipLine.setAttribute('stroke', hex);
    tipLine.setAttribute('stroke-opacity', '0.75');
  }
  if (tipPoly) {
    tipPoly.setAttribute('fill', hex);
    tipPoly.setAttribute('fill-opacity', '0.75');
  }
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 58, g: 40, b: 24 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

// ============= 15. dev demo：自动跑粉笔/黑板擦，便于截图验证 =============
// 仅在 URL 带 #demo 时触发，便于人工或自动化测试视觉效果（不修改正常用户路径）
function runDevDemo() {
  state.currentTeacher = '王老师';
  document.getElementById('impression-teacher-name').textContent = `给「${state.currentTeacher}」`;
  showPage('impression');
  document.body.classList.add('demo-mode');
  const ta = document.getElementById('keyword-input');
  if (!ta) return;
  const seq = [
    { t: 600, v: '粉', mode: 'write' },
    { t: 1400, v: '粉笔', mode: 'write' },
    { t: 2200, v: '粉笔灰', mode: 'write' },
    { t: 3500, v: '粉笔', mode: 'erase' },
    { t: 4500, v: '', mode: 'erase' },
  ];
  let cur = '';
  // 让 textarea 立即获取焦点，触发粉笔尖显示
  setTimeout(() => ta.focus(), 50);
  seq.forEach(step => {
    setTimeout(() => {
      cur = step.v;
      ta.value = cur;
      ta.setSelectionRange(cur.length, cur.length);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }, step.t);
  });
}

function init() {
  // 第一次访问：清掉旧的演示数据（包含"王老师/李老师"且有种子笔记）
  purgeSeedTeachers();
  bindTopbar();
  bindStorageSync();   // M1：跨 tab 同步
  bindGlobalEscape();  // a11y：ESC 关模态
  bindAddTeacher();
  bindSubmit();
  bindDeleteModal();
  bindDeleteTeacherModal();
  bindNoteView();
  bindStart();
  bindShare();
  bindWallSave();
  bindEmojiPicker();
  bindImageUpload();
  bindCharcount();
  setupChalkAnimation();
  // 恢复用户上次的粉笔颜色（健壮性：try/catch 防隐私模式）
  try {
    const saved = localStorage.getItem('impression_chalk_color');
    if (saved && /^[a-fA-F0-9]{6}$/.test(saved)) {
      state.chalkColor = '#' + saved;
    }
  } catch (e) { /* ignore */ }
  // 恢复自定义信纸色
  loadCustomPaper();
  renderPaperPicker();
  bindChalkBox();   // 必须在 renderPaperPicker 之后（覆盖默认 active）
  updateSignatureDateDisplay();
  // 黑板氛围：随机抽题（课题/课程/值日/倒计时/作业/学科涂鸦）
  randomizeBlackboard();
  bindShuffleButton();
  // 首次进入：重置历史栈
  // 带内容的分享链接（#k1=）、导出文件、旧式 #teacher= 都保留原 hash，
  // 其余情况把地址规整成 #welcome
  state.pageHistory = ['welcome'];
  const keepHash = location.hash.startsWith('#' + SNAPSHOT_PREFIX)
    || location.hash.startsWith('#teacher=')
    || !!(window.__SNAPSHOT__ && window.__SNAPSHOT__.notes);
  if (keepHash) {
    showPage('welcome', { skipHistory: true });
  } else {
    showPage('welcome', { replace: true });
  }
  // m1 修复：仅在调试态暴露 state 到 window
  if (location.hash === '#debug') window.__app = state;
  // 入口路由：链接快照 / 导出文件内嵌快照 / 旧式老师名深链
  handleEntry();
  // 预取自身源码，"导出这一墙"时可离线使用
  prefetchAssets();
  // dev demo：URL 带 #demo 时跳过欢迎页直接跑粉笔/擦子演示
  if (location.hash === '#demo') {
    setTimeout(runDevDemo, 400);
  }
}

function bindShuffleButton() {
  const btn = document.getElementById('shuffle-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    randomizeBlackboard();
    // 简单视觉反馈：按钮闪一下
    btn.style.transition = 'none';
    btn.style.color = 'rgba(220, 110, 90, 0.9)';
    setTimeout(() => { btn.style.transition = ''; btn.style.color = ''; }, 200);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
