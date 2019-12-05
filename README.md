# Recording Studio Web

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FAppleHolic%2Frecording_studio_web)](https://hits.seeyoufarm.com)

## Intro

*Goals*

1. Make it easy to manage lists and manage recording voices in situations where text is given.
2. Make interface for prototyping in cases that are voice to voice, X to voice.

This repository is on initial version.

#### It's under development.

- Related Repository : https://github.com/AppleHolic/recording_studio_api
- Initial Version :
  - Supports upload, download, list-up, pagination
  - KSS Dataset (https://www.kaggle.com/bryanpark/korean-single-speaker-speech-dataset)
  - Ongoing
    - Support LJSpeech datatset, Better paginaiton

## How to use

- Environment : MacOS X

- Installation

```
$ brew install npm
$ npm install vue vue-cli -g
$ npm install
```

- Run it with npm

```
$ npm run serve
```

- Use Docker

```
$ docker build --tag recording_studio_web:latest .
$ docker run --rm -it -p 8080:8080 recording_studio_web:latest
```

And then, you can see recording and sound components on localhost:8080!
