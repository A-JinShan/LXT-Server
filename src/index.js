const express = require("express")
const path = require("path")
const {crossDomainM,rizhiM,toolM,errorMF,notFoundMF} = require("./middileware/commonMiddileware")
const homeRouter = require("./routers/client/homeRouter")
const teacherRouter = require("./routers/client/teacherRouter")
const courseRouter = require("./routers/client/courseRouter")
const articleRouter = require("./routers/client/articleRouter")
const searchRouter = require("./routers/client/searchRouter")
const userRouter = require("./routers/client/userRouter")


let app = express();

//跨域中间件
app.use(crossDomainM)

//挂载工具的中间件
app.use(toolM)

//post请求参数处理
app.use(express.json(),express.urlencoded({ extended: true }))

//挂载日志中间件
app.use(rizhiM)

//挂载静态资源服务中间件
app.use(express.static(path.resolve(__dirname,"public")))

//挂载路由中间件挂载
app.use("/api/client/home",homeRouter)
app.use("/api/client/teacher",teacherRouter)
app.use("/api/client/course",courseRouter)
app.use("/api/client/article",articleRouter)
app.use("/api/client/search",searchRouter)
app.use("/api/client/user",userRouter)

//挂载404处理中间件
app.use(notFoundMF(path.resolve(__dirname,"./defaultPage/404.html")))

//挂载错误处理中间件
app.use(errorMF(path.resolve(__dirname,"./defaultPage/500.html")))

//监听端口地址
app.listen(5000,()=>{
    console.log("撩学堂-后端项目服务器启动成功：localhost:5000/")
})