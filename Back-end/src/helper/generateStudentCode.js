const { Op } = require('sequelize');
const Student = require('../models/student');

const generateStudentCode = async () => {
    const currentYear = 23;
    const prefix = `${currentYear}IT`;

    const lastStudent = await Student.findOne({
        where: {
            studentCode: {
                [Op.like]: `${prefix}%`
            }
        },
        order: [['studentCode', 'DESC']]
    });

    // chưa có sinh viên
    if (!lastStudent || !lastStudent.studentCode) {
        return `${prefix}001`;
    }

    const lastNumber = parseInt(
        lastStudent.studentCode.slice(-3)
    );

    const nextNumber = (lastNumber + 1)
        .toString()
        .padStart(3, '0');

    return `${prefix}${nextNumber}`;
};

module.exports = generateStudentCode;