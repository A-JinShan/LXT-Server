const express =require("express");

let router = express.Router();

//获取网站联系方式等信息
router.get("/web_config",(req,resp)=>{
    resp.tool.execSQLAutoResponse(`
        SELECT
            wechat_qrcode,
            mini_program,
            wb_qrcode,
            app,
            tel 
        FROM
            t_config
        LIMit 1;
    `),"网站联系方式查询成功",function (result) {
        if(result.length > 0){
            resp.send(resp.tool.respondTemp(1,"基本配置信息查询成功!",result[0]))
        }else{
            resp.send(resp.tool.respondTemp(0,"基本配置信息查询失败!",{}))
        }
    }
})

//获取首页导航栏等信息
router.get("/nav",(req,resp)=>{
    resp.tool.execSQLAutoResponse(`
        SELECT
            id,
            title,
            route 
        FROM
            t_nav;
    `,"导航栏信息查询成功!")
})

//获取焦点图课程等信息
router.get("/focus_img",(req,resp)=>{
    resp.tool.execSQLAutoResponse(`
        SELECT
            id,
            title,
            ad_url,
            course_id 
        FROM
            t_ad 
        WHERE
            is_show = 1;
    `,"焦点图课程信息获取成功！")
})

//获取热门好课
router.get("/hot_course",(req,resp)=>{
    resp.tool.execSQLAutoResponse(`
        SELECT
            t_course.id,
            title,
            fm_url,
            is_hot,
            COUNT( t_course.id ) AS comment_count,
            avg(IFNULL( score, 0 )) AS comment_avg_score 
        FROM
            t_course
            LEFT JOIN t_comments ON t_course.id = t_comments.course_id 
        WHERE
            is_hot = 1 
        GROUP BY
            t_course.id 
        LIMIT 10;
    `,"热门好课信息获取成功！")
})

//获取明星讲师
router.get("/star_teacher",(req,resp)=>{
    resp.tool.execSQLAutoResponse(`
        SELECT
        id,
            name,
            intro,
            header,
            position,
            is_star 
        FROM
            t_teacher 
        WHERE
            is_star = 1 
        LIMIT 6;
    `,"获取明星讲师信息获取成功！")
})

//获取最新文章
router.get("/last_news",(req,resp)=>{
    resp.tool.execSQLAutoResponse(`
        SELECT
            id,
            title,
            create_time 
        FROM
            t_news 
        ORDER BY
            create_time DESC 
        LIMIT 10;
    `,"获取最新文章信息获取成功！")
})

module.exports=router;