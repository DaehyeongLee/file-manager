### 프로젝트 목적
- Node.js, Socket.io, MongoDB, React, Bootstrap 이용해보기

### 프로젝트 주요 기능
- 파일 매니저 기능
 
- 채팅 기능

### 프로젝트 기술 스택
- Back-end
  - Node.js, Socket.io, MongoDB, Redis, ExpressJs 사용
  
- Front-end
  - React, Bootsrap, Reactstrap, React-router 사용
  
### 템플릿 실행
- 실행 전 작업
  - DB 설치
    - `cd scripts && ./installDb.sh` 명령어로 Mongodb, Redis를 설치합니다.
  - npm package 설치
    - `npm install` 명령어로 npm package를 설치합니다.
	
- 실행
  - DB 실행
    - `./scripts/startDb.sh` 명령어로 Mongodb, Redis를 시작합니다.
  - App Build
    - `npm run build:prd`로 Production 모드로 빌드합니다.
    - 또는 `npm run build:dev`로 Development 모드로 빌드합니다.
  - App Start
    - `npm run start:prd`로 Production 모드로 실행합니다.
    - 또는 `npm run start:dev`로 Development 모드로 실행합니다.
  

