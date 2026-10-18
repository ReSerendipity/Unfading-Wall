# 发布 / 回滚 规范（Unfading-Wall 本仓本地化）

> **来源与权威**：公共条款见 `ReSerendipity/.github` 的 `REPOSITORY_GUIDELINES.md` §10（发布 / 分发统一规范）。
> 本文件是本仓的落地版本：只填本仓特有内容，不重写、不抵触 §10 的公共条款。
> 占位符已逐项替换为本仓真值；未确定项统一标注「待定（负责人 + 触发条件）」。

---

## 0. 远端优先（根原则，不可改写）

**远端优先**：发布链的构建、打包、扫描、上传、推送全部在 GitHub Actions 远端完成；本地只做三件事——改版本位、落 CHANGELOG、`git tag` + `git push`。本地不执行打包 / 镜像构建 / 发布上传。

> 本仓为纯静态站点，当前既无构建也无打包步骤；一旦未来引入可分发产物，一律按本节在远端 Actions 完成，不在本地产出交付物后手工上传。

## 1. 版本号规范

- 遵循 **SemVer** `MAJOR.MINOR.PATCH`；预发布用 `-alpha.N` / `-beta.N` / `-rc.N`。
- **唯一权威版本位**：`package.json` 顶层 `"version"`（当前 `1.0.0`，对应已有 tag `v1.0.0`）。
- 必须同步的其它版本位：**无**（全仓 `grep` 版本串 `1.0.0` 仅命中 `package.json` 一处；`index.html` / `main.js` / `style.css` 不内嵌版本号）。
- 版本位漂移由 **待定（负责人 + 触发条件）** 钉住——当前 `tools/verify.mjs` 校验的是 URL 编解码往返、便签状态机骨架与 DOM 节点契约三类行为不变量，**不**校验版本位一致性；未来版本位若增至两处及以上，再补版本一致性测试。
- 自动化方式：**手动 tag（人工）**。本仓未引入 release-please；发版时人工改 `package.json` → 本地打 tag → push tag。无自动/人补之分。

## 2. CHANGELOG 管理

- 遵循 **Keep a Changelog**：`Added / Changed / Fixed / Deprecated / Removed / Security`。
- 每次合并 `main` 在 `[Unreleased]` 追加；type 映射 `feat→Added`、`fix→Fixed`、`refactor→Changed`。
- 发版时 `[Unreleased]` → `[VERSION] - YYYY-MM-DD`。
- **现状说明**：本仓**已建立根目录 [`CHANGELOG.md`](../CHANGELOG.md)**，并已回填首发版本 `[1.0.0] - 2026-09-08`；后续变更在 `[Unreleased]` 追加，发版时转为 `[VERSION] - YYYY-MM-DD`。

## 3. 发布流程（远端）

1. 确认 `[Unreleased]` 条目完整（`CHANGELOG.md` 已建立）。
2. 同步版本位：改 `package.json` 顶层 `version`（当前唯一权威位）。
3. 本地打 tag 并推送：`git tag v<X.Y.Z>` → `git push origin v<X.Y.Z>`。
4. 远端凭 tag 触发发布链构建产物——**本仓当前无 tag 触发的发布 workflow**（见 §4 产物判定）。
5. 远端建 **draft Release** 并挂资产 → 人工审核后 `published`（仅当 §4 出现可分发产物时执行）。
6. 盯到终态：`gh run list` 确认绿；红了当场修或 revert 止损。

> 本仓的线上部署是 **GitHub Pages 从 `main` 自动发布**（见 §10.4 远端侧），与「tag 驱动的 Release 产物」是两条独立链路：Pages 随 `main` 推送即更新，不依赖 tag。

## 4. 分发产物与完整性

**本仓判定：暂无发布产物，发布链待需要时再建。**

判断依据（逐项核验）：

| 核验项 | 结论 |
|---|---|
| 可编译/打包二进制（wheel / sdist / 可执行文件） | 无——原生 HTML/CSS/JS，零构建 |
| npm 包发布 | 无——`package.json` 标 `"private": true`，自述「仅用于挂载零依赖验证脚本，不参与页面运行，也不需要 npm install」 |
| 容器镜像（ghcr.io） | 无——无 `Dockerfile`、无 `docker/build-push-action` 引用 |
| 桌面安装包（Tauri / NSIS / APK） | 无——纯 Web 页面，无桌面壳 |
| CI 产出物上传 Release | 无——`.github/workflows/` 下仅 `ci.yml`（跑 `npm run verify`），无 `release.yml` |
| 运行时「导出单文件 HTML」 | 浏览器端用户动作，非 CI 构建产物，不构成 Release 资产 |

