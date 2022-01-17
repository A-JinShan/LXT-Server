const express = require("express");

let router = express.Router();

//获取文章列表
router.get("/list",(req,resp)=>{
    const {page_num = 1,page_size = 10} = req.query;
    resp.tool.execSQLAutoResponse(`
        SELECT
            id,
            title,
            intro,
            create_time 
        FROM
            t_news 
        ORDER BY
            create_time DESC
        LIMIT ${(page_num - 1) * page_size},${page_size};
    `,"文章列表获取成功！")
})

//获取文章详情
router.get("/detail/:id",(req,resp)=>{
    const {id}= req.params;
    resp.tool.execSQLAutoResponse(`
        SELECT
            id,
            title,
            content,
            create_time 
        FROM
            t_news 
        WHERE
            id = ${id}
    `,"文章详情获取成功获取成功！",result=>{
        if(result.length >= 1){
            return result[0];
        }else{
            return {};
        }
    })
})

module.exports = router;
