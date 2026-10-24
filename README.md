<p align="center">
  <img src="./profile-banner.png" width="100%" alt="ydflow — AI Agent Engineering · Open Source，海边雏菊插画横幅" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Nunito&amp;weight=600&amp;size=22&amp;duration=3600&amp;pause=1400&amp;color=3B91C8&amp;center=true&amp;vCenter=true&amp;width=820&amp;height=52&amp;lines=Dream+of+building+AI+agents+that+can+be+trusted+with+real+work." alt="Dream of building AI agents that can be trusted with real work." />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Class%20of-2028-2563eb?style=for-the-badge" alt="2028 届在校生" />
  <img src="https://img.shields.io/badge/Focus-AI%20Agent-0f766e?style=for-the-badge" alt="专注 AI Agent" />
  <a href="mailto:m5a5@163.com"><img src="https://img.shields.io/badge/EMAIL-m5a5%40163.com-e85d4a?style=for-the-badge&amp;logo=gmail&amp;logoColor=white&amp;labelColor=b83d35" alt="Email: m5a5@163.com" /></a>
</p>

## 👋 关于我

你好，我是 **ydflow**，一名 **2028 届本科生**，目前正在寻找 **AI Agent 开发相关实习**。

我关注 Agent 如何在真实工具与长任务中可靠工作：工具调用是否受权限约束，状态能否恢复，结论能否追溯证据，失败能否通过 Trace / Eval 被发现和复现。我在个人项目与已合并的上游 PR 中持续验证这些问题。

我也探索 **AI 数字人**的交互与记忆表达，并将金融研究兴趣落实在本地 AI 投资研究工作台「研迹」。欢迎通过 [邮箱](mailto:m5a5@163.com) 交流。

## 🛠️ 技术与创作工具

<p align="center">
  <img src="https://skillicons.dev/icons?i=ts,js,python,react&amp;theme=dark&amp;perline=4" alt="TypeScript, JavaScript, Python, React" />
  <img src="https://skillicons.dev/icons?i=nodejs,vite,git,github&amp;theme=dark&amp;perline=4" alt="Node.js, Vite, Git, GitHub" />
</p>
<p align="center">
  <img src="./tech-icons/FastAPI.svg" width="48" height="48" alt="FastAPI" title="FastAPI" />
  <img src="./tech-icons/SQLite.svg" width="48" height="48" alt="SQLite" title="SQLite" />
  <img src="./tech-icons/Electron.svg" width="48" height="48" alt="Electron" title="Electron" />
  <img src="./3ds-max-icon.svg" width="48" height="48" alt="3ds Max" title="3ds Max" />
  <img src="./tech-icons/Premiere.svg" width="48" height="48" alt="Premiere Pro" title="Premiere Pro" />
</p>

---

## 上游贡献 · 已合并

