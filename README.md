<p align="center">
  <img src="./banner.svg" width="100%" alt="ydflow — AI Agent Engineering · Open Source" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Class%20of-2028-2563eb?style=for-the-badge" alt="2028 届在校生" />
  <img src="https://img.shields.io/badge/Focus-AI%20Agent-0f766e?style=for-the-badge" alt="专注 AI Agent" />
  <a href="mailto:m5a5@163.com"><img src="https://img.shields.io/badge/Email-m5a5%40163.com-334155?style=for-the-badge" alt="Email: m5a5@163.com" /></a>
</p>

## 👋 关于我

你好，我是 **ydflow**，一名 **2028 届在校大学生**，目前专注 AI Agent 工程实践。

我关注 Agent 接入真实工具后的可靠性：权限检查能否守住写操作，状态文件能否在失败时保持完整，多模态上下文能否在重试中保真，MCP 服务能否真正退出。我通过可复现的修复、测试和上游 PR 推进这些工作。

## 🛠️ Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=ts,js,python,react,nodejs,vite,git,github&amp;theme=dark&amp;perline=8" alt="TypeScript, JavaScript, Python, React, Node.js, Vite, Git, GitHub" />
</p>

---

## 上游贡献 · 已合并

- **工具权限 · [AgentScope #2883](https://github.com/agentscope-ai/agentscope/pull/2883)** — 修正 `git branch -D` 等写操作被判为只读、绕过权限流程的问题；未知参数回到正常的权限判断。
- **状态一致性 · [teamai-cli #855](https://github.com/Tencent/teamai-cli/pull/855) / [#841](https://github.com/Tencent/teamai-cli/pull/841)** — 原子写入状态文件与搜索索引；串行化事件日志的追加和压缩，避免截断与并发丢失。
- **上下文与记忆 · [AgentScope #2860](https://github.com/agentscope-ai/agentscope/pull/2860) / [OpenViking #5312](https://github.com/volcengine/OpenViking/pull/5312)** — 在验证重试中保留多模态目标结构；让排除子树的配置真正进入记忆召回请求。
- **MCP 生命周期 · [Shep #883](https://github.com/shep-ai/shep/pull/883)** — 等待服务进程实际退出，优雅关闭超时后升级终止。

## 项目实践

- **[JianYing Editor Skill · Reliable Edition](https://github.com/ydflow/jianying-editor-skill-reliable)** — 基于 [jianying-editor-skill](https://github.com/luoluoluo22/jianying-editor-skill) 的二次开发；加入草稿备份、只读诊断、剪映版本预检和真实 MP4 转码。
- **[AI Digital Human](https://github.com/ydflow/cyber-girlfriend-16gb)** — 用 React、Node.js 和 Python 串联 ASR → LLM → TTS → 本地口型动画；运行需自备模型与服务凭据。
- **[日序 · 每天都有安排](https://github.com/ydflow/rixu-miniprogram-open)** — 本地优先的微信原生 TypeScript 小程序，可选 CloudBase 同步；仍在开发和验收中。

---

[已合并 PR](https://github.com/search?q=type%3Apr+author%3Aydflow+is%3Amerged&type=pullrequests) · [开放中的 PR](https://github.com/search?q=type%3Apr+author%3Aydflow+is%3Aopen&type=pullrequests) · [联系我](mailto:m5a5@163.com)
