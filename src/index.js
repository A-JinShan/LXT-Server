const express = require("express")
const path = require("path")
const {crossDomainM,rizhiM,toolM,errorMF,notFoundMF} = require("./middileware/commonMiddileware")
const homeRouter = require("./routers/client/homeRouter")
const teacherRouter = require("./routers/client/teacherRouter")
const courseRouter = require("./routers/client/courseRouter")
const articleRouter = require("./routers/client/articleRouter")
const searchRouter = require("./routers/client/searchRouter")
const userRouter = require("./routers/client/userRouter")

const m_adminRouter = require("./routers/manager/adminRouter")
const m_configRouter = require("./routers/manager/configRouter")
const m_courseRouter = require("./routers/manager/courseRouter")
const m_adCourseRouter = require("./routers/manager/adCourseRouter")
const m_articleRouter = require("./routers/manager/articleRouter")
const m_categoryRouter = require("./routers/manager/categoryRouter")
const m_overViewRouter = require("./routers/manager/overViewRouter")
const m_teacherRouter = require("./routers/manager/teacherRouter")
const m_statisticsRouter = require("./routers/manager/statisticsRouter")





let app = express();

//挂载工具的中间件
app.use(toolM)

//post请求参数处理
app.use(express.json(),express.urlencoded({ extended: true }))

//挂载日志中间件
app.use(rizhiM)

//跨域中间件
app.use(crossDomainM)

//挂载静态资源服务中间件
app.use(express.static(path.resolve(__dirname,"public")))

//挂载路由中间件挂载
app.use("/api/client/home",homeRouter)
app.use("/api/client/teacher",teacherRouter)
app.use("/api/client/course",courseRouter)
app.use("/api/client/article",articleRouter)
app.use("/api/client/search",searchRouter)
app.use("/api/client/user",userRouter)

app.use("/api/manager/admin",m_adminRouter)
app.use("/api/manager/over_view",m_overViewRouter)
app.use("/api/manager/ad_course",m_adCourseRouter)
app.use("/api/manager/category",m_categoryRouter)
app.use("/api/manager/teacher",m_teacherRouter)
app.use("/api/manager/course",m_courseRouter)
app.use("/api/manager/article",m_articleRouter)
app.use("/api/manager/statistics",m_statisticsRouter)
app.use("/api/manager/config",m_configRouter)



//挂载404处理中间件
app.use(notFoundMF(path.resolve(__dirname,"./defaultPage/404.html")))

//挂载错误处理中间件
app.use(errorMF(path.resolve(__dirname,"./defaultPage/500.html")))

//监听端口地址
app.listen(5000,()=>{
    console.log("撩学堂-后端项目服务器启动成功：localhost:5000/")
})