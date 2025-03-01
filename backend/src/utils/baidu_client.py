import requests
import os
from typing import List, Dict
from config import Config

class BaiduClient:
    def __init__(self):
        self.api_key = Config.BAIDU_API_KEY
        self.secret_key = Config.BAIDU_SECRET_KEY
        self.model = Config.BAIDU_MODEL_NAME
        self.base_url = "https://aip.baidubce.com"
        self.access_token = None
        self.test_mode = not (self.api_key and self.secret_key) or os.getenv('TEST_MODE', 'false').lower() == 'true'
        
        if self.test_mode:
            print("警告: BaiduClient运行在测试模式下，将返回模拟数据。")
        
    def _get_access_token(self) -> str:
        """获取百度 API 访问令牌"""
        if self.test_mode:
            return "test_token"
            
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
    
    def _get_test_response(self, messages: List[Dict]) -> str:
        """在测试模式下返回模拟数据"""
        # 分析最后一条消息
        last_message = messages[-1]['content'] if messages else ""
        
        # 根据消息内容返回不同的模拟响应
        if "Mike" in last_message or "团队负责人" in last_message:
            # 根据是否包含"总结"或"summary"来区分是开始分析还是结束总结
            if "总结" in last_message or "summary" in last_message:
                return "【团队总结】作为团队负责人，我对团队的工作成果进行如下总结：\n\n1. 我们已经完成了需求分析和任务分配\n2. 产品团队提出了用户体验改进方案\n3. 架构团队设计了稳定可靠的技术框架\n4. 工程团队实现了具体的代码和功能\n5. 分析团队提供了性能优化建议\n\n所有成员都已按照分工完成任务，下一步我们将进入实施阶段。"
            else:
                return "【需求分析】作为团队负责人Mike，我已分析了您提出的API连接优化需求。\n\n主要目标包括：\n1. 提高错误处理能力\n2. 改善用户体验\n3. 增强API连接稳定性\n\n我已将任务分配如下：\n- Emma负责产品体验设计\n- Bob负责技术架构设计\n- Alex负责代码实现\n- David负责性能分析\n\n我们将通过团队协作，确保项目高质量完成。"
        
        elif "Emma" in last_message or "产品经理" in last_message:
            return "【产品规划】作为产品经理Emma，我针对API连接优化提出以下产品建议：\n\n用户体验改进：\n1. 设计分层级的错误提示界面\n2. 添加连接状态指示器（已连接/重连中/离线）\n3. 增加网络诊断工具\n\n功能需求：\n1. 支持离线模式下的基本操作\n2. 添加数据缓存机制\n3. 实现断线自动重连\n\n验收标准：\n- 用户报错率降低50%\n- API连接成功率提升至99.5%"
        
        elif "Bob" in last_message or "架构师" in last_message:
            return "【架构设计】作为架构师Bob，我提出以下技术架构方案：\n\n系统架构：\n1. 采用微服务架构，独立API网关层\n2. 引入服务注册与发现机制\n3. 实现请求负载均衡\n\n技术选型：\n1. 使用Axios进行HTTP请求，配置全局拦截器\n2. 集成Circuit Breaker模式处理故障\n3. 添加请求重试和超时机制\n\n数据流设计：\n1. 实现请求队列，支持优先级处理\n2. 添加数据持久化层，支持离线操作\n\n所有这些改进将大幅提高系统稳定性。"
        
        elif "Alex" in last_message or "工程师" in last_message:
            return "【技术实现】作为工程师Alex，我将实现以下具体代码：\n\n```javascript\n// API请求增强模块\nclass EnhancedApiClient {\n  constructor(baseURL, options = {}) {\n    this.baseURL = baseURL;\n    this.maxRetries = options.maxRetries || 3;\n    this.timeout = options.timeout || 5000;\n    this.enableCache = options.enableCache || false;\n    this.cache = new Map();\n  }\n\n  async request(endpoint, options = {}) {\n    const url = `${this.baseURL}${endpoint}`;\n    const cacheKey = this.enableCache ? `${url}-${JSON.stringify(options)}` : null;\n    \n    // 检查缓存\n    if (this.enableCache && this.cache.has(cacheKey)) {\n      return this.cache.get(cacheKey);\n    }\n    \n    // 实现重试逻辑\n    let attempts = 0;\n    while (attempts < this.maxRetries) {\n      try {\n        const controller = new AbortController();\n        const timeoutId = setTimeout(() => controller.abort(), this.timeout);\n        \n        const response = await fetch(url, {\n          ...options,\n          signal: controller.signal\n        });\n        \n        clearTimeout(timeoutId);\n        \n        if (!response.ok) {\n          throw new Error(`HTTP错误: ${response.status}`);\n        }\n        \n        const data = await response.json();\n        \n        // 存入缓存\n        if (this.enableCache) {\n          this.cache.set(cacheKey, data);\n        }\n        \n        return data;\n      } catch (error) {\n        attempts++;\n        if (attempts >= this.maxRetries) throw error;\n        // 指数退避\n        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempts)));\n      }\n    }\n  }\n}\n```\n\n同时，我将添加单元测试和集成测试，确保新功能的稳定性和可靠性。"
        
        elif "David" in last_message or "分析师" in last_message:
            return "【性能分析】作为数据分析师David，我对系统性能提出以下建议：\n\n性能瓶颈分析：\n1. 当前API请求平均响应时间: 1.2秒\n2. 重试机制可能导致服务器负载增加35%\n3. 缓存命中率仅为45%\n\n优化建议：\n1. 实现资源预加载和懒加载策略\n2. 使用指数退避算法优化重试间隔\n3. 优化缓存策略，提高命中率至80%以上\n\n监控指标：\n1. API响应时间 (目标<500ms)\n2. 错误率 (目标<1%)\n3. 重试次数 (目标<平均0.5次/请求)\n\n采用这些优化后，预计系统整体性能提升40%，用户体验显著改善。"
        
        else:
            return "我理解您的需求，这是对话式AI系统的自动回复。在实际实现中，这里会是真实的AI模型回复。您的需求很重要，团队会认真处理。"
        
    def get_completion(self, messages: List[Dict]) -> str:
        """获取百度 API 的响应"""
        if self.test_mode:
            return self._get_test_response(messages)
            
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
                
            # 如果在非测试模式下发生错误，切换到测试模式
            if not self.test_mode:
                print(f"警告: 调用百度 API 出错: {str(e)}，切换到测试模式")
                self.test_mode = True
                return self._get_test_response(messages)
                
            raise Exception(f"调用百度 API 时出错: {str(e)}")
            
    def get_code_completion(self, messages: List[Dict]) -> str:
        """获取代码相关的百度 API 响应"""
        if self.test_mode:
            return self._get_test_response(messages)
            
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
                
            # 如果在非测试模式下发生错误，切换到测试模式
            if not self.test_mode:
                print(f"警告: 调用百度 API 出错: {str(e)}，切换到测试模式")
                self.test_mode = True
                return self._get_test_response(messages)
                
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
            # 如果在非测试模式下发生错误，切换到测试模式
            if not self.test_mode:
                print(f"警告: 调用百度 API 出错: {str(e)}，切换到测试模式")
                self.test_mode = True
                return self._get_test_response(messages)
                
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
            # 如果在非测试模式下发生错误，切换到测试模式
            if not self.test_mode:
                print(f"警告: 调用百度 API 出错: {str(e)}，切换到测试模式")
                self.test_mode = True
                return self._get_test_response(messages)
                
            raise Exception(f"调用百度 API 时出错: {str(e)}")
            
    def get_response(self, messages: List[Dict]) -> str:
        """获取AI响应文本（简化调用接口）
        
        Args:
            messages: 消息列表
            
        Returns:
            str: AI回复的文本内容
        """
        try:
            result = self.get_completion(messages)
            # 如果result是字典且包含content字段，返回content
            if isinstance(result, dict) and 'content' in result:
                return result['content']
            # 如果result是字符串，直接返回
            elif isinstance(result, str):
                return result
            # 其他情况
            return str(result)
        except Exception as e:
            print(f"获取AI回复失败: {str(e)}")
            return f"抱歉，AI响应出现错误: {str(e)}" 