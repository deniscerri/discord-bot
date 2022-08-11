const fs = require('fs');
const path = require("path")

module.exports = {
    execute(dir, arrayOfFiles){
        return getCommandsFiles(dir, arrayOfFiles, true)
    },
	getFirstlevel(dir, arrayOfFiles){
		return getCommandsFiles(dir, arrayOfFiles, false)
	}
}

const getCommandsFiles = (dir, arrayOfFiles, recursive) => {
	let files = fs.readdirSync(dir)
	arrayOfFiles = arrayOfFiles || []

	files.forEach(file => {
		if(fs.statSync(dir + "/" + file).isDirectory()){
			if(recursive) arrayOfFiles = getCommandsFiles(path.join(dir, "/", file), arrayOfFiles, true)
		}else{
			if(file.endsWith('.js')){
				arrayOfFiles.push(path.join(dir, "/", file))
			}
		}
	})

	return arrayOfFiles
}
