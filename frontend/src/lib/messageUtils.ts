import { isSameDay } from 'date-fns';
import { Message } from '@/types/chat';

interface MessageGroup {
  date: Date;
  messages: Message[];
}

/**
 * 按日期对消息进行分组
 * @param messages 消息数组
 * @returns 按日期分组后的消息数组
 */
export const groupMessagesByDate = (messages: Message[] = []): MessageGroup[] => {
  if (!messages.length) return [];
  
  const timeGroupedMessages: MessageGroup[] = [];
  
  messages.forEach((message) => {
    const messageDate = new Date(message.timestamp);
    const lastGroup = timeGroupedMessages[timeGroupedMessages.length - 1];

    if (lastGroup && isSameDay(lastGroup.date, messageDate)) {
      lastGroup.messages.push(message);
    } else {
      timeGroupedMessages.push({
        date: messageDate,
        messages: [message],
      });
    }
  });
  
  return timeGroupedMessages;
}; 