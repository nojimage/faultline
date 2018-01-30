'use strict';

const console = require('console');
const middy = require('middy');
const { cors, httpErrorHandler } = require('middy/middlewares');
const moment = require('moment');
const Aws = require('../lib/aws');
const Handler = require('../lib/handler');
const checkApiKeyMiddleware = require('../lib/checkApiKeyMiddleware');
const aws = new Aws();
const {
    bucketName,
    errorByTimeunitTable
} = require('../lib/constants');
const {
    resgen
} = require('../lib/functions');

class ErrorsGetHandler extends Handler {
    constructor(aws) {
        return (event, context, cb) => {
            const project = decodeURIComponent(event.pathParameters.project);
            const message = decodeURIComponent(event.pathParameters.message);
            const start = event.queryStringParameters && event.queryStringParameters.hasOwnProperty('start') ? event.queryStringParameters.start : moment().startOf('month').format();
            const end = event.queryStringParameters && event.queryStringParameters.hasOwnProperty('end') ? event.queryStringParameters.end : moment().endOf('month').format();

            const key = [project, message].join('##');

            const occurrencePrefix = ['projects', project, 'errors', message, 'occurrences'].join('/') + '/';
            const occurrencesDirParams = {
                Bucket: bucketName,
                Delimiter: '/',
                Prefix: occurrencePrefix,
                MaxKeys: 1
            };

            const docParams = {
                TableName: errorByTimeunitTable,
                KeyConditionExpression: '#key = :key AND #timestamp BETWEEN :from AND :to',
                ExpressionAttributeNames:{
                    '#key':'key',
                    '#timestamp':'timestamp'
                },
                ExpressionAttributeValues: {
                    ':key':key,
                    ':from':moment(start, moment.ISO_8601).format(),
                    ':to':moment(end, moment.ISO_8601).format()
                }
            };

            aws.storage.listObjects(occurrencesDirParams)
                .then((data) => {
                    const occurrenceParams = {
                        Bucket: bucketName,
                        Key: data.Contents[0].Key
                    };
                    return Promise.all([
                        aws.storage.getObject(occurrenceParams),
                        aws.storage.queryDoc(docParams),
                    ]);
                })
                .then((data) => {
                    const response = resgen(200, {
                        data: {
                            error: JSON.parse(data[0].Body.toString()),
                            timeline: {
                                errors: data[1].Items,
                                totalCount: data[1].Count,
                                scannedCount: data[1].ScannedCount
                            }
                        }
                    });
                    cb(null, response);
                })
                .catch((err) => {
                    console.error(err);
                    const response = resgen(500, { errors: [{ message: 'Unable to GET error', detail: err }] });
                    cb(null, response);
                });
        };
    }
}
const handlerBuilder = (aws) => {
    return middy(new ErrorsGetHandler(aws))
        .use(checkApiKeyMiddleware())
        .use(httpErrorHandler())
        .use(cors());
};
const handler = handlerBuilder(aws);
module.exports = { handler, handlerBuilder };
