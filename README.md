# chat
주소 : 
# 백엔드 : nestJS, TypeScript, Mysql, MongoDB
# 프론트엔드 : react, TypeScript
# 서버 배포 과정
1. 작업 브랜치에서 작업 후 main 브랜치로 풀리퀘스트
2. 코드 리뷰 후 풀리퀘스트 승인, merge
3. 깃허브 액션 (테스트 실행, 도커 이미지 빌드, ECR에 이미지 푸시)
4. ec2 인스턴스에서 최신 이미지를 docker pull
5. 새로은 이미지로 새로운 컨테이너를 생성
6. Caddy 리버스 프록시 설정을 변경하여 새로운 컨테이너로 트래픽 전환 (Caddy 설정 변경 후, caddy reload 하는 방식)
7. 새 컨테이너 서비스 기능 최종 확인
8. 기존 컨테이너 종료

# 프론트는 npm build:production 후 빌드디렉토리 s3에 올려 정적 웹 호스팅
