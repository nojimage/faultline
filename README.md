# faultline

> Error tracking tool on AWS managed services.

![logo](https://k1low.github.io/faultline/faultline.png)

## Table of Contents

- [Concept](#concept)
- [Using framework](#using-framework)
- [How to deploy](#how-to-deploy)
- [Usage](#usage)
- [API](#api)
- [Web UI](#web-ui)
- [Destroy falueline](#destroy-falueline)
- [TODO](#todo)
- [Contribute](#contribute)
- [License](#license)

## Concept

- Simple deploy
- Manageless
- POST errors with config
- Between "Only mail notify" and "[Error tracking services](https://www.google.co.jp/search?q=error%20tracking%20service)"

## Using framework

- Serverless Framework :zap: (= v1.3.0)

### AWS Resources

- AWS Lambda
- API Gateway
- Amazon S3
- Amazon DynamoDB
- IAM

## How to deploy

### Clone

```sh
$ git clone https://github.com/k1LoW/faultline.git
$ cd faultline
$ npm install
```

### Edit config

Copy [`config.default.yml`](config.default.yml) to `config.yml`. And edit.

### Deploy to AWS

```sh
$ AWS_PROFILE=XXxxXXX npm run deploy
```

## Usage

### POST errors to API

Example:

```sh
$ curl -X POST -H "x-api-key: xxxxXXXXXxXxXXxxXXXXXXXxxxxXXXXXX" -H "Content-Type: application/json" -d @sample-errors.json https://xxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/v0/projects/sample-project/errors
```

Sample errors POST JSON file is [here](sample-errors.json).

### Notififaction

#### Slack

POST errors with slack notification config like [this](sample-errors.json).

![slack](https://k1low.github.io/faultline/slack.png)

#### GitHub issue

POST errors with GitHub repo config for creating issue, like following code

```json
{
  "errors": [

   - snip -

  ],
  "notifications": [

    - snip -

    {
      "type": "github",
      "userToken": "XXXXXXXxxxxXXXXXXxxxxxXXXXXXXXXX",
      "owner": "k1LoW",
      "repo": "faultline",
      "threshold": -1
    }
  ]
}
```

![GitHub](https://k1low.github.io/faultline/github.png)

## API

[API Document](api.md) generated by [jdoc](https://github.com/r7kamura/jdoc).

JSON Hyper-Schema is [here](schema.json).

## Web UI

Sample web UI for faultline

https://github.com/k1LoW/faultline-webui

## Destroy faultline

1. Delete all projects (or Empty S3 bucket).
2. Run following command.

```sh
$ AWS_PROFILE=XXxxXXX npm run destroy
```

## TODO

- [ ] Refactor API response format
- [ ] Notification
    - [x] Slack
    - [x] GitHub Issue
    - [ ] ???
- [ ] Error Notify Filter
- [ ] API Gateway API Key (waiting CFn/Serverless "Usage plan" support. see [#2450](https://github.com/serverless/serverless/issues/2450) )

## Contribute

PRs accepted.

## License

MIT © Ken&#39;ichiro Oyama
