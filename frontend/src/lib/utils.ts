/**
 * 格式化代码，根据语言添加语法高亮
 */
export function formatCode(code: string, language: string = 'text'): string {
  // 简单的代码格式化，实际项目中可以使用highlight.js或prism.js等库
  if (!code) return '';
  
  // 转义HTML特殊字符
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // 根据语言添加简单的语法高亮
  // 这里只是一个简单的实现，实际项目中应该使用专业的语法高亮库
  let formatted = escaped;
  
  // 为关键字添加颜色
  if (['javascript', 'typescript', 'js', 'ts'].includes(language.toLowerCase())) {
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await'];
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      formatted = formatted.replace(regex, `<span style="color: #c678dd;">${keyword}</span>`);
    });
    
    // 字符串
    formatted = formatted.replace(/(["'])(.*?)\1/g, '<span style="color: #98c379;">$&</span>');
    
    // 注释
    formatted = formatted.replace(/(\/\/.*)/g, '<span style="color: #7f848e;">$1</span>');
  } else if (['python', 'py'].includes(language.toLowerCase())) {
    const keywords = ['def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'lambda'];
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      formatted = formatted.replace(regex, `<span style="color: #c678dd;">${keyword}</span>`);
    });
    
    // 字符串
    formatted = formatted.replace(/(["'])(.*?)\1/g, '<span style="color: #98c379;">$&</span>');
    
    // 注释
    formatted = formatted.replace(/(#.*)/g, '<span style="color: #7f848e;">$1</span>');
  }
  
  return formatted;
}

/**
 * 格式化消息日期，返回友好的日期显示
 */
export function formatMessage(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (messageDate.getTime() === today.getTime()) {
    return '今天';
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return '昨天';
  } else {
    // 一周内显示星期几
    const daysDiff = Math.floor((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      return weekdays[messageDate.getDay()];
    } else {
      // 超过一周显示完整日期
      return `${messageDate.getFullYear()}年${messageDate.getMonth() + 1}月${messageDate.getDate()}日`;
    }
  }
} 