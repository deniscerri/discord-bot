const fs = require('fs');
const path = require("path")

module.exports = {
    execute(dir, arrayOfFiles){
        return getCommandsFiles(dir, arrayOfFiles)
    }
}

const getCommandsFiles = (dir, arrayOfFiles) => {
	let files = fs.readdirSync(dir)
	arrayOfFiles = arrayOfFiles || []

	files.forEach(file => {
		if(fs.statSync(dir + "/" + file).isDirectory()){
			arrayOfFiles = getCommandsFiles(path.join(dir, "/", file), arrayOfFiles)
		}else{
			if(file.endsWith('.js')){
				arrayOfFiles.push(path.join(dir, "/", file))
			}
		}
	})

	return arrayOfFiles
}
