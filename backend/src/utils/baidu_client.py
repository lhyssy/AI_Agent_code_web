import requests
from typing import List, Dict
from config import Config

class BaiduClient:
    def __init__(self):
        self.api_key = Config.BAIDU_API_KEY
        self.secret_key = Config.BAIDU_SECRET_KEY
        self.model = Config.BAIDU_MODEL_NAME
        self.base_url = "https://aip.baidubce.com"
        self.access_token = None
        
    def _get_access_token(self) -> str:
        """获取百度 API 访问令牌"""
        if self.access_token:
            return self.access_token
            
        try:
            url = f"{self.base_url}/oauth/2.0/token"
            params = {
                'grant_type': 'client_credentials',
                'client_id': self.api_key,  # 直接使用完整的API Key
                'client_secret': self.secret_key
            }
            
            response = requests.post(url, params=params)
            response.raise_for_status()
            result = response.json()
            
            if 'error' in result:
                raise Exception(f"获取访问令牌失败: {result.get('error_description', '未知错误')}")
                
            self.access_token = result['access_token']
            return self.access_token
            
        except Exception as e:
            raise Exception(f"获取访问令牌时出错: {str(e)}")
        
    def _get_model_url(self) -> str:
        """获取模型 API 地址"""
        model_urls = {
            'ERNIE-Bot': "/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions",
            'ERNIE-Bot-4': "/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro",
            'ERNIE-Bot-8K': "/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie_bot_8k",
            'ERNIE-Bot-turbo': "/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant"
        }
        return f"{self.base_url}{model_urls.get(self.model, model_urls['ERNIE-Bot-4'])}"
        
    def get_completion(self, messages: List[Dict]) -> str:
        """获取百度 API 的响应"""
        try:
            if not self.access_token:
                self.access_token = self._get_access_token()
                
            url = self._get_model_url()
            
            headers = {
                'Content-Type': 'application/json'
            }
            
            params = {
                'access_token': self.access_token
            }
            
            payload = {
                'messages': messages,
                'temperature': 0.7,
                'top_p': 0.8
            }
            
            response = requests.post(url, headers=headers, params=params, json=payload)
            response.raise_for_status()
            result = response.json()
            
            if 'error_code' in result:
                raise Exception(f"API 错误: {result.get('error_msg', '未知错误')}")
                
            return result['result']
            
        except Exception as e:
            # 如果是认证错误，尝试重新获取 access_token
            if isinstance(e, requests.exceptions.HTTPError) and e.response.status_code == 401:
                self.access_token = None
                return self.get_completion(messages)
            raise Exception(f"调用百度 API 时出错: {str(e)}")
            
    def get_code_completion(self, messages: List[Dict]) -> str:
        """获取代码相关的百度 API 响应"""
        try:
            if not self.access_token:
                self.access_token = self._get_access_token()
                
            url = self._get_model_url()
            
            headers = {
                'Content-Type': 'application/json'
            }
            
            params = {
                'access_token': self.access_token
            }
            
            payload = {
                'messages': messages,
                'temperature': 0.2,  # 降低随机性
                'top_p': 0.95
            }
            
            response = requests.post(url, headers=headers, params=params, json=payload)
            response.raise_for_status()
            result = response.json()
            
            if 'error_code' in result:
                raise Exception(f"API 错误: {result.get('error_msg', '未知错误')}")
                
            return result['result']
            
        except Exception as e:
            # 如果是认证错误，尝试重新获取 access_token
            if isinstance(e, requests.exceptions.HTTPError) and e.response.status_code == 401:
                self.access_token = None
                return self.get_code_completion(messages)
            raise Exception(f"调用百度 API 时出错: {str(e)}")
            
    def get_code_review(self, code: str) -> str:
        """获取代码审查建议"""
        try:
            messages = [
                {
                    "role": "system",
                    "content": "你是一个专业的代码审查者。请对提供的代码进行审查，"
                    "指出潜在的问题、改进建议和最佳实践。"
                },
                {
                    "role": "user",
                    "content": f"请审查以下代码：\n\n{code}"
                }
            ]
            
            return self.get_completion(messages)
            
        except Exception as e:
            raise Exception(f"调用百度 API 时出错: {str(e)}")
            
    def get_code_explanation(self, code: str) -> str:
        """获取代码解释"""
        try:
            messages = [
                {
                    "role": "system",
                    "content": "你是一个专业的代码讲解者。请用清晰易懂的方式解释提供的代码，"
                    "包括其功能、实现原理和关键点。"
                },
                {
                    "role": "user",
                    "content": f"请解释以下代码：\n\n{code}"
                }
            ]
            
            return self.get_completion(messages)
            
        except Exception as e:
            raise Exception(f"调用百度 API 时出错: {str(e)}") 