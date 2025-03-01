from datetime import datetime
from typing import Dict, List, Literal, Optional
from uuid import uuid4

class Agent:
    def __init__(self, name: str, role: str, description: str, ws_handler=None):
        self.agent_id = str(uuid4())
        self.name = name
        self.role = role
        self.description = description
        self.status = "idle"
        self.current_task = None
        self.ws_handler = ws_handler
        
    def update_status(self, status: str, data: Dict = None):
        """更新Agent状态并通过WebSocket广播"""
        self.status = status
        if self.ws_handler:
            self.ws_handler.emit_agent_status(self.name, status, data)
            
    def process(self, input_data: Dict) -> Dict:
        """处理输入数据并返回结果"""
        raise NotImplementedError
        
    def to_dict(self) -> Dict:
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "role": self.role,
            "description": self.description,
            "status": self.status,
            "current_task": self.current_task
        }

class TeamLeader(Agent):
    def __init__(self, ws_handler=None):
        super().__init__(
            name="Mike",
            role="Team Leader",
            description="负责任务分配和团队协调",
            ws_handler=ws_handler
        )
    
    def process(self, input_data: Dict) -> Dict:
        """分析任务并分配给团队成员"""
        self.update_status("processing", {"task": "任务分析"})
        response = {
            "type": "task_assignment",
            "content": "任务已分配给团队成员",
            "assignments": {
                "Emma": "需求分析",
                "Bob": "架构设计",
                "Alex": "代码实现",
                "David": "性能分析"
            }
        }
        self.update_status("completed", response)
        return response

class ProductManager(Agent):
    def __init__(self, ws_handler=None):
        super().__init__(
            name="Emma",
            role="Product Manager",
            description="负责需求分析和功能规划",
            ws_handler=ws_handler
        )
    
    def process(self, input_data: Dict) -> Dict:
        """分析用户需求并制定功能规格"""
        self.update_status("processing", {"task": "需求分析"})
        response = {
            "type": "requirements",
            "content": "需求分析完成",
            "specifications": [
                "用户界面要求",
                "功能需求",
                "性能要求",
                "安全要求"
            ]
        }
        self.update_status("completed", response)
        return response

class Architect(Agent):
    def __init__(self, ws_handler=None):
        super().__init__(
            name="Bob",
            role="Architect",
            description="负责系统架构设计",
            ws_handler=ws_handler
        )
    
    def process(self, input_data: Dict) -> Dict:
        """设计系统架构"""
        self.update_status("processing", {"task": "架构设计"})
        response = {
            "type": "architecture",
            "content": "架构设计完成",
            "design": {
                "components": ["前端组件", "后端服务", "数据库"],
                "relationships": ["API接口", "数据流"]
            }
        }
        self.update_status("completed", response)
        return response

class Engineer(Agent):
    def __init__(self, ws_handler=None):
        super().__init__(
            name="Alex",
            role="Engineer",
            description="负责代码实现",
            ws_handler=ws_handler
        )
    
    def process(self, input_data: Dict) -> Dict:
        """实现具体代码"""
        self.update_status("processing", {"task": "代码实现"})
        response = {
            "type": "implementation",
            "content": "代码实现完成",
            "code": "# Generated code here",
            "tests": ["单元测试", "集成测试"]
        }
        self.update_status("completed", response)
        return response

class DataAnalyst(Agent):
    def __init__(self, ws_handler=None):
        super().__init__(
            name="David",
            role="Data Analyst",
            description="负责数据分析和性能优化",
            ws_handler=ws_handler
        )
    
    def process(self, input_data: Dict) -> Dict:
        """分析性能和数据"""
        self.update_status("processing", {"task": "性能分析"})
        response = {
            "type": "analysis",
            "content": "性能分析完成",
            "metrics": {
                "response_time": "预估响应时间",
                "resource_usage": "资源使用评估",
                "optimization": "优化建议"
            }
        }
        self.update_status("completed", response)
        return response

class Task:
    def __init__(
        self,
        title: str,
        description: str,
        assigned_to: str,
        task_id: str = None,
        status: Literal["pending", "in_progress", "completed", "failed"] = "pending",
        created_at: datetime = None,
        deadline: datetime = None,
        priority: int = 1,
        dependencies: List[str] = None,
        artifacts: List[Dict] = None
    ):
        self.task_id = task_id or str(uuid4())
        self.title = title
        self.description = description
        self.assigned_to = assigned_to
        self.status = status
        self.created_at = created_at or datetime.utcnow()
        self.deadline = deadline
        self.priority = priority
        self.dependencies = dependencies or []
        self.artifacts = artifacts or []
        
    def to_dict(self) -> Dict:
        return {
            "task_id": self.task_id,
            "title": self.title,
            "description": self.description,
            "assigned_to": self.assigned_to,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "priority": self.priority,
            "dependencies": self.dependencies,
            "artifacts": self.artifacts
        }

class CodeArtifact:
    def __init__(
        self,
        file_path: str,
        content: str,
        language: str,
        artifact_id: str = None,
        created_at: datetime = None,
        created_by: str = None,
        version: str = "1.0.0",
        parent_version: str = None,
        commit_message: str = None,
        metadata: Dict = None
    ):
        self.artifact_id = artifact_id or str(uuid4())
        self.file_path = file_path
        self.content = content
        self.language = language
        self.created_at = created_at or datetime.utcnow()
        self.created_by = created_by
        self.version = version
        self.parent_version = parent_version
        self.commit_message = commit_message
        self.metadata = metadata or {}
        
    def to_dict(self) -> Dict:
        return {
            "artifact_id": self.artifact_id,
            "file_path": self.file_path,
            "content": self.content,
            "language": self.language,
            "created_at": self.created_at.isoformat(),
            "created_by": self.created_by,
            "version": self.version,
            "parent_version": self.parent_version,
            "commit_message": self.commit_message,
            "metadata": self.metadata
        }
        
    @staticmethod
    def increment_version(current_version: str) -> str:
        """增加版本号"""
        major, minor, patch = map(int, current_version.split('.'))
        return f"{major}.{minor}.{patch + 1}"
        
    def create_new_version(
        self,
        content: str,
        commit_message: str,
        created_by: str = None,
        metadata: Dict = None
    ) -> 'CodeArtifact':
        """创建新版本"""
        return CodeArtifact(
            file_path=self.file_path,
            content=content,
            language=self.language,
            created_by=created_by or self.created_by,
            version=self.increment_version(self.version),
            parent_version=self.version,
            commit_message=commit_message,
            metadata=metadata or {}
        ) 