from flask import Blueprint, request, jsonify
from services.agent_service import MultiAgentSystem

agent_bp = Blueprint('agent', __name__)
agent_system = MultiAgentSystem()

@agent_bp.route('/analyze', methods=['POST'])
def analyze_request():
    """分析用户请求并生成任务分配方案"""
    try:
        data = request.get_json()
        message = data.get('message')
        
        if not message:
            return jsonify({'error': '消息不能为空'}), 400
            
        result = agent_system.process_input(message)
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/tasks', methods=['POST'])
def create_task():
    """创建新任务"""
    try:
        data = request.get_json()
        required_fields = ['title', 'description', 'assigned_to']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': '缺少必要字段'}), 400
            
        task = agent_system.create_task(
            title=data['title'],
            description=data['description'],
            assigned_to=data['assigned_to'],
            priority=data.get('priority', 1),
            dependencies=data.get('dependencies')
        )
        return jsonify(task), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/tasks/<task_id>', methods=['GET'])
def get_task(task_id):
    """获取任务详情"""
    try:
        task = agent_system.get_task(task_id)
        if not task:
            return jsonify({'error': '任务不存在'}), 404
        return jsonify(task), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/tasks/<task_id>/status', methods=['PUT'])
def update_task_status(task_id):
    """更新任务状态"""
    try:
        data = request.get_json()
        status = data.get('status')
        artifacts = data.get('artifacts')
        
        if not status:
            return jsonify({'error': '状态不能为空'}), 400
            
        success = agent_system.update_task_status(
            task_id=task_id,
            status=status,
            artifacts=artifacts
        )
        
        if not success:
            return jsonify({'error': '任务不存在'}), 404
            
        return jsonify({'message': '状态已更新'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/artifacts', methods=['POST'])
def save_artifact():
    """保存代码制品"""
    try:
        data = request.get_json()
        required_fields = ['file_path', 'content', 'language', 'created_by']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': '缺少必要字段'}), 400
            
        artifact = agent_system.save_code_artifact(
            file_path=data['file_path'],
            content=data['content'],
            language=data['language'],
            created_by=data['created_by'],
            commit_message=data.get('commit_message'),
            metadata=data.get('metadata')
        )
        return jsonify(artifact), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/artifacts/<path:file_path>/history', methods=['GET'])
def get_artifact_history(file_path):
    """获取制品版本历史"""
    try:
        history = agent_system.get_artifact_history(file_path)
        return jsonify({'history': history}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/artifacts/<path:file_path>/version/<version>', methods=['GET'])
def get_artifact_version(file_path, version):
    """获取制品特定版本"""
    try:
        artifact = agent_system.get_artifact_version(file_path, version)
        if not artifact:
            return jsonify({'error': '制品版本不存在'}), 404
        return jsonify(artifact), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/artifacts/<path:file_path>/latest', methods=['GET'])
def get_latest_artifact(file_path):
    """获取制品最新版本"""
    try:
        artifact = agent_system.get_artifact_version(file_path)
        if not artifact:
            return jsonify({'error': '制品不存在'}), 404
        return jsonify(artifact), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/tasks/<task_id>/dependencies', methods=['GET'])
def get_task_dependencies(task_id):
    """获取任务的依赖任务"""
    try:
        dependencies = agent_system.get_task_dependencies(task_id)
        return jsonify({'dependencies': dependencies}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/tasks/<task_id>/dependents', methods=['GET'])
def get_dependent_tasks(task_id):
    """获取依赖该任务的其他任务"""
    try:
        dependents = agent_system.get_dependent_tasks(task_id)
        return jsonify({'dependents': dependents}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/agents', methods=['GET'])
def list_agents():
    """获取所有 Agent 列表"""
    try:
        agents = agent_system.list_agents()
        return jsonify({'agents': agents}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/agents/<agent_id>', methods=['GET'])
def get_agent(agent_id):
    """获取 Agent 信息"""
    try:
        agent = agent_system.get_agent(agent_id)
        if not agent:
            return jsonify({'error': 'Agent 不存在'}), 404
        return jsonify(agent), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/agents/name/<name>', methods=['GET'])
def get_agent_by_name(name):
    """根据名称获取 Agent"""
    try:
        agent = agent_system.get_agent_by_name(name)
        if not agent:
            return jsonify({'error': 'Agent 不存在'}), 404
        return jsonify(agent), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 