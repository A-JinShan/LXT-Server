const express = require("express");

let router = express.Router();

//获取课程分页
router.get("/category",(req,resp)=>{
    resp.tool.execSQLAutoResponse(`
        SELECT
            id,
            title 
        FROM
            t_course_category 
        WHERE
            parent_id = 0;
    `,"课程分类获取成功！")
})

//获取课程列表(根据分类ID进行获取)
router.get("/list",(req,resp)=>{
    const {page_num = 1,page_size = 10,category_id = "-1"} = req.query;
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
            ${"" + category_id === "-1" ? "" :"HAVING category_id = " + category_id }
        LIMIT ${(page_num - 1) * page_size},${page_size};
    `,"课程列表获取成功！")
})

//获取课程基本信息
router.get("/basic_info/:id",(req,resp)=>{
    const {id} = req.params;
    resp.tool.execSQLAutoResponse(`
        SELECT
            t_course.id,
            title,
            fm_url,
            is_hot,
            t_course.intro,
            teacher_id,
            name,
            header,
            position,
            count( course_id ) AS comment_count,
            AVG(IFNULL( score, 0 )) AS course_avg_score 
        FROM
            t_course
            LEFT JOIN t_comments ON t_course.id = course_id
            LEFT JOIN t_teacher ON teacher_id = t_teacher.id 
        GROUP BY
            t_course.id
        HAVING 
            t_course.id = ${id};
    `,"课程基本信息获取成功！")
})

//获取评论信息
router.get("/comment/:id",(req,resp)=>{
    const {id} = req.params;
    resp.tool.execSQLAutoResponse(`
        SELECT
            t_comments.id,
            score,
            content,
            create_time,
            user_id,
            nick_name,
            header 
        FROM
            t_comments
            LEFT JOIN t_user ON user_id = t_user.id 
        WHERE
            course_id = ${id}
        ORDER BY
            create_time DESC;
    `,"评论信息获取成功！")
})

//获取课程大纲
router.get("/outline/:id",(req,resp)=>{
    const {id} = req.params;
    resp.tool.execSQLAutoResponse(`
        SELECT
            id,
            num,
            title,
            video_url 
        FROM
            t_course_outline 
        WHERE
            course_id = ${id};
    `,"课程大纲获取成功！")
})

module.exports = router;
