import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const calculateTimeAgo = (create_at: string) => {
  const requestDate = dayjs.utc(create_at).tz('Asia/Seoul'); // KST 시간 변환
  const today = dayjs();
  const diffInDays = today.diff(requestDate, 'day');

  if (diffInDays === 0) return '오늘';
  if (diffInDays === 1) return '어제';
  return `${diffInDays}일 전`;
};
