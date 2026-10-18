# Changelog

「黑板 · 上的话（Unfading Wall）」的所有重要变更记录于此。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本 SemVer](https://semver.org/lang/zh-CN/)。
本仓的发布 / 回滚流程见 [`docs/release-governance.md`](./docs/release-governance.md)。
版本位唯一权威来源为 [`package.json`](./package.json) 顶层 `"version"`。

## [Unreleased]

### Added

- 新增根级 `CHANGELOG.md`（本文件），按治理规范 §10.2 遵循 Keep a Changelog。
- 新增发布 / 回滚规范文档 [`docs/release-governance.md`](./docs/release-governance.md)（#1）。
- 接入仓库自带的零依赖改动后验证脚本（`npm run verify`）作为 push / PR 门禁。

### Changed

- README 在线演示入口收敛为 GitHub Pages，并补充艾可秀双链接。
- README 修正目录树，移除已停止跟踪的 `.qoder/`。
- `LICENSE` 补加版权声明行。
- 落地 DX 报告机械项（P1-3 / P1-4 / P3-8 / P3-9）。

### Removed

- 停止跟踪 `.qoder/` AI 工具链产物（P1-2）。

## [1.0.0] - 2026-09-08

首个正式版本。

### Added

- 学生手写便签贴上老师的黑板墙（拖动 / 单击查看 / 双击撕掉）。
- 零后端「寄墙」分享：信件内容压缩编码进链接，老师点开即见。
- 附图以缩略图随链接携带；「导出这一墙」生成自包含单文件 HTML，可带走原图。
- 老师端只读保护 + 一键「收下这面墙」。
- 键盘全可达 / XSS 转义 / localStorage 自愈 / 3 套移动端适配。

[Unreleased]: https://github.com/ReSerendipity/Unfading-Wall/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ReSerendipity/Unfading-Wall/releases/tag/v1.0.0
