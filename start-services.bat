@echo off
echo 正在启动AI Agent协作平台...

:: 首先启动后端服务
echo 正在启动后端服务...
start cmd /k "cd backend\src && python app.py"

:: 等待几秒确保后端启动
timeout /t 5 /nobreak

:: 然后启动前端服务
echo 正在启动前端服务...
start cmd /k "cd frontend && npm run dev"

echo 服务启动完成！
echo 前端访问地址: http://localhost:3000
echo 后端API地址: http://localhost:5000 