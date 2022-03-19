const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

let router = express.Router();

//用户注册接口
router.post("/register",(req,resp)=>{
    const  {account,password} = req.body;

    let nick_name = "匿名";
    let header = "/images/user/xl.jpg";
    let intro = "好好学习，天天向上！";


    resp.tool.execSQL("select id from t_user where account = ?;",[account],result=>{
        if(result.length > 0){
            resp.send(resp.tool.respondTemp("-2","用户名已存在！",{}))
        }else{
            resp.tool.execSQLTempAutoResponse(`insert into t_user (account,password,nick_name,header,intro) values (?,?,?,?,?);`,[account,password,nick_name,header,intro],"注册成功！",result =>{
                if(result.affectedRows > 0){
                    return {
                        id:result.insertId,
                        nick_name,
                        header,
                        intro
                    }
                }
            })
        }
    })
})

//登录接口
router.post("/login",(req,resp)=>{
    const {account,password} = req.body;

    resp.tool.execSQLTempAutoResponse(`select id,account,nick_name,header,intro from t_user where account = ? and password = ? ;`,[account,password],"验证成功！",result =>{
        if(result.length > 0){
            return result[0];
        }
        return {
            code:-2,
            message:"账号或密码错误！",
            data:{}
        }
    })
})


//鉴权判定
router.use((req,resp,next) =>{
    // 判定用户是否登录过了?
    // 登录: next()
    // 没有登录: 拦截->响应提示给回客户端
    let isLogin = true;
    if (isLogin) {
        next()
    } else {
        resp.send({
            code: -1,
            message: "你还未登录, 请登录后调用该接口"
        })
    }
})

//学习历史记录信息
router.get("/study_history",(req,resp)=>{
    const {user_id}=req.query;
    if(!user_id){
        resp.send(resp.tool.respondTemp(-2,"请传入用户ID"));
        return ;
    }
    resp.tool.execSQLTempAutoResponse(`
        SELECT
            t_study_course.*,
            COUNT(outline_id) as course_outline_count
        FROM
            (
            SELECT
                user_id,
                course_id,
                outline_id,
                title,
                fm_url,
                is_hot,
                COUNT( outline_id ) AS learned_count 
            FROM
                t_study_history
                LEFT JOIN t_course ON course_id = t_course.id 
            WHERE
                user_id = ? 
            GROUP BY
                course_id) as t_study_course
            LEFT JOIN t_course_outline on t_study_course.course_id = t_course_outline.course_id
        GROUP BY
            t_course_outline.course_id;
    `,[user_id],"学习历史记录获取成功")
})

//学习历史记录更新/新增
router.post("/update_study_history",(req,resp)=>{
    const {user_id,course_id,outline_id,is_finish = "0"} =req.body;

    resp.tool.execSQL(`
        SELECT
            count(*) as is_learned 
        FROM
            t_study_history 
        WHERE
            user_id =? 
            AND course_id =? 
            AND outline_id =?;`,[user_id,course_id,outline_id],result =>{
            let is_learned = result[0].is_learned;

            if(is_learned > 0){
                //更新
                resp.tool.execSQLTempAutoResponse(`
                    UPDATE 
                        t_study_history 
                    SET 
                        state = ?  
                    WHERE
                        user_id =? 
                        AND course_id =? 
                        AND outline_id =?;
                `,["" + is_finish === "0" ? 1:2,user_id,course_id,outline_id],"更新成功！",result=>({}))
            }else{
                //新增
                resp.tool.execSQLTempAutoResponse(`
                    insert into t_study_history (user_id,course_id,outline_id,state) values (?,?,?,?)
                `,[user_id,course_id,outline_id,"" + is_finish === "0" ? 1:2],"新增成功！",result=>({}))
            }
    })
})

//头像的更新
let uploader = multer({dest:path.resolve(__dirname,"../../public/images/user")})
router.post("/update_header",uploader.single("header"),(req,resp)=>{
    let {user_id} = req.body;
    let file = req.file;
    let file_name= file.filename;
    let ext_name = path.extname(file.originalname);
    fs.renameSync(file.path,path.resolve(__dirname,"../../public/images/user/",file_name + ext_name));


    //把用户对应的老头像删除
    resp.tool.execSQL(`select header from t_user where id = ? ;`,[user_id]).then(result =>{
        if(result.length > 0){
            let userHeaderPath = result[0].header;
            //判断是否四默认头像 不是删除
            if("/images/user/xl.jpg" !== userHeaderPath.toLowerCase()){
                //删除对应的图片资源
                fs.unlinkSync(path.resolve(__dirname,"../../public" + userHeaderPath));
            }
            //把新的图像路径存储到数据库当中(更新)
            let newPath = "/images/user/" + file_name + ext_name;
            resp.tool.execSQL(`update t_user set header = ? where id = ? ;`,[newPath,user_id],"头像修改成功！").then(res =>{
                if(res.affectedRows > 0){
                    resp.tool.execSQL(`select id,account,nick_name,header,intro from t_user where id = ?;`,[user_id]).then(userResult =>{
                        resp.send(resp.tool.respondTemp("0","头像更新成功！",userResult[0]))
                    })
                }else {
                    resp.send(resp.tool.respondTemp("0","头像更新失败！",{}))
                }
            })
        }
    })
})



//用户基本信息的更新
router.post("/update_info",(req,resp)=>{
    const {user_id,nick_name,intro} = req.body;

    resp.tool.execSQL(`update t_user set nick_name = ?,intro = ? where id = ?;`,[nick_name,intro,user_id]).then(result =>{
        //ID不存在 affectedRows = 0
        //ID存在 修改内容和原内容一致
        //ID存在 修改内容和原内容不一致
        if(result.affectedRows > 0){
            //更新成功
            resp.tool.execSQL(`select id,account,nick_name,header,intro from t_user where id = ?;`,[user_id]).then(userResult =>{
                resp.send(resp.tool.respondTemp(0,"用户信息更新成功！",userResult[0]))
            })
        }else {
            //更新失败
            resp.send(resp.tool.respondTemp(0,"用户信息更新失败:用户不存在！",{}))
        }
    })

})

//密码修改
router.post("/update_password",(req,resp)=>{
    const {account,password,new_password} = req.body;

    resp.tool.execSQL(`update t_user set password = ? where account = ? and password = ?;`,[new_password,account,password]).then(result =>{
        if(result.affectedRows > 0){
            resp.send(resp.tool.respondTemp(0,"更新密码成功",{}))
        }else {
            resp.send(resp.tool.respondTemp(-1,"更新密码成功",{}))
        }
    })
})

module.exports = router;