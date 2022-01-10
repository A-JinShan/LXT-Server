const mysql = require("mysql");

//创建连接池
let pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '5210770',
    database        : 'lxt-db'
});

//执行SQl
function execSQL(sqlTemp,values=[], successCB, failCB) {
    return new Promise((resolve, reject) => {
        pool.query(sqlTemp, values, function (error, results, fields) {
            if (error) {
                if (typeof failCB === "function") {
                    failCB(error);
                }
                reject(error)
            } else {
                if (typeof successCB === "function") {
                    successCB(results);
                }
                resolve(results)
            }
        });
    })
}

module.exports = execSQL;
