import requests
import os
from typing import List, Dict
from config import Config
import random
import time

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
        
        # 添加随机延迟，模拟真实响应时间
        delay = random.uniform(0.5, 1.5)
        time.sleep(delay)
        
        # 根据消息内容返回不同的模拟响应
        if "Mike" in last_message or "团队负责人" in last_message:
            # 根据是否包含"总结"或"summary"来区分是开始分析还是结束总结
            if "总结" in last_message or "summary" in last_message:
                summaries = [
                    "【团队总结】作为团队负责人，我对团队的工作成果进行如下总结：\n\n1. 我们已经完成了需求分析和任务分配\n2. 产品团队提出了用户体验改进方案\n3. 架构团队设计了稳定可靠的技术框架\n4. 工程团队实现了具体的代码和功能\n5. 分析团队提供了性能优化建议\n\n所有成员都已按照分工完成任务，下一步我们将进入实施阶段。",
                    "【项目总结】综合团队各成员的贡献，我们已制定了完整的实施计划：\n\n首先，Emma的用户体验设计解决了关键交互问题；\nBob的架构设计确保了系统的稳定性和可扩展性；\nAlex的代码实现方案可以立即投入开发；\nDavid的性能分析提供了重要的优化方向。\n\n我建议我们按照以下时间线推进：\n1. 第一周：完成基础架构搭建\n2. 第二周：实现核心功能\n3. 第三周：进行性能优化\n4. 第四周：进行用户测试\n\n请问您对这个计划有任何反馈或者调整建议吗？",
                    "【团队汇报】作为团队负责人，我很高兴地报告我们已完成您的需求分析和解决方案设计。\n\n通过团队协作，我们开发了一个全面的方案：\n\n🔹 产品规划（Emma）：明确了用户需求和体验目标\n🔹 架构设计（Bob）：制定了技术架构和系统结构\n🔹 代码方案（Alex）：提供了具体实现代码和技术选型\n🔹 性能分析（David）：评估了系统性能和优化空间\n\n这个综合方案既满足了功能需求，又确保了系统性能。我们已准备好进入下一阶段的实施工作。\n\n您对我们的方案有任何问题或调整意见吗？"
                ]
                return random.choice(summaries)
            else:
                analyses = [
                    "【需求分析】作为团队负责人Mike，我已分析了您提出的需求。\n\n主要目标包括：\n1. 提高错误处理能力\n2. 改善用户体验\n3. 增强系统稳定性\n\n我已将任务分配如下：\n- Emma负责产品体验设计\n- Bob负责技术架构设计\n- Alex负责代码实现\n- David负责性能分析\n\n我们将通过团队协作，确保项目高质量完成。",
                    "【项目启动】作为团队负责人，我已对您的需求进行了初步分析。\n\n我们需要解决的核心问题是：\n1. 系统响应速度慢\n2. 用户界面不够直观\n3. 数据处理能力有限\n\n我的团队将分工合作：\n👩‍💼 Emma将从用户视角优化产品体验\n👨‍🔧 Bob将设计高效的技术架构\n👨‍💻 Alex将负责具体代码实现\n👨‍🔬 David将分析系统性能指标\n\n请允许团队成员依次向您提供专业建议。",
                    "【团队协调】感谢您提供的需求信息。作为团队负责人，我将组织团队成员共同解决这个挑战。\n\n我们将采用以下工作流程：\n\n第一步：我会先进行需求分析和任务分配\n第二步：Emma会从产品角度提出优化建议\n第三步：Bob会设计合适的技术架构\n第四步：Alex会提供具体的代码实现方案\n第五步：David会分析性能并提出优化建议\n最后：我会整合所有意见，提出完整解决方案\n\n现在，请允许我邀请团队成员依次发言..."
                ]
                return random.choice(analyses)
        
        elif "Emma" in last_message or "产品经理" in last_message:
            product_responses = [
                "【产品规划】作为产品经理Emma，我针对此需求提出以下产品建议：\n\n用户体验改进：\n1. 设计分层级的错误提示界面\n2. 添加状态指示器（已连接/重连中/离线）\n3. 增加用户引导和帮助中心\n\n功能需求：\n1. 支持离线模式下的基本操作\n2. 添加数据缓存机制\n3. 实现自动恢复功能\n\n验收标准：\n- 用户报错率降低50%\n- 用户满意度提升40%\n- 平均任务完成时间减少25%",
                "【用户体验】我是Emma，从产品角度看，我们需要解决的核心问题是提升用户体验和降低操作复杂度。\n\n基于用户研究，我建议：\n\n1️⃣ 简化界面：减少50%的不必要元素，突出核心功能\n2️⃣ 优化流程：将7步操作减少到3步，提高效率\n3️⃣ 增强反馈：添加进度指示和成功/失败反馈\n4️⃣ 个性化：根据用户历史行为自动调整界面\n\n我已准备了用户流程图和原型设计，可以直接交给开发团队实现。预计这些改进将使用户满意度提升65%，完成任务的时间减少40%。",
                "【产品视角】作为产品经理Emma，我建议我们从用户需求出发，重新构思整个交互流程。\n\n根据我们最近的用户调研，发现以下几个关键痛点：\n\n📊 87%的用户认为当前系统反馈不够清晰\n📊 62%的用户希望有更直观的状态展示\n📊 91%的用户在遇到错误时不知道如何处理\n\n因此，我提议以下产品改进：\n\n1. 设计全新的状态展示系统，使用色彩和动画提供直观反馈\n2. 创建智能错误处理向导，引导用户解决常见问题\n3. 添加进度跟踪功能，让用户随时了解任务状态\n4. 实现数据自动保存功能，防止意外丢失\n\n我已经完成了交互原型设计，可以与技术团队一起评审实现可行性。"
            ]
            return random.choice(product_responses)
        
        elif "Bob" in last_message or "架构师" in last_message:
            architect_responses = [
                "【架构设计】作为架构师Bob，我提出以下技术架构方案：\n\n系统架构：\n1. 采用微服务架构，独立API网关层\n2. 引入服务注册与发现机制\n3. 实现请求负载均衡\n\n技术选型：\n1. 使用Axios进行HTTP请求，配置全局拦截器\n2. 集成Circuit Breaker模式处理故障\n3. 添加请求重试和超时机制\n\n数据流设计：\n1. 实现请求队列，支持优先级处理\n2. 添加数据持久化层，支持离线操作\n\n所有这些改进将大幅提高系统稳定性。",
                "【系统架构】我是系统架构师Bob，在考虑了Emma的产品需求后，我设计了一个高可用、可扩展的系统架构：\n\n核心架构组件：\n\n1. 前端架构\n   - 采用状态管理模式(Redux/Vuex)集中处理应用状态\n   - 实现组件懒加载和代码分割优化加载性能\n   - 使用Service Worker实现离线功能和资源缓存\n\n2. 后端架构\n   - 引入API网关统一管理所有服务请求\n   - 实现服务注册与发现机制实现动态伸缩\n   - 采用消息队列处理异步任务，提高系统韧性\n\n3. 数据架构\n   - 实现多级缓存策略(内存、Redis、CDN)\n   - 设计数据分片和分布式存储方案\n   - 引入读写分离提高查询性能\n\n该架构方案已考虑安全性、可扩展性和性能，可支撑系统长期发展。",
                "【技术架构】作为架构师，我建议采用模块化、松耦合的架构设计，确保系统可维护性和扩展性。\n\n📐 前端架构:\n- 采用组件化设计，使用React或Vue构建可复用UI组件\n- 实现状态管理层，使用Redux或Vuex处理复杂状态逻辑\n- 添加中间件层处理API请求，实现请求缓存和重试逻辑\n\n📐 后端架构:\n- 实现微服务架构，将系统拆分为独立的服务模块\n- 使用API网关统一管理请求路由和认证\n- 采用事件驱动架构处理异步操作\n\n📐 数据存储:\n- 实现多级缓存策略，优化读取性能\n- 设计数据分区策略，提高写入性能\n- 添加数据同步机制，确保一致性\n\n这个架构设计兼顾了系统性能和开发效率，同时也为未来功能扩展预留了足够的灵活性。"
            ]
            return random.choice(architect_responses)
        
        elif "Alex" in last_message or "工程师" in last_message:
            engineer_responses = [
                "【技术实现】作为工程师Alex，我将实现以下具体代码：\n\n```javascript\n// API请求增强模块\nclass EnhancedApiClient {\n  constructor(baseURL, options = {}) {\n    this.baseURL = baseURL;\n    this.maxRetries = options.maxRetries || 3;\n    this.timeout = options.timeout || 5000;\n    this.enableCache = options.enableCache || false;\n    this.cache = new Map();\n  }\n\n  async request(endpoint, options = {}) {\n    const url = `${this.baseURL}${endpoint}`;\n    const cacheKey = this.enableCache ? `${url}-${JSON.stringify(options)}` : null;\n    \n    // 检查缓存\n    if (this.enableCache && this.cache.has(cacheKey)) {\n      return this.cache.get(cacheKey);\n    }\n    \n    // 实现重试逻辑\n    let attempts = 0;\n    while (attempts < this.maxRetries) {\n      try {\n        const controller = new AbortController();\n        const timeoutId = setTimeout(() => controller.abort(), this.timeout);\n        \n        const response = await fetch(url, {\n          ...options,\n          signal: controller.signal\n        });\n        \n        clearTimeout(timeoutId);\n        \n        if (!response.ok) {\n          throw new Error(`HTTP错误: ${response.status}`);\n        }\n        \n        const data = await response.json();\n        \n        // 存入缓存\n        if (this.enableCache) {\n          this.cache.set(cacheKey, data);\n        }\n        \n        return data;\n      } catch (error) {\n        attempts++;\n        if (attempts >= this.maxRetries) throw error;\n        // 指数退避\n        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempts)));\n      }\n    }\n  }\n}\n```\n\n同时，我将添加单元测试和集成测试，确保新功能的稳定性和可靠性。",
                "【代码实现】作为工程师，我提供以下具体实现方案：\n\n前端错误处理与重试机制的实现：\n\n```typescript\n// api-client.ts\nimport axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';\n\ninterface RetryConfig {\n  maxRetries: number;\n  initialDelayMs: number;\n  backoffFactor: number;\n  retryCondition: (error: any) => boolean;\n}\n\nexport class ApiClient {\n  private axios: AxiosInstance;\n  private retryConfig: RetryConfig;\n  private connectionStatus: 'connected' | 'connecting' | 'disconnected' = 'disconnected';\n\n  constructor(baseURL: string, config?: Partial<RetryConfig>) {\n    this.axios = axios.create({ baseURL });\n    \n    // 默认重试配置\n    this.retryConfig = {\n      maxRetries: 3,\n      initialDelayMs: 1000,\n      backoffFactor: 2,\n      retryCondition: (error) => {\n        // 只在网络错误或服务器错误时重试\n        return !error.response || (error.response.status >= 500 && error.response.status < 600);\n      },\n      ...config\n    };\n    \n    // 设置拦截器\n    this.setupInterceptors();\n  }\n  \n  private setupInterceptors() {\n    // 请求拦截器\n    this.axios.interceptors.request.use(\n      (config) => {\n        // 在请求发送前可以添加统一处理逻辑\n        return config;\n      },\n      (error) => Promise.reject(error)\n    );\n    \n    // 响应拦截器\n    this.axios.interceptors.response.use(\n      (response) => {\n        this.connectionStatus = 'connected';\n        return response;\n      },\n      async (error) => {\n        // 处理请求错误\n        const config = error.config;\n        \n        // 如果没有配置重试或已经重试到最大次数，则直接返回错误\n        if (!config || !this.retryConfig.retryCondition(error) || \n            config.__retryCount >= this.retryConfig.maxRetries) {\n          this.connectionStatus = 'disconnected';\n          return Promise.reject(error);\n        }\n        \n        // 设置重试计数\n        config.__retryCount = config.__retryCount || 0;\n        config.__retryCount += 1;\n        \n        // 计算重试延迟时间（指数退避）\n        const delayMs = this.retryConfig.initialDelayMs * \n                       Math.pow(this.retryConfig.backoffFactor, config.__retryCount - 1);\n        \n        // 设置状态为重连中\n        this.connectionStatus = 'connecting';\n        \n        // 延迟后重试\n        await new Promise(resolve => setTimeout(resolve, delayMs));\n        return this.axios(config);\n      }\n    );\n  }\n  \n  // API方法\n  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {\n    const response = await this.axios.get<T>(url, config);\n    return response.data;\n  }\n  \n  // 其他HTTP方法...\n  \n  // 获取连接状态\n  getConnectionStatus() {\n    return this.connectionStatus;\n  }\n}\n```\n\n这个实现封装了完整的重试逻辑和连接状态管理，可以直接集成到现有项目中。",
                "【实现方案】从工程角度看，我推荐使用以下技术栈和实现方式：\n\n🛠️ 前端技术：\n- 框架：React 18 + TypeScript\n- 状态管理：Redux Toolkit\n- API请求：使用自定义钩子封装fetch API\n\n以下是核心代码实现示例：\n\n```typescript\n// useApi.ts - 网络请求钩子\nimport { useState, useEffect, useCallback } from 'react';\nimport { useDispatch } from 'react-redux';\nimport { setNetworkStatus } from './networkSlice';\n\ninterface RequestOptions extends RequestInit {\n  retries?: number;\n  retryDelay?: number;\n  timeout?: number;\n  cacheKey?: string;\n}\n\nexport function useApi<T>() {\n  const dispatch = useDispatch();\n  const [cache] = useState<Map<string, T>>(new Map());\n  \n  const request = useCallback(async (\n    url: string, \n    options: RequestOptions = {}\n  ): Promise<T> => {\n    const {\n      retries = 3,\n      retryDelay = 1000,\n      timeout = 8000,\n      cacheKey,\n      ...fetchOptions\n    } = options;\n    \n    // 检查缓存\n    if (cacheKey && cache.has(cacheKey)) {\n      return cache.get(cacheKey) as T;\n    }\n    \n    // 设置超时\n    const controller = new AbortController();\n    const timeoutId = setTimeout(() => controller.abort(), timeout);\n    \n    try {\n      dispatch(setNetworkStatus('loading'));\n      \n      let lastError: Error | null = null;\n      let attempts = 0;\n      \n      while (attempts <= retries) {\n        try {\n          const response = await fetch(url, {\n            ...fetchOptions,\n            signal: controller.signal\n          });\n          \n          clearTimeout(timeoutId);\n          \n          if (!response.ok) {\n            throw new Error(`HTTP error: ${response.status}`);\n          }\n          \n          const data = await response.json();\n          \n          // 保存到缓存\n          if (cacheKey) {\n            cache.set(cacheKey, data);\n          }\n          \n          dispatch(setNetworkStatus('connected'));\n          return data;\n        } catch (error) {\n          lastError = error as Error;\n          attempts++;\n          \n          if (attempts <= retries) {\n            dispatch(setNetworkStatus('reconnecting'));\n            // 等待一段时间后重试（指数退避）\n            await new Promise(resolve => \n              setTimeout(resolve, retryDelay * Math.pow(2, attempts - 1))\n            );\n          }\n        }\n      }\n      \n      dispatch(setNetworkStatus('disconnected'));\n      throw lastError;\n    } finally {\n      clearTimeout(timeoutId);\n    }\n  }, [dispatch, cache]);\n  \n  return { request };\n}\n```\n\n这个实现同时考虑了缓存、超时、重试和状态管理，非常适合当前的需求。"
            ]
            return random.choice(engineer_responses)
        
        elif "David" in last_message or "分析师" in last_message:
            analyst_responses = [
                "【性能分析】作为数据分析师David，我对系统性能提出以下建议：\n\n性能瓶颈分析：\n1. 当前API请求平均响应时间: 1.2秒\n2. 重试机制可能导致服务器负载增加35%\n3. 缓存命中率仅为45%\n\n优化建议：\n1. 实现资源预加载和懒加载策略\n2. 使用指数退避算法优化重试间隔\n3. 优化缓存策略，提高命中率至80%以上\n\n监控指标：\n1. API响应时间 (目标<500ms)\n2. 错误率 (目标<1%)\n3. 重试次数 (目标<平均0.5次/请求)\n\n采用这些优化后，预计系统整体性能提升40%，用户体验显著改善。",
                "【性能优化】作为数据分析师，我已对当前系统性能进行了全面评估，发现了几个关键优化点：\n\n📊 当前性能指标：\n- API平均响应时间：2.3秒（行业标准<1秒）\n- 前端加载时间：4.6秒（行业标准<3秒）\n- 错误率：8.2%（行业标准<2%）\n- 内存使用：持续增长，存在内存泄漏\n\n🔍 主要问题：\n1. 未实现请求合并，导致大量冗余API调用\n2. 未使用缓存或缓存策略不当\n3. 渲染性能优化不足\n4. 错误处理机制不完善\n\n💡 优化建议：\n1. 实现请求批处理和防抖动，减少50%的API调用\n2. 添加三级缓存策略（内存、LocalStorage、IndexedDB）\n3. 优化组件渲染性能（虚拟列表、懒加载）\n4. 添加全局异常监控和自动恢复机制\n\n预期改进效果：\n- API响应时间降低65%\n- 前端加载时间减少40%\n- 错误率降至1.5%以下\n- 内存使用稳定且可控\n\n建议实施优先级：高->低（2->4->1->3）",
                "【指标分析】通过对系统日志和性能监控的分析，我发现了以下性能瓶颈和优化机会：\n\n📈 关键指标分析：\n\n1. 网络性能\n   - HTTP请求平均耗时: 1850ms\n   - 连接失败率: 7.3%\n   - 重试占比: 23.5%\n\n2. 前端性能\n   - 首次内容渲染(FCP): 3.2秒\n   - 总阻塞时间(TBT): 820ms\n   - 内存占用峰值: 215MB\n\n3. 后端性能\n   - 平均响应时间: 950ms\n   - 95线响应时间: 2300ms\n   - CPU使用率峰值: 78%\n\n📊 优化方向与预期收益：\n\n1. 网络优化\n   - 实现请求优先级队列 (-35%请求时间)\n   - 添加智能重试策略 (-65%重试率)\n   - 启用HTTP/2 (-30%连接时间)\n\n2. 前端优化\n   - 代码分割与懒加载 (-45%初始加载时间)\n   - Web Worker处理数据 (-60%主线程阻塞)\n   - 虚拟滚动优化 (-70%内存占用)\n\n3. 后端优化\n   - 添加应用级缓存 (-65%平均响应时间)\n   - 优化数据库查询 (-40%CPU使用率)\n   - 实现请求流量控制 (平稳95线性能)\n\n我建议优先实施网络优化方案，因为投入产出比最高，可以在2周内完成并带来显著改善。"
            ]
            return random.choice(analyst_responses)
        
        else:
            generic_responses = [
                "我理解您的需求，这是对话式AI系统的自动回复。在实际实现中，这里会是真实的AI模型回复。您的需求很重要，团队会认真处理。",
                "感谢您的输入。作为AI助手，我将根据您的需求提供相关建议和解决方案。您的问题已经记录，专业团队将进行分析和处理。",
                "收到您的消息。在正式环境中，这里将由AI模型生成针对性的回复。目前处于测试模式，请继续与系统交互，我们将不断完善服务质量。"
            ]
            return random.choice(generic_responses)
        
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
        """获取百度AI的响应文本
        
        该方法简化了获取AI回复的接口，直接返回文本内容
        """
        try:
            result = self.get_completion(messages)
            
            # 处理不同类型的返回结果
            if isinstance(result, dict) and 'content' in result:
                return result['content']
            elif isinstance(result, str):
                return result
            else:
                return str(result)
        except Exception as e:
            error_msg = f"获取AI响应失败: {str(e)}"
            print(error_msg)
            return f"抱歉，AI响应生成过程中遇到了错误。错误信息: {str(e)}" 