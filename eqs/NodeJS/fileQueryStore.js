const path = require("path");
const fs = require('fs');

class FileQueryStore {

    constructor(baseDir) {
        this._baseDir = baseDir;
    }

    all (modelId) {
        const dirPath = this._getQueryFolderPath(modelId);
        if (!fs.existsSync(dirPath)) {
            return Promise.resolve([]);
        }

        return fs.promises.readdir(dirPath, { withFileTypes: true })
            .then(dirs => dirs
                .filter(dir => dir.isFile())
                .map(async dir =>  {
                    const queryJson = await fs.promises.readFile(path.join(dirPath, dir.name));
                    const query = JSON.parse(queryJson);
                    return { id: query.id, name: query.name, description: query.description };
                }))
            .then(promises => Promise.all(promises))
    }

    get (modelId, queryId) {
        const queryFilePath = this._getQueryFilePath(modelId, queryId);          
        return fs.promises.readFile(queryFilePath)
            .then(content => JSON.parse(content));
    }

    add (modelId, queryId, query) {

        if (typeof(query) !== "string") {
            query = JSON.stringify(query);
        }

        const filePath = this._getQueryFilePath(modelId, queryId);
        if (fs.existsSync(filePath)) {
            new Error("File is already exists");
        }

        return fs.promises.writeFile(filePath, query);
    }

    update (modelId, queryId, query) {

        if (typeof(query) !== "string") {
            query = JSON.stringify(query);
        }

        const filePath = this._getQueryFilePath(modelId, queryId);
        return fs.promises.writeFile(filePath, query);
    }

    remove (modelId, queryId) {
        const filePath = path.join(this._getQueryFolderPath(modelId), queryId + ".json");
        return fs.promises.unlink(filePath);
    }

    _getModelFolderPath(modelId) {
        const dirName = "dm-" + modelId;
        return path.join(this._baseDir, dirName);
    }

    _getQueryFolderPath(modelId) {
        const modelFolderPath = this._getModelFolderPath(modelId);
        return path.join(modelFolderPath, "queries");
    }

    _getQueryFilePath(modelId, queryId) {
        const queriesPath = this._getQueryFolderPath(modelId);
        if (!fs.existsSync(queriesPath)){
            fs.mkdirSync(queriesPath, { recursive: true });
        }
        return path.join(queriesPath, queryId + ".json");
    }
}

module.exports = FileQueryStore;