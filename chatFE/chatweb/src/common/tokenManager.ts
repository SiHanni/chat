import axios from 'axios';
import { server_url } from './serverConfig';

/** 토큰 갱신을 위한 싱글톤 클래스 */
class TokenManager {
  private static instance: TokenManager;
  private tokenRefreshing: boolean = false;

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  private async updateToken() {
    // 이미 갱신 중이면 중복 요청 방지
    if (this.tokenRefreshing) {
      return;
    }

    this.tokenRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const response = await axios.post(
          `${server_url}/auth/updatetoken`,
          {
            refreshToken,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );

        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }
    } catch (error) {
      console.error('Failed to refresh token', error);
    } finally {
      this.tokenRefreshing = false;
    }
  }

  public startTokenUpdate() {
    // 15분마다 한 번씩 토큰 갱신 요청
    setInterval(() => {
      this.updateToken();
    }, 15 * 60 * 1000);
  }
}

export default TokenManager;
