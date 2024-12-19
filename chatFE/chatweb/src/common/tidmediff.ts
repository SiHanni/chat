export const calculateTimeAgo = (create_at: string) => {
  const requestDate = new Date(create_at);
  const today = new Date();
  const diffInTime = today.getTime() - requestDate.getTime();
  const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

  if (diffInDays === 0) return '오늘';
  if (diffInDays === 1) return '어제';
  return `${diffInDays}일 전`;
};
