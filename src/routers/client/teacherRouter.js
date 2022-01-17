const express = require("express");

let  router = express.Router();

//获取讲师列表 支持分页查询、星级讲师筛选
router.get("/list",((req, resp) =>{
    //获取请求参数 当is_star等于-1时查询全部讲师，等于0时查询不是星级讲师，等于1时查询星级讲师
    const {page_num = 1,page_size = 6,is_star = "-1"} = req.query;
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
            is_star in (${""+is_star === "-1" ? "0,1" : is_star})
        LIMIT ${(page_num  - 1) * page_size},${page_size};
    `)

}))

//获取讲师详情
router.get("/detail/:id",(req,resp)=>{
    const {id} = req.params;
    if(!id){
        resp.send(resp.tool.respondTemp("-2","必须传参数id",{}))
        return;
    }
    //并行执行两个sql
    Promise.all([resp.tool.execSQL(`
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
            id = ${id};
    `),resp.tool.execSQL(`
                SELECT
                    t_course.id,
                    teacher_id,
                    title,
                    fm_url,
                    is_hot,
                    count( t_comments.id ) AS comment_count,
                    IFNULL( AVG( t_comments.score ), 0 ) AS comment_avg_score
                FROM
                    t_course
                    LEFT JOIN t_comments ON t_course.id = t_comments.course_id
                GROUP BY
                    t_course.id
                HAVING
                    teacher_id = ${id};
             `)]).then(([teacherResult,courseResult])=>{
                 if(teacherResult.length >= 1){
                     let teacher = teacherResult[0];
                     teacher.course = courseResult;
                     return resp.send(resp.tool.respondTemp(0,"讲师详情查询成功！",teacher))
                 }else{
                     return resp.send(resp.tool.respondTemp(0,"讲师详情查询成功！",{}))
                 }
             }).catch(error=>{
                return resp.send(resp.tool.respondTemp(-1,"Api出现错误！",{}))
    })

    //串行执行两个sql
    // resp.tool.execSQL(`
    //     SELECT
    //         id,
    //         name,
    //         intro,
    //         header,
    //         position,
    //         is_star
    //     FROM
    //         t_teacher
    //     WHERE
    //         id = ${id};
    // `).then(result=>{
    //     if(result.length >= 1){
    //         let teacher = result[0];
    //         //执行一个sql 获取讲师对应的课程信息
    //         resp.tool.execSQL(`
    //             SELECT
    //                 t_course.id,
    //                 teacher_id,
    //                 title,
    //                 fm_url,
    //                 is_hot,
    //                 count( t_comments.id ) AS comment_count,
    //                 IFNULL( AVG( t_comments.score ), 0 ) AS comment_avg_score
    //             FROM
    //                 t_course
    //                 LEFT JOIN t_comments ON t_course.id = t_comments.course_id
    //             GROUP BY
    //                 t_course.id
    //             HAVING
    //                 teacher_id = ${id};
    //          `).then(courseResult=>{
    //             teacher.course = courseResult;
    //             console.log(teacher);
    //         })
    //     }
    // })
})

module.exports = router;