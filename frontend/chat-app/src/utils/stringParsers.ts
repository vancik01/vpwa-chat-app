export function stripHtml(html:string) {
    return html.replace(/<[^>]*>/g, '').trim();
  }

export function truncateMessage(message:string, wordLimit = 15) {
    const words = message.split(/\s+/); // Split the message by spaces
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return message;
}

export function isMentionedInMessage(messageContent: string, nickname: string): boolean {
  const usernameRegex = new RegExp(`@${nickname}\\b`, 'g'); // Regex to match the specific username mention
  return usernameRegex.test(messageContent);
}
