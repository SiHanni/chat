import { server_url } from './serverConfig';

class TokenManager {
  private updateAuthTokenInterval: any;

  // 인스턴스를 생성할 때마다 새롭게 토큰을 관리
  constructor(private accessToken: string) {}

  async updateToken() {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const response = await fetch(`${server_url}/auth/updatetoken`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include', // HttpOnly 쿠키 포함
        });
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('accessToken', data.accessToken);
        } else {
          throw new Error('Access token not found in localStorage');
        }
      }
    } catch (error) {
      console.error('Failed to update token', error);
    }
  }

  async startTokenUpdate() {
    // 15분마다 한 번씩 토큰 갱신 요청
    setInterval(() => {
      this.updateToken();
    }, 15 * 60 * 1000);
  }

  async stopTokenUpdate() {
    clearInterval(this.updateAuthTokenInterval);
  }
}

export default TokenManager;
