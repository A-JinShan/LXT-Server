const nodemailer = require("nodemailer");

//邮件告警
let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com', // QQ邮箱主机名, 网易邮箱是: smtp.163.com
    secureConnection: true, // use SSL
    port: 465,
    secure: true, // secure:true 对应 port 465, secure:false 对应 port 587
    auth: {
        user: '910897411@qq.com',
        pass: 'sexfpvldgwkdbdef' // QQ邮箱需要使用授权码, 163邮箱使用密码
    }
})


//发送邮件
function sendEmail(to,title,content){
    // 设置邮件内容（谁发送什么给谁）
    let mailOptions = {
        from: '"墨" <910897411@qq.com>', // 发件人
        to: to, // 收件人, 多人通过, 分割
        subject: title, // 主题
        text:content, // plain text body 和下方html字段取其一
        // html: '<h3>这是一封来自 Node.js 的测试邮件</h3>', // html body
        // 下面是发送附件，不需要就注释掉
        attachments: [
            {
                filename: '错误报告.txt',
                content:content
            }
        ]
    };
    transporter.sendMail(mailOptions).then(result=>{
        console.log(`Message: ${result.messageId}`);
        console.log(`sent: ${result.response}`);
    })
}

module.exports = sendEmail;