const express = require("express");
const {decode} = require("html-entities") //字符实体转换

let router = express.Router();

//获取课程搜索信息
router.get("/course",(req,resp)=>{
    let {key = ""} = req.query;
    key = decode(key);

    resp.tool.execSQLAutoResponse(`
        SELECT
            t_course.id,
            category_id,
            title,
            fm_url,
            is_hot,
            COUNT( t_course.id ) AS comment_count,
            avg(IFNULL( score, 0 )) AS comment_avg_score 
        FROM
            t_course
            LEFT JOIN t_comments ON t_course.id = t_comments.course_id 
        GROUP BY
            t_course.id 
        HAVING
            title LIKE '%${key}%'
    `,"课程搜索信息获取成功！")
})

//获取讲师搜索信息
router.get("/teacher",(req,resp)=>{
    let {key = ""} = req.query;
    key = decode(key);

    resp.tool.execSQLAutoResponse(`
        SELECT
            t_teacher.id,
            name,
            header,
            position,
            t_teacher.intro,
            is_star,
            COUNT( t_course.id ) AS course_count 
        FROM
            T_teacher
            LEFT JOIN t_course ON t_teacher.id = t_course.teacher_id 
        GROUP BY
            t_teacher.id 
        HAVING
            name LIKE '%${key}%'
    `,"讲师搜索信息获取成功！")
})

//获取搜索文章信息
router.get("/article",(req,resp)=>{
    let {key = ""} = req.query;
    key = decode(key);

    resp.tool.execSQLAutoResponse(`
        SELECT
            id,
            title,
            intro,
            create_time 
        FROM
            t_news 
        WHERE
            title LIKE '%${key}%'
        ORDER BY
            create_time DESC
    `,"搜索文章信息获取成功！")
})

//获取所有搜索信息
router.get("/all",(req,resp)=>{
   let {key=""} = req.query;
   key = decode(key);

    Promise.all([
        resp.tool.execSQL(`
            SELECT
                t_course.id,
                category_id,
                title,
                fm_url,
                is_hot,
                COUNT( t_course.id ) AS comment_count,
                avg(IFNULL( score, 0 )) AS comment_avg_score 
            FROM
                t_course
                LEFT JOIN t_comments ON t_course.id = t_comments.course_id 
            GROUP BY
                t_course.id 
            HAVING
                title LIKE '%${key}%'`),
        resp.tool.execSQL(`
            SELECT
                t_teacher.id,
                name,
                header,
                position,
                t_teacher.intro,
                is_star,
                COUNT( t_course.id ) AS course_count 
            FROM
                T_teacher
                LEFT JOIN t_course ON t_teacher.id = t_course.teacher_id 
            GROUP BY
                t_teacher.id 
            HAVING
                name LIKE '%${key}%'`),
        resp.tool.execSQL(`
            SELECT
                id,
                title,
                intro,
                create_time 
            FROM
                t_news 
            WHERE
                title LIKE '%${key}%'
            ORDER BY
                create_time DESC`)
    ]).then(([courseResult,teacherResult,articleResult])=>{
        resp.send(resp.tool.respondTemp(0,"所有搜索信息获取成功！", {
            courseResult,
            teacherResult,
            articleResult
        }))
    }).catch(error =>{
        resp.send(resp.tool.respondTemp(-1,"Api出现错误",null))
    })
})



module.exports = router;