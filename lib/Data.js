var Q = require('q');
var mmm = require('mmmagic');
var Magic = mmm.Magic;
var shortId = require('shortid');
var dateFormat = require('dateformat');
var fs = require('fs');
var Sequelize = require('sequelize');
var path = require('path');
var rmdir = require('rimraf');

module.exports = function(db, fsConfig, configDateFormat){
    // initialised closure variable
    var sequelize = new Sequelize(db.database, db.user, db.pass, db.opt);
    var Schema = sequelize.import(__dirname + '/schema.js');

    var User = Schema.User;
    var Dataset = Schema.Dataset;
    var DataCategory = Schema.DataCategory;
    var DataType = Schema.DataType;
    var DataFile = Schema.DataFile;

    function getDatasets(where, n, offset) {
        where = where || {};
        n = n || 10;
        offset = offset || 0;
        
        var deferred = Q.defer();
        Dataset.findAll({ include:[ User, DataCategory, DataType, DataFile ], limit:n, offset:offset, where:where, order: 'updatedAt DESC' })
        .success(function(datasets) {
            datasets.forEach(function(dataset) {
                dataset.formatedUpdatedAt = dateFormat(dataset.updatedAt, configDateFormat);
                dataset.formatedCreatedAt = dateFormat(dataset.createdAt, configDateFormat);
                
                dataset.dataFiles.forEach(function(dataFile) {
                    dataFile.extension = path.extname(dataFile.filepath).substr(1);
                });
            });
            deferred.resolve(datasets);
        })
        .failure(function(err) {
            deferred.reject(new Error(err));
        });
        return deferred.promise;
    }

    function textSearchDatasets(search, n, offset) {
        search = search || '';
        var where = 'MATCH (`Datasets`.`name`, `Datasets`.`description`) AGAINST ("' + search + '" IN BOOLEAN MODE)';
        return getDatasets(where, n, offset);
    }

    function wrapDeferred(notDeferred){
        var deferred = Q.defer();
        notDeferred.success(function(d){
            deferred.resolve(d);
        }).failure(function(err){
            deferred.reject(new Error(err));
        });
        return deferred.promise;
    }


    function checkMimeType(file) {
        var deferred = Q.defer();
        var magic = new Magic(mmm.MAGIC_MIME_TYPE);
        magic.detectFile(file, function(err, mime) {
            if (err) {
                deferred.reject(new Error(err));
            }

            if (fsConfig.mimeAllowed.indexOf(mime) != -1) {
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }
        });
        return deferred.promise;
    }

    function generateShortId() {
        var deferred = Q.defer();
        var shortid = shortId.generate();
        Dataset.find({ where:{ shortId:shortid } })
        .success(function(dataset) {
            if (dataset == null) {
                deferred.resolve(shortid);
            } else {
                generateShortId()
                .then(function(shortId) {
                    deferred.resolve(shortid);
                })
                .done();
            }
        });
        return deferred.promise;
    }

    function deleteFileRecord(dataId){
        var d = Q.defer();
        DataFile.findAll({
            where: { "DatasetId": dataId }
        }).success(function(files){
            var tasks = [];
            files.forEach(function(f){
                tasks.push(wrapDeferred(f.destroy()));
            });
            if(!tasks.length){
                d.resolve();
            } else {
                Q.all(tasks).then(d.resolve, d.reject);
            }
        }).failure(d.reject);
        return d.promise;
    }

    function tryUploadingFile(file, shortid, dataset) {
        var d = Q.defer();
        if(!file || !file.size){
            d.resolve();
        } else {
            checkMimeType(file.path).then(function(check){
                if (!check) {
                    d.reject({
                        fileTypeReject: true
                    });
                    return;
                }
                var path = fsConfig.dir + shortid + '/';
                var rmdefer = Q.defer();
                rmdir(path, function(err){
                    if(err){
                        rmdefer.reject(err);
                    } else {
                        rmdefer.resolve();
                    }
                });
                Q.all([rmdefer, deleteFileRecord(dataset.id)]).then(function(){
                    console.log("deleted");
                    var data = fs.readFileSync(file.path);

                    // TODO: use rename instead of copying for better performance

                    fs.mkdirSync(path);
                    fs.writeFileSync(path + file.name, data);
                    
                    DataFile.create({ filepath: shortid + '/' + file.name })
                    .success(d.resolve).failure(d.reject);
                }, d.reject);
            }, d.reject);
        }
        return d.promise;
    }

    // here's what you get
    return {
        checkMimeType: checkMimeType,
        User: User,
        performSearch: function(query, offset){
            var d = Q.defer();
            Q.all([textSearchDatasets(query, 10, offset), wrapDeferred(Dataset.count()), wrapDeferred(DataCategory.findAll()), wrapDeferred(DataType.findAll())])
            .spread(function(datasets, datasetCount, categories, types) {
                var pages = Math.ceil(datasetCount / 10);
                d.resolve({
                    q: query,
                    pages: pages,
                    datasets: datasets,
                    categories: categories,
                    types: types
                });
            }).fail(d.reject);
            return d.promise;
        },

        getDataWithId: function(id){
            var d = Q.defer();
            Dataset.find(id).success(function(data){
                d.resolve(data);
            }).failure(function(){
                d.reject();
            });
            return d.promise;
        },

        getDisplayDataWithId: function(id){
            return getDatasets({id: id}, 1, 0).then(function(data){
                return data[0];
            });
        },

        getDatasets: function(where, offset){
            var d = Q.defer();
            Q.all([getDatasets(where, 10, offset), wrapDeferred(Dataset.count()), wrapDeferred(DataCategory.findAll()), wrapDeferred(DataType.findAll())])
            .spread(function(datasets, datasetCount, categories, types) {
                var pages = Math.ceil(datasetCount / 10);
                d.resolve({
                    pages: pages,
                    datasets: datasets,
                    categories: categories,
                    types: types
                });
            }).fail(d.reject);
            return d.promise;
        },

        getUserDatasets: function(nusId){
            return getDatasets({"Users.nusId": nusId}, 999999, 0).then(function(datasets){
                return {
                    datasets: datasets,
                    page: 0
                };
            });
        },

        getAllMetaData: function(){
            var d = Q.defer();
            Q.all([wrapDeferred(DataCategory.findAll()), wrapDeferred(DataType.findAll())])
                .spread(function(categories, types) {
                    d.resolve({ categories:categories, types:types });
                }).fail(d.reject);
            return d.promise;
        },

        deleteDataset: function(id, userId){
            var d = Q.defer();
            Dataset.find(id).success(function(dataset){
                if(dataset.UserId !== userId){
                    d.reject({
                        notAuthorized: true
                    });
                } else {
                    var path = fsConfig.dir + dataset.shortId + '/';
                    var rmdefer = Q.defer();
                    rmdir(path, function(err){
                        if(err){
                            rmdefer.reject(err);
                        } else {
                            rmdefer.resolve();
                        }
                    });
                    Q.all([rmdefer, deleteFileRecord(dataset.id)]).then(function(){
                        console.log("deleted");
                        dataset.destroy().success(d.resolve).failure(d.reject);
                    }, d.reject);
                }
            });
            return d.promise;
        },

        updateDataset: function(newDataset){
            var d = Q.defer();
            Q.all([wrapDeferred(Dataset.find(newDataset.id)), wrapDeferred(User.find(newDataset.userId)), wrapDeferred(DataCategory.find(newDataset.categoryId)), wrapDeferred(DataType.find(newDataset.typeId))])
            .spread(function(dataset, user, category, type) {
                if(!dataset || !user || !category || !type){
                    d.reject({
                        malFormedData: true
                    });
                } else if(dataset.UserId !== newDataset.userId) {
                    d.reject({
                        notAuthorized: true
                    });
                } else {
                    tryUploadingFile(newDataset.file, dataset.shortId, dataset).then(function(datafile){
                        dataset.name = newDataset.name;
                        dataset.description = newDataset.description;
                        if(datafile) dataset.setDataFiles([datafile]);
                        dataset.setDataCategory(category);
                        dataset.setDataType(type);
                        dataset.save().success(function(){
                            d.resolve(dataset);
                        }).failure(d.reject);
                    }, d.reject);
                }
            }).fail(d.reject);
            return d.promise;
        },

        uploadDataset: function(file, userId, categoryId, typeId, name, description){
            var d = Q.defer();
            Q.all([checkMimeType(file.path), generateShortId(), wrapDeferred(User.find(userId)), wrapDeferred(DataCategory.find(categoryId)), wrapDeferred(DataType.find(typeId))])
            .spread(function(check, shortid, user, category, type) {
                if (!check) {
                    d.reject({
                        fileTypeReject: true
                    });
                    return;
                }
                
                var path = fsConfig.dir + shortid + '/';
                var data = fs.readFileSync(file.path);

                fs.mkdirSync(path);
                fs.writeFileSync(path + file.name, data);
                
                DataFile.create({ filepath: shortid + '/' + file.name })
                .success(function(datafile){
                    var dataset = Dataset.create({
                        shortId: shortid,
                        name: name,
                        description: description
                    }).success(function(dataset) {
                        dataset.setDataCategory(category);
                        dataset.setDataType(type);
                        dataset.setDataFiles([datafile]);
                        dataset.setUser(user);
                
                        dataset.save()
                        .success(function() {
                            d.resolve(dataset);
                        }).failure(function(err) {
                            d.reject({
                                dbError: true
                            });
                        });
                    });
                }).failure(function(){
                    d.reject();
                });
            });
            return d.promise;
        }
    };
};