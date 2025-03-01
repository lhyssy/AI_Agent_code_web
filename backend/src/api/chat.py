from flask import Blueprint, request, jsonify
from services.chat_service import ChatService

chat_bp = Blueprint('chat', __name__)
chat_service = ChatService()

@chat_bp.route('/sessions', methods=['POST'])
def create_session():
    """创建新的聊天会话"""
    try:
        data = request.get_json()
        title = data.get('title') if data else None
        session = chat_service.create_session(title)
        return jsonify(session), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/sessions', methods=['GET'])
def list_sessions():
    """获取所有会话列表"""
    try:
        sessions = chat_service.list_sessions()
        return jsonify({'sessions': sessions}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    """获取指定会话详情"""
    try:
        session = chat_service.get_session(session_id)
        if not session:
            return jsonify({'error': '会话不存在'}), 404
        return jsonify(session), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/sessions/<session_id>/messages', methods=['POST'])
def send_message(session_id):
    """发送消息到指定会话"""
    try:
        data = request.get_json()
        message = data.get('message')
        context = data.get('context')
        
        if not message:
            return jsonify({'error': '消息不能为空'}), 400
            
        response = chat_service.process_message(
            session_id=session_id,
            message=message,
            context=context
        )
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/sessions/<session_id>/messages', methods=['GET'])
def get_session_history(session_id):
    """获取指定会话的历史记录"""
    try:
        history = chat_service.get_session_history(session_id)
        return jsonify({'history': history}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/sessions/<session_id>/clear', methods=['POST'])
def clear_session_history(session_id):
    """清空指定会话的历史记录"""
    try:
        success = chat_service.clear_session_history(session_id)
        if not success:
            return jsonify({'error': '会话不存在'}), 404
        return jsonify({'message': '历史记录已清空'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/sessions/<session_id>/title', methods=['PUT'])
def update_session_title(session_id):
    """更新会话标题"""
    try:
        data = request.get_json()
        title = data.get('title')
        
        if not title:
            return jsonify({'error': '标题不能为空'}), 400
            
        success = chat_service.update_session_title(session_id, title)
        if not success:
            return jsonify({'error': '会话不存在'}), 404
        return jsonify({'message': '标题已更新'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/sessions/<session_id>/archive', methods=['POST'])
def archive_session(session_id):
    """归档会话"""
    try:
        success = chat_service.archive_session(session_id)
        if not success:
            return jsonify({'error': '会话不存在'}), 404
        return jsonify({'message': '会话已归档'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    """删除会话"""
    try:
        success = chat_service.delete_session(session_id)
        if not success:
            return jsonify({'error': '会话不存在'}), 404
        return jsonify({'message': '会话已删除'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 