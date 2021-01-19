const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const filePath = `${process.env.PATHFILE}${process.env.FILENAME}.${process.env.FORMAT}`;

app.get('/', (req: any, res: any) => {
    loggingToFile(req, res);
    res.send('Hello World!')
});

const writeFileJSON = (fileData: any, callback: any, filePath: any, encoding = 'utf8') => {
    fs.writeFile(filePath, fileData, encoding, (err: any) => {
        if (err) {
            throw err;
        }
        callback();
    });
};

const readFileJSON = (callback: any, filePath: any, encoding = 'utf8') => {
    fs.readFile(filePath, encoding, (err: any, data: any) => {
        if (err) {
            throw err;
        }
        callback(data ? JSON.parse(data) : []);
    });
};

const findAll = (callback: any, filePath: any) => {
    readFileJSON((data: any) => {
        callback(data);
    }, filePath);
};

function loggingToFile(req: any, res: any) {
    if (process.env.FORMAT === 'txt') {
        let string = `${new Date()} PORT: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress} ${req.method} ${req.url}, RESPONSE ${res.statusCode} \n`;
        fs.appendFile(filePath, string, console.log);
    } else {
        try {
            findAll((data: any) => {
                const logs = [...data];
                logs.push({
                    datetime: new Date(),
                    remoteAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                    method: req.method,
                    path: req.url,
                    statusCode: res.statusCode
                });
                writeFileJSON(JSON.stringify(logs, null, 2), () => {}, filePath);
            }, filePath)
        } catch (err) {
            console.log(err)
        }
    }
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
