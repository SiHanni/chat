const server_host =
  process.env.REACT_APP_SERVER_HOST || 'https://www.marutalk.com';
const server_port = process.env.REACT_APP_SERVER_PORT || '3000';
export const server_url = `${server_host}:${server_port}`;
