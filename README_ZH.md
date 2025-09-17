# 中文文档

## 功能特性

- 🔍 **API 请求拦截**: 自动劫持 Claude Code 的 API 调用
- 📊 **可视化界面**: 直观的 Web 界面展示所有请求和响应
- 🛠️ **Tool 调用分析**: 详细记录和展示 tool 的调用情况
- 💬 **Prompt 可视化**: 清晰展示系统 prompt 和用户消息
- 📝 **会话管理**: 支持多个会话的记录和切换
- 🎨 **美观界面**: 现代化的暗色主题界面

## 安装

```bash
npm install -g claude-code-proxy
```

## 使用方法

### 启动代理

```bash
claude-code-proxy
```

运行后将自动：
1. 修改全局安装的 Claude Code CLI 文件
2. 启动本地服务器 (http://localhost:3000)
3. 自动打开浏览器查看界面

### 工作原理

该工具通过以下步骤工作：

1. **CLI 劫持**: 修改 Claude Code 的 `cli.js` 文件，注入拦截代码
2. **请求拦截**: 拦截 `beta.messages.create` API 调用
3. **数据记录**: 将所有请求和响应记录到日志文件
4. **可视化展示**: 通过 Web 界面解析和展示数据

## 界面功能

### 主界面

- **Conversation**: 展示当前会话的输入和输出
- **Global Tool Set**: 显示所有可用的工具定义
- **Guessed System Prompts**: 智能识别的系统提示词

### 功能按钮

- **Create New Log**: 创建新的日志会话
- **Choose Example**: 选择历史会话记录
- **导航按钮**: 在多个会话间切换

### 数据展示

- **Input 面板**:
  - 模型参数 (model, max_tokens, temperature)
  - 系统消息
  - 可用工具列表
  - 用户消息

- **Output 面板**:
  - 响应类型和令牌使用情况
  - AI 回复内容 (支持 Markdown 渲染)
  - Tool 调用活动
  - 其他响应字段

## 技术实现

### CLI 修改

工具会自动找到全局安装的 `@anthropic-ai/claude-code` 包，并修改其 `cli.js` 文件：

1. 备份原始文件为 `cli.bak`
2. 使用 `js-beautify` 格式化代码
3. 注入拦截代码到构造函数中
4. 重新设置可执行权限

### 数据拦截

注入的代码会：
- 拦截 `this.beta.messages.create()` 调用
- 记录输入参数到日志文件
- 拦截流式和非流式响应
- 记录 tool 调用详情

## 安全说明

此工具仅用于开发和调试目的，会修改 Claude Code 的安装文件。使用前请确保：
- 了解工具的工作原理
- 在开发环境中使用
- 定期备份重要数据

## 系统要求

- Node.js >= 18
- 已安装 Claude Code CLI (`@anthropic-ai/claude-code`)
- 支持的操作系统: macOS, Linux, Windows

## 故障排除

### Claude Code 未找到
确保已正确安装 Claude Code CLI：
```bash
npm install -g @anthropic-ai/claude-code
```

### 权限问题
在 macOS/Linux 上可能需要管理员权限：
```bash
sudo claude-code-proxy
```

### 重置 Claude Code
如需恢复原始 Claude Code：
1. 找到安装目录中的 `cli.bak` 文件
2. 将其重命名为 `cli.js`

## 注意事项

⚠️ **重要提醒**:
- 此工具会修改 Claude Code 的安装文件
- 仅建议在开发环境中使用
- 使用前请备份重要数据
- 工具记录的数据可能包含敏感信息，请妥善保管