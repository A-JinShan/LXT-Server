const express = require("express")
const path = require("path")
const {rizhiM,errorMF,notFoundMF,crossDomainM} = require("./middileware/commonMiddileware")
const homeRouter = require("./routers/homeRouter")

let app = express();

//跨域中间件
app.use(crossDomainM)

//post请求参数处理
app.use(express.json(),express.urlencoded({ extended: true }))

//日志中间件
app.use(rizhiM)

//静态资源服务中间件
app.use(express.static(path.resolve(__dirname,"public")))

//挂载路由中间件挂载
app.use("/",homeRouter)

//404处理中间件
app.use(notFoundMF(path.resolve(__dirname,"./defaultPage/404.html")))

//错误处理中间件
app.use(errorMF(path.resolve(__dirname,"./defaultPage/500.html")))

//监听端口地址
app.listen(5000,()=>{
    console.log("撩学堂-后端项目服务器启动成功：localhost:5000/")
})