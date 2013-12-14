var crypto = require('crypto'),
    tmp = require("temporary"),
    fs = require("fs");

var logger = global.logger;

var ttl = 3600 * 1000; // 1 hour TODO: put into config?

var server = module.exports = {};

var Task = function(userid, name, size, ticket){
    this.userid = userid;
    this.name = name;
    this.size = size;
    this.ticket = ticket;
    this.ack = 0;

    this.file = new tmp.File();

    this.setExpire(ttl);

    logger.info("Chunk upload task created", this);
};

Task.prototype.getFile = function(userid){
    if(userid !== this.userid){
        return null;
    } else {
        return {
            name: this.name,
            path: this.file.path,
            size: this.file.size
        };
    }
};

Task.prototype.remove = function(){
    delete tasks[this.ticket];
    this.file.unlink();
};

Task.prototype.setExpire = function(ttl){
    clearTimeout(this.timer);
    this.timer = setTimeout(this.remove.bind(this), ttl);
};

Task.prototype.handleChunk = function(userid, seq, file, callback){
    logger.info("Chunk upload handle request", userid, seq, this);
    var self = this;
    if(userid !== this.userid){
        callback("Unauthorized.");
    } else {
        if(seq !== this.ack){
            callback(null, this.ack);
        } else {
            if(seq === 0){
                server.checkMimeType(file.path).then(function(allowed, mime){
                    if(allowed){
                        self.appendFile(file, function(err, bytes){
                            if(err){
                                callback(err);
                            } else {
                                self.ack += bytes;
                                callback(null, self.ack);
                            }
                        });
                    } else {
                        logger.info("File %s with name %s from userid %d to be rejected",
                                    file.path,
                                    self.name,
                                    userid);
                        callback("File type not allowed.");
                    }
                }, function(err){
                    logger.error(err);
                });
            } else {
                this.appendFile(file, function(err, bytes){
                    if(err){
                        callback(err);
                    } else {
                        this.ack += bytes;
                        callback(null, this.ack);
                    }
                }.bind(this));
            }
        }
    }
};

Task.prototype.appendFile = function(file, callback){
    logger.info("reading file %s for appending", file.path);
    this.setExpire(ttl);
    var self = this;
    // TODO: possible race condition may arise here
    //       if the subsequent file is smaller and read faster?
    fs.readFile(file.path, function(err, data){
        if(err){
            logger.error(err);
            return callback(err);
        } else {
            logger.info("appending file %s to %s", file.path, self.file.path);
            fs.appendFile(self.file.path, data, function(err){
                if(err){
                    return callback(err);
                } else {
                    return callback(null, data.length);
                }
            });
        }
    });
};

var tasks = {};

server.setupUpload = function(userid, name, size, callback){
    var ticket;
    for(var i = 0; i < 100; i++){
        ticket = crypto.createHash('md5')
                       .update(name + userid + size + Math.random())
                       .digest('hex');
        if(ticket in tasks) { ticket = null; }
        else { break; }
    }
    if(!ticket){
        callback("fail to generate a ticket, please notify the server admin.");
    } else {
        tasks[ticket] = new Task(userid, name, size, ticket);
        callback(null, ticket);
    }
};

server.receiveChunk = function(userid, ticket, seq, file, callback){
    if(!(ticket in tasks)){
        callback("Invalid ticket");
    } else {
        tasks[ticket].handleChunk(userid, seq, file, callback);
    }
};

server.getFile = function(userid, ticket){
    if(ticket in tasks){
        return tasks[ticket].getFile(userid);
    } else {
        return null;
    }
};