因此本单**不新建** `.github/workflows/release.yml`，也不预置 `SHA256SUMS`。未来若引入可分发产物（例如预打包的桌面壳、可下载的单文件发行版、或发布到 npm），再按 §10.1–§10.3 建最小 tag 驱动发布链（`push: tags: v*` → 远端构建 → draft Release 挂资产 → 人工发布），并在本表补一行产物。

公共条款仍生效（即使当前无产物）：

- 容器镜像（未来若有）：推 `ghcr.io`，`packages: write`；tag 取 semver + `sha`，**不得以 `latest` 作发布基线**。
- 镜像发布前须经 Trivy `CRITICAL,HIGH`（`ignore-unfixed`）阻断；豁免逐条登记在 `.trivyignore.yaml`（理由 + expiration）。
- 镜像链须开 `provenance: true` + `sbom: true`。
- **不使用 GPG 分离签名**（2026-10-18 裁决）。

## 5. 回滚

- **判定**（满足任一即触发）：待定（负责人 + 触发条件）——本仓当前无线上可用性监控/告警，回滚阈值待引入监控后定义。
- **执行**：Pages 部署从 `main` 自动触发，回滚以 `git revert <bad-commit>` 合入 `main` 为主（保历史、可再 forward），Pages 随即重发上一版静态文件；不可变产物无。**禁止**重指向或删除既有 tag（如 `v1.0.0`）。
- **破坏性动作**：重指向 / 删除 tag、移动任何远端 ref → **须仓库所有者单独授权**。
- **回滚后验证**：`npm run verify`（零依赖，覆盖 URL 编解码往返 / 便签状态机 / DOM 契约）全绿 + GitHub Pages 线上冒烟（首页可打开、写一张便签走通 URL 分享编解码）。

## 6. SLA / 错误预算

- 目标可用性：待定（负责人 + 触发条件）——本仓为个人静态站，无 SLA 承诺、无错误预算量化；若未来面向稳定用户群，再按 §10.4 定义目标可用性与错误预算。

## 7. 发布前检查清单

- [x] 版本位全部同步（§1：当前仅 `package.json` 一处，无漂移动作）
- [ ] CHANGELOG `[Unreleased]` 已改版本 + 日期（`CHANGELOG.md` 已建立，发版时执行）
- [x] `npm run verify` 通过（CI 门禁，见 `.github/workflows/ci.yml`）
- [x] lint / format 全绿——本仓零依赖、无 ESLint/Prettier 配置，`npm run verify` 即唯一质量门禁
- [ ] 镜像类仓：Trivy 阻断通过（N/A，无镜像）
- [ ] 镜像类仓：`provenance: true` + `sbom: true` 已开（N/A，无镜像）
- [x] **本地未产出任何发布交付物**（全部远端构建；本仓当前无构建）

---

## 差异点采集清单（本仓取值）

| 占位符 | 采集来源 | 本仓取值 |
|---|---|---|
| 版本位文件与字段 | `package.json` | 顶层 `"version"` = `1.0.0` |
| 其它需同步版本位 | `grep -rn "1.0.0"` | 无（仅 package.json 一处命中） |
| 版本一致性校验入口 | `tools/verify.mjs` | 待定（负责人 + 触发条件）——现有 verify 不校验版本位 |
| 自动化方式 | `.github/workflows/`（无 release-please） | 手动 tag（人工） |
| 发布 workflow 文件名 | `.github/workflows/` | 暂无（无可分发产物，发布链待需要时再建） |
| 产物形态与标签规则 | 构建 workflow | 暂无（纯静态站，Pages 从 main 托管） |
| 完整性手段 | Release 资产清单 | 暂无（未来产物附 `SHA256SUMS.txt`；无 GPG） |
| 回滚判定阈值 | 运行手册 / 监控 | 待定（负责人 + 触发条件） |
| 回滚后验证命令 | `tools/verify.mjs` | `npm run verify` + Pages 线上冒烟 |
| 技术栈 | `package.json` / 静态站 | 原生 HTML/CSS/JS（ESM），零运行时依赖；Node 18+ 仅跑 verify |
| 部署目标 | `.nojekyll` / Pages 设置 | GitHub Pages（main 分支根目录，禁 Jekyll） |

## 禁止事项

- 不得重写 §10 的公共条款（远端优先、tag 驱动、版本位一致、不可变标签、扫描阻断、无 GPG）。
- 不得引入 `latest` 作发布基线；不得保留或新建 GPG 签名流程。
- 不得留空占位符，不得编造阈值。
