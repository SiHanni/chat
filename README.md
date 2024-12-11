# chat
주소 : 
# 백엔드 : nestJS, TypeScript, Mysql, MongoDB
# 프론트엔드 : react, TypeScript
# 서버 배포 과정
GitHub Action
소스 코드 테스트, 도커 이미지 빌드, ECR에 푸시
ECS
EC2 인스턴스에서 실행되는 컨테이너 관리
롤링 업데이트 방식 ( 새 이미지가 ECR에 푸시되면 ECS에서 자동으로 새로운 Task를 실행, 기존 태스크 종료)
트래픽 전환 및 종료
ECS는 기본적으로 로드 밸런싱을 제공
싱글 인스턴스일지라도 ALB를 통해 EC2 인스턴스에 연결된 여러 컨테이너 간 트래픽을 분배하고 무중단 배포 지원
새 컨테이너가 정상 실행이 되면 자동으로 기존 컨테이너는 종료

# 프론트
npm build:production 후 빌드디렉토리 s3에 올려 정적 웹 호스팅
