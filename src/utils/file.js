const { NewId } = require('./random');
const { Files } = require('../../config');

const fs = require('fs');

const File = {};
File.load = async (path) => {
    const files = await fs.readdirSync(Files.input);
    const filesData = [];
    for (let index in files) {
        const fileName = files[index];
        const fileStatus = fs.statSync(`${Files.input}\\${fileName}`);
        const nameData = fileName.split('@');
        const data = {
            id: NewId(),
            old_name: fileName,
            new_name: nameData[2].substring(0, nameData[2].lastIndexOf('.')),
            extension: nameData[2].substring(nameData[2].lastIndexOf('.')),
            size: fileStatus.size,
            kf_customer: nameData[0]
        };
        filesData.push(data);
    }

    return filesData;
}

File.move = async (old_path, new_path) => {
    await fs.renameSync(old_path, new_path);
}

module.exports = {
    File
}