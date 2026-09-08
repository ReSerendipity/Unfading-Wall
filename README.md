# 黑板·上的话 · 师者印象墙

**教师节 Vibe Coding 挑战参赛作品。**

每个学生写下对老师的一句话（≤200 字），挑一张彩色信纸，这张便签就会出现在老师的"黑板墙"上——像被胶带贴在真黑板上一样，可以**拖动**换位置、**单击**查看全文、**双击**撕掉。

老师打开链接，看到的是一面**真实风格的黑板**，上面贴满了学生手写的话。完全抛弃 3D 粒子 / Bloom 辉光 / 渐变光效这些 AI 套路，回归**教室本身的视觉语言**。

---

## 一、本地预览（3 步）

需要：Node.js 18+ 或 Python 3。

```bash
# 进入项目目录
cd unfading-wall

# 启动一个简单的静态服务器（任选其一）

# 方式 A：Python（最简单）
python -m http.server 8765

# 方式 B：Node
npx serve -p 8765

# 浏览器打开
# http://127.0.0.1:8765/
```

> ⚠️ 必须用 HTTP 服务器打开，**不能直接 file:// 打开** —— SVG filter 滤镜需要 HTTP 上下文。

---

## 二、艾可秀（axureshow.com）部署步骤

艾可秀是国内的免费静态托管平台，国内访问速度 100ms 内，比 Vercel/Netlify 稳定得多。

### 步骤

