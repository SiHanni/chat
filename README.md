# chat

주소 : [마루톡](https://marutalk.com)

# 백엔드 : nestJS, TypeScript, Mysql, MongoDB

# 프론트엔드 : react, TypeScript

# 서버 배포

- git Actions -> AWS ECR

- alb BlueGreen 무중단배포

# 프론트 배포

- git action -> s3 정적 웹호스팅, cloudwatch 무효화

# 업데이트 일지

- 1월 26일</br>
  url endpoint restful하게 변경
  프로필페이지 무한호출 이슈 메모이제이션 적용
  웹소켓 이벤트 명명법 변경
  읽지 않은 채팅 버그 해결
- 1월 11일</br>
  웹소켓 연결 시작점 수정
  실시간 읽지 않은 채팅 전체 적용
  프론트 ci/cd
- 1월 8일</br>
  로그아웃 보안 강화
  채팅방 읽지 않은 채팅, 마지막 메세지 확인 기능(일부 적용)
- 1월 4일</br>
  친구 찾기, 친구 요청 리팩토링
  기능 추가: 이름으로 친구 찾기 추가
  백엔드, 프론트 관련 리팩토링
- 1월 3일</br>
  사용자 편의성 디자인 수정
  설명, 회원가입, 로그인 디자인 변경
  통합 모달 추가 (Basic Modal)
  영문 줄바꿈 안됌 이슈
  프로필이미지 변경후 채팅창 반영 안되는 현상 해결
  (프로필 업데이트 후 로컬스토리지 반영되지않은 원인)
  채팅창 내 이미지 전송 시 미리보기 제공
  업데이트 일지 추가
- 1월 2일</br>
  사용자 편의성 기능 추가
  프로필 변경시 이미지 미리보기
  일반 유저 일일 프로필변경, 파일 전송 횟수 제한
- 1월 1일</br>
  marutalk.com 도메인 등록
- 12월 29일</br>
  프로필 업데이트 화면에서 프로필 이미지 클릭시 프로필 이미지 수정 가능
- 12월 27일</br>
  환경 설정 추가 (비밀번호 변경)
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
