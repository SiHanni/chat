# chat

주소 :

# 백엔드 : nestJS, TypeScript, Mysql, MongoDB

# 프론트엔드 : react, TypeScript

# 서버 배포 과정

1. GitHub Action

- 소스 코드 테스트, 도커 이미지 빌드, ECR에 푸시

2. ECS

- EC2 인스턴스에서 새 버전의 컨테이너를 생성
- 새 컨테이너 에러 체크

3. Caddy

- 리버스프록시로 외부의 기존 서버 포트로 들어오는 요청을 새 서버 컨테이너 포트로 갈 수 있게 포트포워딩

# 프론트

npm build:production 후 빌드디렉토리 s3에 올려 정적 웹 호스팅
