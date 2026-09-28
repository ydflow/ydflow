# ydflow

**AI Agent 工程实践** · 工具权限 / 状态一致性 / 上下文可靠性

我关注 Agent 接入真实工具后容易失效的环节：写操作被误放行、状态文件被截断、多模态目标在重试中失真，以及 MCP 进程无法退出。下面是我提交并已合并到上游的部分修复。

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
