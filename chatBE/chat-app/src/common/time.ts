// 깨알 상식: Unix는 1969년 AT&T 벨 연구소에서 개발된 운영체제
// 간단하면서도 강력한 설계를 가진 운영체제로, 이후 현대의 다양한 운영체제(리눅스, macOS)에 큰 영향을 끼쳤다.
// Unix는 1970년 1월 1일 00:00:00 UTC를 기준으로, 이를 EPOCH TIME이라고 정의했다.
// 이후 Unix 시스템에서 모든 시간이 이 기준부터 경과된 초 단위의 숫자로 표현되게 된 것이다.
// 유닉스타임은 이 전통에서 비롯되어진 이름이다.

export const checkTimeDiff = (reqUnixTime: number) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const timediff = reqUnixTime - currentTime;

  return timediff;
};

export const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 해줍니다.
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};

export const getKSTUnixTimestampMs = () => {
  const currentUtc = new Date();
  const utcOffsetInMs = 9 * 60 * 60 * 1000; // 한국 시간은 UTC+9이므로 9시간을 밀리초로 계산
  const currentKst = currentUtc.getTime() + utcOffsetInMs;
  return currentKst;
};

export const getKST = () => {
  const currentUtc = new Date();
  const utcOffsetInMs = 9 * 60 * 60 * 1000; // 한국 시간은 UTC+9이므로 9시간을 밀리초로 계산
  const currentKst = new Date(currentUtc.getTime() + utcOffsetInMs);
  return currentKst.toISOString();
};
