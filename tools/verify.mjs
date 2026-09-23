// tools/verify.mjs
// =============================================================================
// Unfading Wall · 改动后最小可运行验证（零依赖 / 零构建 / 零后端）
// -----------------------------------------------------------------------------
// 运行：  node tools/verify.mjs      （或）  npm run verify
// 无需 npm install —— 只用 Node 18+ 自带的内置模块与 Web API。
//
// 它覆盖回归代价最高、最常被改动的行为不变量：
//   [Suite 1] URL 快照编解码「往返」——这是零后端「寄墙」分享的核心。
//             纯函数，直接在 Node 里真实执行 encode→decode，逐字段核对。
//   [Suite 2] 便签三态交互（拖动落位 / 单击查看 / 双击删除）的状态机骨架。
//   [Suite 3] main.js 依赖的关键 DOM 节点契约，防止与 index.html 的 id 改名脱钩。
//
// Suite 1 依赖 main.js 里的 [verify-extract:start]/[verify-extract:end] 标记，
// 用来抽出快照编解码的纯函数子集；Suite 2/3 是对源码文本的静态冒烟。
// 拖动/单击/双击的真交互需要浏览器，跑不了自动断言，故在 README 里配人工核对清单。
// =============================================================================

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const mainSrc = readFileSync(join(ROOT, 'main.js'), 'utf8');
const htmlSrc = readFileSync(join(ROOT, 'index.html'), 'utf8');

let passCount = 0;
let failCount = 0;
const failures = [];

function ok(name, msg) {
  passCount++;
  console.log(`  PASS  ${name}${msg ? `  — ${msg}` : ''}`);
}
function bad(name, msg) {
  failCount++;
  failures.push(name);
  console.log(`  FAIL  ${name}${msg ? `  — ${msg}` : ''}`);
}
function assert(name, cond, msg) {
  cond ? ok(name, msg) : bad(name, msg);
  return !!cond;
}
function near(name, actual, expected, tol, msg) {
  const good = typeof actual === 'number' && typeof expected === 'number'
    && Math.abs(actual - expected) <= tol;
  assert(name, good, good ? msg : `${msg} | got=${actual} want=${expected}±${tol}`);
}
function section(title) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
}

// -----------------------------------------------------------------------------
// Suite 1: URL 快照编解码往返（真实执行）
// -----------------------------------------------------------------------------
function extractCodec(src) {
  const START = '// [verify-extract:start]';
  const END = '// [verify-extract:end]';
  const a = src.indexOf(START);
  const b = src.indexOf(END);
  if (a < 0 || b < 0 || b <= a) return null;
  return src.slice(a, b); // 含 start 标记行（注释，无害）到 end 标记前
}

function makeSampleSnapshot() {
  return {
    v: 1,
    teacher: '王老师',
    notes: [
      { text: '您总是笑着讲题，把最难的一章讲成了我最爱的一章。', color: '#fdf6e3', signature: '小林', date: '2026-09-10', fx: 0.123, fy: 0.456, rotate: 3.7, image: null },
      { text: 'Teacher, thank you! 🌷✨', color: '#ffd6d6', signature: 'Aki', date: '2026/09/10', fx: 0.99, fy: 0.01, rotate: -8, image: null },
      { text: '含特殊字符 <&"> 和换行\n以及制表\t', color: '#cfe5f0', signature: '', date: '', fx: 0.5, fy: 0.5, rotate: 0, image: null },
    ],
  };
}

