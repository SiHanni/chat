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

// deprecated
3. Caddy

- 리버스프록시로 외부의 기존 서버 포트로 들어오는 요청을 새 서버 컨테이너 포트로 갈 수 있게 포트포워딩

# 프론트

npm build:production 후 빌드디렉토리 s3에 올려 정적 웹 호스팅

# 업데이트 일지

- 12월 24일</br>
  ws 연결 강화
- 12월 23일</br>
  모바일 반응형 화면 추가
- 12월 20일</br>
  친구 목록에서 채팅창 바로 입장 기능 추가
- 12월 20일</br>
  채팅창 파일전송 s3로 저장소 이관
- 12월 18일</br>
  jwt 갱신 정책 적용
- 12월 16일</br>
  jest를 통한 테스트 코드 작성 시작
- 12월 9일</br>
  logging 시스템 적용
- 12월 6일</br>
  상용배포를 위한 data-source, docker file, compose.yml 추가
- 12월 2일</br>
  mark1 개발 완료
- 11월 12일</br>
  개발 시작
