const fs = require('fs');

importSongsArray = folderPath => {
    fs.readdirSync(folderPath).forEach(file => {
        let jsonSongs= {
            list: []
        }

        jsonSongs.list.push()


        return true
    });
}

importSongsList = folderPath => {
    fs.readdirSync(folderPath).forEach(file => {
        // this.state.list.push(file)
        return true
    });
}

export {importSongsArray, importSongsList};

