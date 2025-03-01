# 贡献指南

感谢您对AI Code Team项目的关注！我们欢迎各种形式的贡献，包括但不限于功能开发、bug修复、文档改进和测试用例编写。

## 开发环境设置

1. 克隆项目
```bash
git clone https://github.com/yourusername/AI_Agent_code_web.git
cd AI_Agent_code_web
```

2. 安装前端依赖
```bash
cd frontend
npm install
```

3. 安装后端依赖
```bash
cd backend
pip install -r requirements.txt
```

## 代码风格指南

### 前端
- 使用TypeScript编写所有新代码
- 遵循ESLint配置的代码风格
- 组件使用函数式组件和React Hooks
- 使用TailwindCSS进行样式设计
- 文件命名采用PascalCase（如ComponentName.tsx）

### 后端
- 遵循PEP 8代码风格指南
- 使用类型注解
- 为所有函数和类编写文档字符串
- 文件命名采用snake_case（如file_name.py）

## 提交流程

1. 创建新分支
```bash
git checkout -b feature/your-feature-name
```

2. 进行更改并提交
```bash
git add .
git commit -m "feat: 添加了新功能"
```

我们使用[约定式提交](https://www.conventionalcommits.org/)规范，提交信息格式如下：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码风格更改（不影响代码运行）
- `refactor`: 代码重构
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动

3. 推送到远程仓库
```bash
git push origin feature/your-feature-name
```

4. 创建Pull Request
   - 填写PR模板
   - 描述你的更改
   - 关联相关Issue

## 代码审查

所有PR都需要通过代码审查才能合并。请确保：
- 代码通过所有自动化测试
- 遵循代码风格指南
- 包含适当的测试
- 更新相关文档

## 问题报告

如果你发现了bug或有新功能建议，请创建一个Issue：
- 使用提供的Issue模板
- 提供详细的复现步骤
- 描述预期行为和实际行为
- 如果可能，提供截图或错误日志

## 许可证

通过贡献代码，你同意你的贡献将在MIT许可证下发布。 