async function runCodecSuite() {
  section('[Suite 1] URL 快照编解码往返  (寄墙分享核心 · 真实执行)');

  const codec = extractCodec(mainSrc);
  if (!codec) {
    bad('codec.extract', 'main.js 缺少 [verify-extract:start]/[end] 标记，无法抽取被测编解码');
    return;
  }
  ok('codec.extract', '已从标记区间抽出编解码函数');

  // 快照编解码用到的 Web API 在 Node 18+ 均为全局；PAPER_COLORS 提供一份兜底即可。
  const ctx = {
    TextEncoder, TextDecoder, btoa, atob, Blob, Response,
    CompressionStream, DecompressionStream,
    PAPER_COLORS: [{ name: '米白', hex: '#fdf6e3' }],
    console: { warn() {}, log() {} },
    document: undefined, state: undefined, Image: undefined,
  };

  const bootstrap = codec +
    '\n;globalThis.__api = { encodeSnapshotLink, decodeSnapshotLink, compactToSnapshot, ' +
    'bytesToB64Url, b64UrlToBytes, SNAPSHOT_PREFIX, THUMB_MAX_LEN };';

  let api;
  try {
    vm.runInNewContext(bootstrap, ctx, { filename: 'main.codec.js' });
    api = ctx.__api;
  } catch (e) {
    bad('codec.load', '编解码在 Node 沙箱中加载失败: ' + e.message);
    return;
  }
  ok('codec.load', '编解码函数在 Node 沙箱中成功实例化');

  // --- 往返一致性 ---
  const snap = makeSampleSnapshot();
  let enc;
  try {
    enc = await api.encodeSnapshotLink(snap, false);
  } catch (e) {
    bad('codec.encode', '编码抛异常: ' + e.message);
    return;
  }
  assert('codec.encode-nonempty', typeof enc === 'string' && enc.length > 0, `链接长度 ${enc && enc.length}`);
  assert('codec.encode-urlsafe', /^[A-Za-z0-9_-]+$/.test(enc || ''), '编码串不得含 + / = （需 URL 安全）');

  let dec;
  try {
    dec = await api.decodeSnapshotLink(enc);
  } catch (e) {
    bad('codec.decode', '解码抛异常: ' + e.message);
    return;
  }
  if (!assert('codec.decode-notnull', dec && Array.isArray(dec.notes), '解码应返回快照对象')) return;

  assert('codec.teacher-preserved', dec.teacher === snap.teacher, `${dec.teacher} vs ${snap.teacher}`);
  assert('codec.count-preserved', dec.notes.length === snap.notes.length, `${dec.notes.length} vs ${snap.notes.length} 封`);

  snap.notes.forEach((n, i) => {
    const m = dec.notes[i] || {};
    assert(`codec.text[${i}]`, m.text === n.text, i === 2 ? '含特殊字符/换行的正文原样还原' : '正文原样还原');
    assert(`codec.color[${i}]`, m.color === n.color, '信纸色还原');
    assert(`codec.signature[${i}]`, m.signature === n.signature, '署名还原');
    assert(`codec.date[${i}]`, m.date === n.date, '日期还原');
    near(`codec.rotate[${i}]`, m.rotate, n.rotate, 1e-6, '倾角还原');
    // fx/fy 经 pct→unpct 会量化到整数百分比，容差 0.01 属预期行为
    near(`codec.fx[${i}]`, m.fx, n.fx, 0.01, '横向落位比例还原(量化内)');
    near(`codec.fy[${i}]`, m.fy, n.fy, 0.01, '纵向落位比例还原(量化内)');
  });

  // --- #k1= 前缀契约 + 往返稳定 ---
  const hash = '#' + api.SNAPSHOT_PREFIX + enc;
  assert('codec.hash-prefix', hash.startsWith('#k1='), `快照 hash 前缀为 ${api.SNAPSHOT_PREFIX}`);
  const dec2 = await api.decodeSnapshotLink(hash.slice(1 + api.SNAPSHOT_PREFIX.length));
  assert('codec.redecode-stable', dec2 && dec2.notes.length === snap.notes.length && dec2.notes[0].text === snap.notes[0].text, '按 hash 切片再解码结果稳定');

  // --- 空墙往返 ---
  const encEmpty = await api.encodeSnapshotLink({ v: 1, teacher: '李', notes: [] }, false);
  const decEmpty = await api.decodeSnapshotLink(encEmpty);
  assert('codec.empty-notes', !!decEmpty && decEmpty.notes.length === 0 && decEmpty.teacher === '李', '零便签的墙也能往返');

  // --- 健壮性：脏数据绝不抛异常，只返回 null ---
  let threw = false;
  let garbageRes;
  try {
    garbageRes = await api.decodeSnapshotLink('not!base64url~~');
  } catch (e) {
    threw = true;
  }
  assert('codec.garbage-null', !threw && garbageRes === null, '非法 hash 必须解出 null 且不抛异常');
  assert('codec.empty-hash-null', (await api.decodeSnapshotLink('')) === null, '空 hash 解出 null');

  // --- compactToSnapshot 拒绝畸形结构 ---
  assert('codec.compact-nonarray', api.compactToSnapshot(null) === null, '非数组 -> null');
  assert('codec.compact-badv', api.compactToSnapshot([2, 'x', []]) === null, '版本号非 1 -> null');
  assert('codec.compact-badteacher', api.compactToSnapshot([1, 123, []]) === null, '老师名非字符串 -> null');

  // --- 非法颜色回退到 PAPER_COLORS[0]（防脏数据 / XSS 注入色值）---
  const encBad = await api.encodeSnapshotLink(
    { v: 1, teacher: 'T', notes: [{ text: 'a', color: 'javascript:alert(1)', signature: '', date: '', fx: 0.5, fy: 0.5, rotate: 0, image: null }] },
    false,
  );
  const decBad = await api.decodeSnapshotLink(encBad);
  assert('codec.color-fallback', !!decBad && /^#[0-9a-fA-F]{3,8}$/.test(decBad.notes[0].color), '非法色值被兜底为合法十六进制');
}

// -----------------------------------------------------------------------------
// Suite 2: 便签三态交互状态机骨架（静态冒烟）
// -----------------------------------------------------------------------------
function has(needle) {
  return mainSrc.includes(needle);
}
function runInteractionSuite() {
  section('[Suite 2] 便签交互三态分发  拖动落位 / 单击查看 / 双击删除 (静态冒烟)');

  // 事件骨架：Pointer Events 三态分发所依赖的监听器
  assert('ui.pointerdown', has("'pointerdown'"), 'pointerdown 监听在位');
  assert('ui.pointermove', has("'pointermove'"), 'pointermove 监听在位');
  assert('ui.pointerup', has("'pointerup'"), 'pointerup 监听在位（三态在此分发）');
  assert('ui.pointercancel', has("'pointercancel'"), 'pointercancel 兜底在位');

  // 判定阈值：拖动 vs 点击、单击 vs 双击
  assert('ui.drag-threshold', has('Math.abs(dx) > 3'), '拖动阈值(>3px) 在位');
  assert('ui.double-tap-window', has('lastTapTime < 320'), '双击窗口(<320ms) 在位');

  // 三条动作边
  assert('ui.drag-saves-position', has('updateNotePosition('), '拖动后写回位置(updateNotePosition)');
  assert('ui.drag-reset-tap', has('lastTapTime = 0'), '拖动后重置 tap 计时(避免误判双击)');
  assert('ui.double-arms-delete', has('state.pendingDeleteIdx = idx'), '双击置待删下标');
  assert('ui.double-opens-confirm', has('state._openDeleteModal'), '双击弹删除确认模态');
  assert('ui.single-opens-view', has('openNoteView(idx)'), '单击弹查看全文');

  // 键盘可达性（a11y）
  assert('ui.kb-view', has("e.key === 'Enter'"), 'Enter 查看');
  assert('ui.kb-delete', has("e.key === 'Delete'"), 'Delete 删除');

  // 确认删除才真正移除
  assert('ui.confirm-deletes', has('deleteNote(state.pendingDeleteIdx)'), '确认按钮调用 deleteNote');
}

// -----------------------------------------------------------------------------
// Suite 3: main.js <-> index.html 的 DOM 节点契约（跨文件一致性）
// -----------------------------------------------------------------------------
const CRITICAL_IDS = [
  'topbar', 'topbar-title', 'teacher-grid', 'add-teacher-btn',
  'notes-canvas', 'wall-toast',
  'delete-modal', 'delete-quote', 'delete-cancel-btn', 'delete-confirm-btn',
  'delete-teacher-modal', 'delete-teacher-quote', 'delete-teacher-hint',
  'note-view-modal', 'note-view-close-btn', 'note-view-signature', 'note-view-date',
  'share-modal', 'add-modal', 'new-teacher-input', 'add-confirm-btn', 'add-cancel-btn',
  'keyword-input', 'color-picker', 'impression-teacher-name',
];
function runDomContractSuite() {
  section('[Suite 3] DOM 节点契约  main.js 依赖的关键 id 必须存在于 index.html');

  let missing = 0;
  for (const id of CRITICAL_IDS) {
    const present = htmlSrc.includes(`id="${id}"`);
    if (!present) missing++;
    assert(`dom.${id}`, present, present ? '已定义' : 'index.html 中缺失');
  }
  // main.js 侧仍需引用核心画布，双向都别改坏
  assert('dom.canvas-referenced', mainSrc.includes("getElementById('notes-canvas')"), 'main.js 仍引用 notes-canvas');
  assert('dom.entry-route', has("startsWith('#' + SNAPSHOT_PREFIX)"), '入口仍按 #k1= 前缀识别快照链接');
  void missing;
}

// -----------------------------------------------------------------------------
// 入口
// -----------------------------------------------------------------------------
console.log('Unfading Wall · 改动后验证  (node tools/verify.mjs)');
console.log(`Node ${process.version} · 目标 main.js ${mainSrc.length}B, index.html ${htmlSrc.length}B`);

await runCodecSuite();
runInteractionSuite();
runDomContractSuite();

console.log('\n' + '='.repeat(56));
const total = passCount + failCount;
if (failCount === 0) {
  console.log(`结果: 全部通过  ${passCount}/${total}  ✔ 关键行为不变量未被破坏`);
  process.exitCode = 0;
} else {
  console.log(`结果: 失败 ${failCount} / 共 ${total}  ✘  未通过项: ${failures.join(', ')}`);
  console.log('请对照 README「✅ 改动后验证」小节的说明定位回归。');
  process.exitCode = 1;
}
