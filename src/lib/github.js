'use strict';

const console = require('console');
const github = require('github');
const messageBuilder = require('./messageBuilder');

module.exports = (n, errorData) => {
    const title = messageBuilder.title(n, errorData);
    const g = new github({
        timeout: 5000
    });

    g.authenticate({
        type: 'token',
        token: n.userToken
    });

    let acitonIfExist = 'reopen-and-comment';
    if (n.if_exist) {
        acitonIfExist = n.if_exist;
    }

    function isReopen() {
        return (['reopen', 'reopen-and-comment', 'reopen-and-update'].indexOf(acitonIfExist) >= 0);
    }

    function isComment() {
        return (['comment', 'reopen-and-comment'].indexOf(acitonIfExist) >= 0);
    }

    function isUpdate() {
        return (['reopen-and-update'].indexOf(acitonIfExist) >= 0);
    }

    function getAllIssues(arr) {
        if (!arr) arr=[];
        const limit = 100;
        let page = Math.ceil(arr.length / limit) + 1;
        let condition = {
            owner: n.owner,
            repo: n.repo,
            state: 'all',
            per_page: limit,
            page: page
        };
        return g.issues.getForRepo(condition).then(function(results) {
            if (!results.length)
                return arr;
            else
                return getAllIssues(arr.concat(results));
        });
    }

    getAllIssues().then((res) => {
        const filtered = res.filter((issue) => {
            return issue.title == title;
        });
        let promises = [];
        let labels = [];
        if (n.labels) {
            labels = n.labels;
        }
        const body = messageBuilder.body(n, errorData);
        if (filtered.length == 1) {
            const number = filtered[0].number;
            if (isReopen()) {
                if (isUpdate()) {
                    promises.push(g.issues.edit({
                        owner: n.owner,
                        repo: n.repo,
                        number: number,
                        state: 'open',
                        title: title,
                        labels: labels,
                        body: body + messageBuilder.footer(n, errorData)
                    }));
                } else {
                    promises.push(g.issues.edit({
                        owner: n.owner,
                        repo: n.repo,
                        number: number,
                        state: 'open'
                    }));
                }
            }
            if (isComment()) {
                promises.push(g.issues.createComment({
                    owner: n.owner,
                    repo: n.repo,
                    number: number,
                    body: body + messageBuilder.commentFooter(n, errorData)
                }));
            }
        } else {
            // Create issue
            promises.push(g.issues.create({
                owner: n.owner,
                repo: n.repo,
                title: title,
                labels: labels,
                body: body + messageBuilder.footer(n, errorData)
            }));
        }
        return Promise.all(promises);
    }).then(() => {
    }).catch((err) => {
        console.error(err);
    });

};