1. **打开 [axureshow.com](https://www.axureshow.com/)，微信扫码登录**

2. **进入"项目管理" → 点击"上传新项目"**

3. **拖拽 `impression-wall.zip` 到上传区**（约 39 KB，3 个文件）
   - 也可以先解压后拖整个 `impression-wall` 文件夹（3 个文件 + README + 数据备份.md）
   - **不要上传 README.md 和数据备份.md**——它们只是本地文档

4. **等待 30 秒** —— 系统自动生成公网 HTTPS 链接 + 二维码

5. **复制链接** —— 这就是可以分享给老师/同学的公网地址

### 验证清单

打开生成的链接后，应该看到：

- [ ] 欢迎页：深绿黑板 + 木边框 + 粉笔字标题"黑板·上的话"
- [ ] 黑板上有"今日课题 + 课程表 + 值日生 + 倒计时 + 作业 + 学科涂鸦"（9 学科高中内容随机轮播）
- [ ] 黑板下方有粉笔托盘（白色亚克力盒装 9 支彩粉笔 + 木把手板擦）
- [ ] 点击"提笔" → 进入选择老师页（首次为空，显示"还没有老师"）
- [ ] 点击"记一位" → 弹模态输老师名 → 进入印象页
- [ ] 印象页：笔记本横线纸输入框（≤200 字）+ 5 色信纸 + 彩轮（自定义颜色）+ 署名 + 长日期
- [ ] 粉笔盒 9 支可选（纯白/纯黑/墨黑/朱红/橙/暖黄/草绿/青蓝/淡紫）
- [ ] 输入文字 + 选信纸 + 点"落笔" → 进入黑板墙
- [ ] 黑板墙：标题+便签+底部 4 处装饰（粉笔涂鸦/章/分享/再写/）
- [ ] **拖动便签** → 位置持久化（localStorage）
- [ ] **单击便签** → 弹查看模态（完整文字+图片+署名+日期）
- [ ] **双击便签** → 弹"撕掉这张？"确认
- [ ] 浏览器后退按钮 ← → 正确返回上一页
- [ ] 分享按钮 ↗ → 弹分享模态（链接自带信件内容 + 真 QR 码 + 复制链接 + 系统分享 + 导出这一墙）

---

## 二·五、分享是怎么工作的（重要）

零后端，所以信件只存在写信人本机的 localStorage。旧版链接只带老师名，
老师在自己的设备上打开 → 本地无数据 → 只能看到空白欢迎页（这就是曾经的 bug）。

现在链接**自带这一墙的内容**：

- 写信人点分享 → 便签（文字/署名/日期/纸色/位置/倾角）经 deflate-raw 压缩 +
  base64url 编码，塞进 URL 的 hash（`#k1=...`）。hash 不发给服务器，纯客户端可见。
- 老师打开 → 解码 → 直接进入**只读黑板墙**：能看、能点开、能挪位置，
  右下角有「存」按钮——点一下就把这些信收进本机，之后可续写、长期保留。
- 便签带**附图**时，链接会尽力携带：原图经 canvas 压成约 132px 的 JPEG 缩略图
  一并编码进 URL（老师在链接里就能看到图，但是缩小版）。若图太多、压缩后仍超
  出链接预算，会自动回退为只带文字并提示改用「导出这一墙」——那个自包含单文件
  HTML（样式/脚本/图片全内联，且会剥离托管平台注入的悬浮条与统计脚本）能完整
  带走原图，把文件发给老师双击打开即可。

限制与降级：
- 链接长度软上限 6000 字符（提示"完整复制，别截短"）、硬上限 24000（超限自动
  退回只带老师名，并提示改用导出文件）；QR 码超 1900 字符不绘制，提示用复制链接。
- 旧链接（`#teacher=xxx`）仍然可用：本机有数据就进墙，没有会弹提示说明原因。
- 老师端快照模式下的"双击抹去"只从眼前取下，不写本机、不影响写信人的原稿。

---

## 三、视觉设计

| 元素 | 实现 |
|---|---|
| 黑板底色 | 深绿渐变 + SVG 噪点滤镜模拟磨砂 |
| 木边框 | 棕色渐变 + 多层 inset shadow 立体感 |
| 粉笔字 | 毛笔字（Ma Shan Zheng）+ 小楷（ZCOOL XiaoWei）via Google Fonts + SVG `feTurbulence` 噪点滤镜 |
| 板擦划痕 | 5 处微弱粉笔灰散落（CSS radial-gradient） |
| 便利贴 | 5 种柔和色 + CSS 阴影 + 顶部胶带（半透明黄）+ 随机歪斜 |
| 粉笔写效果 | 输入时 SVG 短笔划 + 2-3 颗墨点跟随光标 |
| 黑板擦效果 | 删除时 12 颗深色粉尘向上飘散 |
| 黑板氛围 | 9 学科高中内容池 + 随机课题/课程/值日/倒计时/作业 |

### 关键 SVG 滤镜

```html
<filter id="chalk">
  <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" seed="3" />
  <feDisplacementMap in="SourceGraphic" scale="0.6" />
</filter>
```

让所有粉笔字标题都应用 `filter: url(#chalk)`，瞬间有"真粉笔写在黑板"的不规则感。

---

## 四、技术栈

- **纯 HTML + CSS + 原生 JavaScript**（无构建工具、无依赖）
- **URL hash 快照分享**：deflate-raw（CompressionStream）+ base64url，零后端也能让
  链接自带整面墙；导出模式把页面+数据内联成自包含单文件（剥离托管平台注入物）
- **SVG 滤镜**做粉笔噪点 + 黑板磨砂 + 印章纹理
- **localStorage** 持久化（老师列表 + 便签内容 + 拖动位置 + 粉笔色 + 自定义信纸色）
- **Pointer Events** 实现便签单击 / 拖动 / 双击三态分发
- **history API** 同步浏览器后退/前进
- **Google Fonts** 在线加载（Ma Shan Zheng + ZCOOL XiaoWei），有兜底（系统楷体/华文行楷）
- 零后端、零数据库、零账号注册

**代码量**：HTML 19KB + CSS 51KB + JS 65KB = **135KB**（gzip 后 ~30KB）

---

## 五、目录结构

```
impression-wall/
├── index.html      # 4 个页面 + 5 个模态 + SVG 滤镜定义
├── style.css       # 黑板/粉笔/便条/模态/响应式（3 套媒体查询）
├── main.js         # 数据持久化 + UI 切换 + 便签交互 + a11y
├── README.md       # 本文档（不部署）
└── 数据备份.md      # 旧版改动记录（不部署）
```

---

## 六、健壮性保障（上线版已修）

经过 19 项健壮性修复：

- **历史栈同步**：用 `history.pushState` + popstate 守卫，浏览器后退/前进正常工作
- **模态生命周期**：goBack 关全 5 个模态（不再漏关 note-view / share / delete-teacher）
- **localStorage 异常**：quota 满时 alert「本地已满」；数据损坏时清掉 + 一次性提示
- **跨 tab 同步**：A tab 删老师时，B tab 自动检测 + alert
- **XSS 防护**：所有用户输入（老师名/便签文本/署名）走 textContent 或 escapeHTML
- **键盘可达**：5 个模态全 role="dialog" + aria-modal + focus trap + Tab 循环；便签支持 Enter/Space 查看、Delete/Backspace 删除；ESC 关模态
- **边界场景**：窄屏便签不出框、图片白名单（拒绝 SVG）、压缩失败不静默回退原图、JSON 损坏自愈
- **移动端**：3 套媒体查询（平板/横屏/竖屏），字号 14px+，touch 事件全走 PointerEvent

---

## 七、常见问题

**Q1：浏览器打开是空白页？**
A：必须用 HTTP 服务器（见上面本地预览步骤），不能 file:// 打开。

**Q2：粉笔字不像"粉笔"？**
A：检查系统是否装了楷体/华文行楷。Mac 自带"楷体"；Windows 10+ 自带"楷体"。Linux 需要安装 `wqy-microhei` 或 `arphic`。

**Q3：便利贴能拖动但位置没保存？**
A：检查 localStorage 是否被禁用（隐私模式可能）。位置在 pointerup 时保存。

**Q4：双击删除没反应？**
A：双击间隔是 320ms。需要快速点两次。键盘用户：选中便签后按 Delete/Backspace。

**Q5：部署到 axureshow.com 后看不到 Google Fonts？**
A：检查网络。Google Fonts 在国内偶尔不稳定，但本项目有系统字体兜底（楷体/华文行楷），不会变空白。

**Q6：分享的 QR 码扫不出来？**
A：QR 码用了公共 API（api.qrserver.com），首次需要联网生成。如果失败会有文字降级"链接复制走，扫码请到站"。

**Q7：怎么自定义？**
A：
- 改 `main.js` 顶部的 `PAPER_COLORS` 数组（便条颜色）
- 改 `main.js` 顶部的 `SUBJECT_POOLS`（学科内容池）
- 改 `index.html` 的 `<h1 class="chalk-title">` 内容
- 改 `style.css` 的 `--board-bg` 等 CSS 变量

---

## 八、致谢

- 灵感：教师节 Vibe Coding 挑战（2026.9.10 截止）
- 设计思路：拒绝 3D 粒子等"AI 风"，回归教室本身
- 字体：Ma Shan Zheng + ZCOOL XiaoWei（Google Fonts）/ 系统楷体兜底

---

## 九、许可证

本项目采用 **Apache License 2.0** 开源，全文见仓库根目录 [`LICENSE`](./LICENSE)。

每个源文件在二次分发时请保留或补充如下声明（Apache 2.0 附录推荐格式）：

```
Copyright 2026 the unfading-wall project authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

> 注：`third-party assets`（Google Fonts 的 Ma Shan Zheng / ZCOOL XiaoWei 字体、
> api.qrserver.com 二维码服务）各自遵循其原始许可，不包含在本项目的 Apache 2.0 授权范围内。

