from typing import Dict, List, Optional
from datetime import datetime
from models.agent import (
    TeamLeader, ProductManager, Architect, Engineer, DataAnalyst,
    Task, CodeArtifact
)
from utils.baidu_client import BaiduClient

class MultiAgentSystem:
    def __init__(self, ws_handler=None):
        self.ws_handler = ws_handler
        self.agents = {
            "Mike": TeamLeader(ws_handler),
            "Emma": ProductManager(ws_handler),
            "Bob": Architect(ws_handler),
            "Alex": Engineer(ws_handler),
            "David": DataAnalyst(ws_handler)
        }
        self.conversation_history = []
        self.tasks: Dict[str, Task] = {}
        self.artifacts: Dict[str, CodeArtifact] = {}
        self.baidu_client = BaiduClient()
        
    def process_input(self, user_input: str) -> Dict:
        """处理用户输入，协调多个Agent完成任务"""
        # 记录用户输入
        self.conversation_history.append({
            "role": "user",
            "content": user_input,
            "timestamp": datetime.now().isoformat()
        })
        
        try:
            # 1. Mike(Team Leader)首先处理输入
            mike_prompt = f"""作为团队负责人 Mike，你的职责是分析用户需求并制定任务分配方案。请按照以下步骤处理：

1. 需求分析：
- 用户需求：{user_input}
- 请详细分析需求的关键点和目标

2. 任务分解：
- 将需求分解为具体的任务项
- 确定任务的优先级和依赖关系

3. 任务分配：
- 根据团队成员的专长分配任务
- 制定任务时间表和里程碑

请提供一个结构化的响应，包含以上各个方面。
"""
            mike_response = self.baidu_client.get_completion([
                {"role": "user", "content": mike_prompt}
            ])
            self._update_conversation("Mike", {"type": "analysis", "content": mike_response})
            
            # 2. Emma(Product Manager)进行需求分析
            emma_prompt = f"""作为产品经理 Emma，你需要从产品角度深入分析需求。请关注以下方面：

1. 用户需求：{user_input}
2. 团队负责人的分析：{mike_response}

请提供：
- 详细的功能需求说明
- 用户界面和交互设计建议
- 产品验收标准
- 可能的产品风险点
- 后续迭代建议

请从产品角度提供一个全面的分析报告。
"""
            emma_response = self.baidu_client.get_completion([
                {"role": "user", "content": emma_prompt}
            ])
            self._update_conversation("Emma", {"type": "requirements", "content": emma_response})
            
            # 3. Bob(Architect)进行架构设计
            bob_prompt = f"""作为架构师 Bob，请基于需求提供详细的技术方案。需要考虑：

1. 当前需求：
- 用户原始需求：{user_input}
- 产品需求分析：{emma_response}

2. 请提供：
- 系统架构设计
- 技术选型建议
- 数据结构设计
- 接口设计
- 安全性考虑
- 扩展性设计

请提供一个完整的技术架构方案。
"""
            bob_response = self.baidu_client.get_completion([
                {"role": "user", "content": bob_prompt}
            ])
            self._update_conversation("Bob", {"type": "architecture", "content": bob_response})
            
            # 4. Alex(Engineer)实现代码
            alex_prompt = f"""作为工程师 Alex，请提供具体的实现方案：

1. 背景信息：
- 用户需求：{user_input}
- 架构设计：{bob_response}

2. 请提供：
- 具体的代码实现方案
- 代码结构设计
- 主要功能模块的实现细节
- 单元测试计划
- 集成测试策略
- 部署方案

请提供一个详细的技术实现方案。
"""
            alex_response = self.baidu_client.get_completion([
                {"role": "user", "content": alex_prompt}
            ])
            self._update_conversation("Alex", {"type": "implementation", "content": alex_response})
            
            # 5. David(Data Analyst)进行性能分析
            david_prompt = f"""作为数据分析师 David，请对实现方案进行全面分析：

1. 分析对象：
- 实现方案：{alex_response}

2. 请提供：
- 性能瓶颈分析
- 资源使用评估
- 可能的优化建议
- 监控指标建议
- 性能测试方案
- 数据安全建议

请提供一个完整的分析报告。
"""
            david_response = self.baidu_client.get_completion([
                {"role": "user", "content": david_prompt}
            ])
            self._update_conversation("David", {"type": "analysis", "content": david_response})
            
            return {
                "conversation": self.conversation_history,
                "final_result": {
                    "mike": mike_response,
                    "emma": emma_response,
                    "bob": bob_response,
                    "alex": alex_response,
                    "david": david_response
                }
            }
            
        except Exception as e:
            error_message = f"处理请求时出错: {str(e)}"
            self._update_conversation("System", {"type": "error", "content": error_message})
            return {
                "conversation": self.conversation_history,
                "error": error_message
            }
        
    def _update_conversation(self, agent_name: str, response: Dict):
        """更新对话历史并发送WebSocket更新"""
        timestamp = datetime.now().isoformat()
        
        # 构造消息内容
        message_content = response.get('content', '')
        if isinstance(message_content, dict):
            message_content = message_content.get('content', '')
            
        # 添加到对话历史
        self.conversation_history.append({
            "role": "agent",
            "name": agent_name,
            "content": message_content,
            "timestamp": timestamp
        })
        
        # 发送WebSocket更新
        if self.ws_handler:
            # 发送Agent响应
            self.ws_handler.emit_agent_response(
                agent_name=agent_name,
                message=message_content,
                response_type=response.get('type', 'message')
            )
            
            # 如果不是第一个Agent的响应，发送连接更新
            if len(self.conversation_history) > 2:
                prev_agent = self.conversation_history[-2]
                if prev_agent["role"] == "agent":
                    self.ws_handler.emit_connection_update(
                        prev_agent["name"],
                        agent_name,
                        True
                    )
                    
    def create_task(
        self,
        title: str,
        description: str,
        assigned_to: str,
        priority: int = 1,
        dependencies: List[str] = None
    ) -> Dict:
        """创建新任务"""
        task = Task(
            title=title,
            description=description,
            assigned_to=assigned_to,
            priority=priority,
            dependencies=dependencies
        )
        self.tasks[task.task_id] = task
        
        # 更新被分配 Agent 的状态
        agent = self.agents.get(assigned_to)
        if agent:
            agent.update_status("busy", {"task": task.to_dict()})
            
        return task.to_dict()
        
    def get_task(self, task_id: str) -> Optional[Dict]:
        """获取任务详情"""
        task = self.tasks.get(task_id)
        return task.to_dict() if task else None
        
    def update_task_status(
        self,
        task_id: str,
        status: str,
        artifacts: List[Dict] = None
    ) -> bool:
        """更新任务状态"""
        if task_id not in self.tasks:
            return False
            
        task = self.tasks[task_id]
        task.status = status
        
        if artifacts:
            task.artifacts.extend(artifacts)
            
        # 更新 Agent 状态
        agent = self.agents.get(task.assigned_to)
        if agent:
            if status in ["completed", "failed"]:
                agent.update_status("idle")
            else:
                agent.update_status(status, {"task": task.to_dict()})
                
        return True
        
    def save_code_artifact(
        self,
        file_path: str,
        content: str,
        language: str,
        created_by: str,
        commit_message: str = None,
        metadata: Dict = None
    ) -> Dict:
        """保存代码制品"""
        # 检查是否已存在该文件路径的制品
        existing_artifact = None
        for artifact in self.artifacts.values():
            if artifact.file_path == file_path:
                existing_artifact = artifact
                break
                
        if existing_artifact:
            # 创建新版本
            new_artifact = existing_artifact.create_new_version(
                content=content,
                commit_message=commit_message or f"Update by {created_by}",
                created_by=created_by,
                metadata=metadata
            )
        else:
            # 创建新制品
            new_artifact = CodeArtifact(
                file_path=file_path,
                content=content,
                language=language,
                created_by=created_by,
                commit_message=commit_message or f"Initial commit by {created_by}",
                metadata=metadata
            )
            
        self.artifacts[new_artifact.artifact_id] = new_artifact
        return new_artifact.to_dict()
        
    def get_artifact_history(self, file_path: str) -> List[Dict]:
        """获取制品的版本历史"""
        history = []
        for artifact in self.artifacts.values():
            if artifact.file_path == file_path:
                history.append(artifact.to_dict())
        return sorted(history, key=lambda x: x['created_at'])
        
    def get_artifact_version(self, file_path: str, version: str = None) -> Optional[Dict]:
        """获取制品的特定版本"""
        if version:
            for artifact in self.artifacts.values():
                if artifact.file_path == file_path and artifact.version == version:
                    return artifact.to_dict()
        else:
            # 返回最新版本
            latest_version = None
            latest_artifact = None
            for artifact in self.artifacts.values():
                if artifact.file_path == file_path:
                    if not latest_version or artifact.version > latest_version:
                        latest_version = artifact.version
                        latest_artifact = artifact
            return latest_artifact.to_dict() if latest_artifact else None
        return None
        
    def get_agent(self, agent_id: str) -> Optional[Dict]:
        """获取 Agent 信息"""
        for agent in self.agents.values():
            if agent.agent_id == agent_id:
                return agent.to_dict()
        return None
        
    def list_agents(self) -> List[Dict]:
        """获取所有 Agent 列表"""
        return [agent.to_dict() for agent in self.agents.values()]
        
    def get_agent_by_name(self, name: str) -> Optional[Dict]:
        """根据名称获取 Agent"""
        agent = self.agents.get(name)
        return agent.to_dict() if agent else None 