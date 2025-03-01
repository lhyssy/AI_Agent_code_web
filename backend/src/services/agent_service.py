from typing import Dict, List, Optional
from datetime import datetime
from models.agent import (
    TeamLeader, ProductManager, Architect, Engineer, DataAnalyst,
    Task, CodeArtifact
)
from utils.baidu_client import BaiduClient
import time
import logging

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
        
    def process_input(self, input_content: str) -> Dict:
        """处理用户输入，获取AI回复
        
        Args:
            input_content: 用户输入内容
            
        Returns:
            Dict: 包含成功状态和对话内容的字典
        """
        try:
            # 创建用户消息
            user_message = {
                "role": "user",
                "content": input_content,
                "timestamp": int(time.time() * 1000)
            }
            
            # 将用户消息添加到对话历史
            self.conversation_history.append(user_message)
            
            # 通过WebSocket发送用户消息
            self.ws_handler.send_message({
                "type": "user_message",
                "message": user_message
            })
            
            # 依次获取各个Agent的回复
            try:
                # 团队负责人Mike分析需求
                mike_prompt = f"你是团队负责人Mike，请分析用户的需求并分配任务给团队成员。用户输入: {input_content}"
                mike_response = self.baidu_client.get_response([
                    {"role": "user", "content": mike_prompt}
                ])
                # 使用单独的消息添加到对话历史
                self._update_conversation("Mike", mike_response)
                
                # 产品经理Emma负责产品需求
                emma_prompt = f"你是产品经理Emma，根据用户的需求: '{input_content}'，以及团队负责人Mike的分析: '{mike_response}'，提出产品角度的建议和计划。"
                emma_response = self.baidu_client.get_response([
                    {"role": "user", "content": emma_prompt}
                ])
                # 使用单独的消息添加到对话历史
                self._update_conversation("Emma", emma_response)
                
                # 架构师Bob负责技术架构
                bob_prompt = f"你是架构师Bob，根据用户的需求: '{input_content}'，团队负责人Mike的分析: '{mike_response}'，以及产品经理Emma的规划: '{emma_response}'，提出技术架构方案。"
                bob_response = self.baidu_client.get_response([
                    {"role": "user", "content": bob_prompt}
                ])
                # 使用单独的消息添加到对话历史
                self._update_conversation("Bob", bob_response)
                
                # 工程师Alex负责代码实现
                alex_prompt = f"你是工程师Alex，根据用户的需求: '{input_content}'，团队负责人Mike的分析: '{mike_response}'，产品经理Emma的规划: '{emma_response}'，以及架构师Bob的方案: '{bob_response}'，提出具体的代码实现方案。"
                alex_response = self.baidu_client.get_response([
                    {"role": "user", "content": alex_prompt}
                ])
                # 使用单独的消息添加到对话历史
                self._update_conversation("Alex", alex_response)
                
                # 数据分析师David负责性能分析
                david_prompt = f"你是数据分析师David，根据用户的需求: '{input_content}'，团队负责人Mike的分析: '{mike_response}'，产品经理Emma的规划: '{emma_response}'，架构师Bob的方案: '{bob_response}'，以及工程师Alex的实现: '{alex_response}'，提出性能优化和指标监控建议。"
                david_response = self.baidu_client.get_response([
                    {"role": "user", "content": david_prompt}
                ])
                # 使用单独的消息添加到对话历史
                self._update_conversation("David", david_response)
                
                # 最后由Mike做总结
                summary_prompt = f"你是团队负责人Mike，请总结团队各成员（Emma, Bob, Alex, David）对用户需求的处理结果。用户需求: '{input_content}'，Emma的产品规划: '{emma_response}'，Bob的架构方案: '{bob_response}'，Alex的代码实现: '{alex_response}'，David的性能分析: '{david_response}'。"
                summary_response = self.baidu_client.get_response([
                    {"role": "user", "content": summary_prompt}
                ])
                # 使用单独的消息添加到对话历史
                self._update_conversation("Mike总结", summary_response)
                
            except Exception as e:
                # 如果AI回复失败，记录错误并使用默认回复
                logging.error(f"获取AI回复失败: {str(e)}")
                default_response = "抱歉，AI处理请求时出现错误，请稍后重试。错误详情: " + str(e)
                self._update_conversation("系统", default_response)
            
            # 返回成功状态和对话历史
            return {"success": True, "conversation": self.conversation_history}
        
        except Exception as e:
            # 记录并返回错误
            logging.error(f"处理输入时出错: {str(e)}")
            error_response = {
                "success": False,
                "error": f"处理输入时出错: {str(e)}",
                "conversation": self.conversation_history
            }
            return error_response
        
    def _update_conversation(self, agent_name: str, response: str):
        """更新对话历史并通过WebSocket发送消息
        
        Args:
            agent_name: 代理名称
            response: AI响应内容
        """
        try:
            # 创建AI消息对象
            ai_message = {
                "role": "assistant",
                "agent": agent_name,
                "content": response,
                "timestamp": int(time.time() * 1000)
            }
            
            # 添加到对话历史
            self.conversation_history.append(ai_message)
            
            # 通过WebSocket发送AI消息
            self.ws_handler.send_message({
                "type": "ai_message",
                "message": ai_message
            })
            
            logging.info(f"发送{agent_name}的消息成功")
            
        except Exception as e:
            # 记录错误
            logging.error(f"更新对话时出错: {str(e)}")
            
            # 尝试发送错误消息
            try:
                error_message = {
                    "role": "system",
                    "content": f"发送{agent_name}消息时出错: {str(e)}",
                    "timestamp": int(time.time() * 1000)
                }
                self.conversation_history.append(error_message)
                self.ws_handler.send_message({
                    "type": "error",
                    "message": error_message
                })
            except Exception as send_error:
                logging.error(f"发送错误消息时出错: {str(send_error)}")
                # 此处不再递归调用，避免潜在的无限递归
        
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