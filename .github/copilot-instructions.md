# AI Agent Instructions for cl-first-vscode-extension

这个文档为 AI 代理提供了在这个 VS Code 扩展项目中工作的关键信息和指导。

## 项目概述

这是一个 VS Code 扩展项目，主要功能包括：
- 提供一个名为 "Create HP Component" 的命令
- 在活动栏中添加一个自定义视图容器 "CL Extension"
- 与外部 AI 服务（IdeaLAB API）进行集成

## 关键组件和架构

### 主要文件
- `src/extension.ts`: 扩展的主入口文件，包含命令注册和 AI 服务集成
- `src/utils.ts`: 通用工具函数
- `package.json`: 扩展配置，定义了命令、视图和激活事件

### 集成点
1. **IdeaLAB API 集成**
   - 基础 URL: `https://aistudio.alibaba-inc.com/api/aiapp/run`
   - 默认 app_code: "PAWigAXDwum"
   - 认证通过 X-AK header 实现

2. **VS Code API 使用**
   - 使用 TreeView API 实现自定义视图
   - 通过 commands API 注册和处理命令

## 开发工作流

### 构建和测试
1. 开发模式下启动：
   ```bash
   npm run watch
   ```
2. 运行测试：
   ```bash
   npm run watch-tests
   ```

### 代码约定
1. **错误处理**：使用 try-catch 包装所有 API 调用，确保错误被正确记录和处理
2. **类型安全**：严格使用 TypeScript 类型，特别是在处理 API 响应时
3. **UI 组件**：使用 TreeItem 作为自定义视图的基本显示单元

## 常见开发任务

### 添加新命令
1. 在 `package.json` 的 `contributes.commands` 中注册命令
2. 在 `extension.ts` 中实现命令处理函数
3. 在 `activate` 函数中注册命令

### 扩展视图
1. 在 `package.json` 的 `contributes.views` 中定义新视图
2. 创建对应的 TreeDataProvider 实现
3. 在 `activate` 中注册视图

## 注意事项
- 所有与 IdeaLAB API 的通信都应使用 `getModuleHelperWorkflow` 函数
- 扩展激活事件在 `package.json` 中明确定义
- 使用 webpack 进行构建优化，确保发布包大小最小化

## 调试提示
- 使用 VS Code 的扩展开发主机窗口进行调试
- 检查控制台输出中的日志信息
- API 响应错误会被记录到控制台