- **执行边界 · [AgentScope #2883](https://github.com/agentscope-ai/agentscope/pull/2883) / [TeamAI #951](https://github.com/Tencent/teamai-cli/pull/951)** — 收紧 Bash 只读判定，阻止可写 Git 命令绕过权限流程；让 `update --dry-run` 只检查版本，不安装或写入检查状态。
- **并发持久化 · [TeamAI #841](https://github.com/Tencent/teamai-cli/pull/841) / [#855](https://github.com/Tencent/teamai-cli/pull/855) / [#961](https://github.com/Tencent/teamai-cli/pull/961)** — 为事件日志、状态与索引、跨进程会话日志补上锁协调和原子替换，处理竞争覆盖与截断读取。
- **知识召回 · [TeamAI #891](https://github.com/Tencent/teamai-cli/pull/891) / [#902](https://github.com/Tencent/teamai-cli/pull/902) / [OpenViking #5312](https://github.com/volcengine/OpenViking/pull/5312)** — 统一多来源召回的排序尺度、隔离知识域 IDF 统计，并接通 DSH 插件的召回子树排除配置。
- **Agent 运行时 · [AgentScope #2860](https://github.com/agentscope-ai/agentscope/pull/2860) / [Shep #883](https://github.com/shep-ai/shep/pull/883)** — 验证重试时保留多模态目标块；MCP 服务关闭时等待退出、超时升级终止，并处理 Windows 进程树。
- **MCP 工具可靠性 · [AgentScope #3389](https://github.com/agentscope-ai/agentscope/pull/3389) / [Open Code Review #1770](https://github.com/alibaba/open-code-review/pull/1770)** — 保留仅含结构化内容的工具结果，并完整读取分页的工具清单，避免 Agent 收到空结果或漏掉可用工具。
- **沙箱 API 分页 · [CubeSandbox #1830](https://github.com/TencentCloud/CubeSandbox/pull/1830)** — 为沙箱列表补上游标分页，并同步 Python、Node、Go SDK 与 Web 前端，避免客户端只读到第一页。

## 项目实践

- **[Trail · 研迹（正式版）](https://github.com/ydflow/Trail)** — 已发布 Windows Beta 安装版与便携版的本地优先 AI 投资研究工作台；整合行情与 K 线、Agent 深度研究、证据溯源和投资逻辑复核，并以持久会话、断点恢复和离线评测检验研究流程。[![M8ven Verified](https://m8ven.ai/badge/mcp/ydflow-pi-native-crm-18xtoi?variant=verified&v=c334140390afdc95a4f966bb79065c7a)](https://m8ven.ai/mcp/ydflow-pi-native-crm-18xtoi?s=readme)
- **[Pi Native CRM · Agent 原生 CRM](https://github.com/ydflow/pi-native-crm)** — 团队内部研发的 CRM 工作台；作为核心开发者之一，负责 Agent 受控执行链路，包括 CRM 工具授权、Pi/Harness 运行、持久 Worker 恢复及证据与 Eval 核验，使业务读写有边界、可追溯。
- **[研迹 · ResearchTrail（先行版）](https://github.com/ydflow/research-trail)** — 已发布 Windows v1.0.0 的本地 AI 投资研究工作台；使用py架构并且接入离线pi loop架构比较两者区别 供自己学习比较，为研迹正式版开发做功能先行如接入热力图等稳定测试。
- **[故障智巡 · Incident Response Agent](https://github.com/ydflow/incident-response-agent)** — 线上服务故障调查与模拟处置平台；在本地受控演示中只读取证、引用证据诊断，通过审批门控与事件回放记录决策；尚未接入生产处置。
- **[剪映自动化 Skill · Reliable Edition](https://github.com/ydflow/jianying-editor-skill-reliable)** — 在 [上游项目](https://github.com/luoluoluo22/jianying-editor-skill) 基础上的可靠性增强：草稿备份、只读诊断、版本预检、媒体保真与真实 MP4 转码。
- **[AI Digital Human](https://github.com/ydflow/cyber-girlfriend-16gb)** — 支持自定义角色的逐轮语音数字人原型；串联云端语音与对话服务、本地口型和表情视频生成。
- **[日序 · 每天都有安排](https://github.com/ydflow/rixu-miniprogram-open)** — 开发中的本地优先微信原生 TypeScript 日程小程序；支持事项、日历与专注，可选 CloudBase 同步。

---

<p align="center">
  <a href="https://github.com/search?q=type%3Apr+author%3Aydflow+is%3Amerged&amp;type=pullrequests"><img src="./footer-merged-v3.svg" width="188" height="56" alt="已合并 PR" /></a>
  <a href="https://github.com/search?q=type%3Apr+author%3Aydflow+is%3Aopen&amp;type=pullrequests"><img src="./footer-open-v3.svg" width="188" height="56" alt="开放中的 PR" /></a>
  <a href="mailto:m5a5@163.com"><img src="./footer-email-v3.svg" width="188" height="56" alt="联系我" /></a>
</p>
