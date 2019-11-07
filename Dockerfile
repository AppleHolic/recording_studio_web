FROM node:13.0-alpine

EXPOSE 8080

# 앱 디렉터리 생성
WORKDIR /usr/src/app

# 앱 소스 추가
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD npm run serve
