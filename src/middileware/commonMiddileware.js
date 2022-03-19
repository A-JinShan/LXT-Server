const {getCurrentTime} = require("../tool/timeUtil")
const path = require("path")
const sendEmail = require("../tool/emailUtil")
const execSQL = require("../tool/mysqlUtil")

//跨域中间件
let crossDomainM = (req, resp, next) =>{
    resp.header("Access-Control-Allow-Origin", "*")
    resp.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With")
    resp.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS")
    resp.header("X-Powered-By",' 3.2.1')
    next()
}

//日志处理中间件
let rizhiM=function(req,resp,next){
        //请求时间
        // let time = getCurrentTime()
        //请求路径
        let requirePath = req.path
        //请求方法
        let method = req.method
        //请求参数
        let params = {}
        if(method.toLowerCase() === 'get'){
            params = req.query
        }else{
            params = req.body
        }
        //客户端信息
        let  user_agent= req.headers['user-agent']

        execSQL(`insert into log (method,path,params,user_agent) value (?,?,?,?)`,[method,requirePath,JSON.stringify(params),user_agent]).then(result=>{
            console.log("记入日志成功");
        })
        next()
}

//工具中间件
let toolM = (req,resp,next)=>{
    function respondTemp(code,message,data){
        return {
            code,
            message,
            data
        }
    }
    resp.tool = {
        execSQL,
        respondTemp,
        execSQLAutoResponse:function (sql,successMsg="查询成功",handleResultF=result=>result) {
            execSQL(sql).then(result => {
                resp.send(resp.tool.respondTemp(0,successMsg,handleResultF(result)))
            }).catch(error=>{
                resp.send(resp.tool.respondTemp(-1,"Api出现错误",null))
            })
        },
        execSQLTempAutoResponse:function (sqlTemp,values=[],successMsg="查询成功",handleResultF=result=>result) {
            execSQL(sqlTemp,values).then(result => {
                resp.send(resp.tool.respondTemp(0,successMsg,handleResultF(result)))
            }).catch(error=>{
                resp.send(resp.tool.respondTemp(-1,"Api出现错误",null))
            })
        }
    }
    next()
}

//错误处理中间件
let errorMF = function(errorPagePath){
    if(!path.isAbsolute(errorPagePath)){
        throw Error("必须传递一个绝对路径")
    }
    return function(err,req,resp,next){
        //发生错误时间
        let time = getCurrentTime()
        //错误类型
        let type = err.name
        //错误描述
        let message = err.message
        //错误栈信息
        let stack = err.stack
        let info = `
        ========================================
        发生错误的时间:${time}
        错误类型:${type}
        错误描述:${message}
        错误信息:${stack}
        ========================================
        `
        execSQL(`insert into error (err_type,err_msg,err_stack) value (?,?,?)`,[type,message,JSON.stringify(stack)]).then(result=>{
            if(result.affectedRows >= 1){
                //发送邮件
                sendEmail("910897411@qq.com","服务器出现bug",info)
            }
        })
        resp.status(500).sendFile(errorPagePath)
    }
}

//404处理中间件
let notFoundMF =function (notFoundPagePath){
    return (req,resp)=>{
        resp.status(404).sendFile(notFoundPagePath)
    }
}

module.exports = {
    crossDomainM,
    rizhiM,
    toolM,
    errorMF,
    notFoundMF
}