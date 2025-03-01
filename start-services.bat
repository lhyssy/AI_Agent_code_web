@echo off
echo 正在启动AI Code Team服务...
echo.

echo 启动前端服务...
start cmd /k "cd frontend && npm run dev"

echo 启动后端服务...
start cmd /k "cd backend && cd src && python app.py"

echo.
echo 服务启动完成!
echo 请访问 http://localhost:3000 查看应用
echo. 