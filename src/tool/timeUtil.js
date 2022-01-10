function getCurrentTime() {
    let date = new Date();
    let year = date.getFullYear()
    let month = date.getMonth()+1
    let day = date.getDate()
    let hour = date.getHours()
    let minute = date .getMinutes()
    let second = date.getSeconds()
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

function getCurrentDate() {
    let date = new Date();
    let year = date.getFullYear()
    let month = date.getMonth()+1
    let day = date.getDate()
    return `${year}-${month}-${day}`
}
module.exports={
    getCurrentTime,
    getCurrentDate
}