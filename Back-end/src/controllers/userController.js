const userService = require("../services/userService")

const getAllUser = async(req,res)=>{
    try {
        const users =await userService.getAll();

        return res.status(200).json(users)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Lỗi hệ thống, thử lại sau!' });
    }
}

module.exports = {getAllUser}