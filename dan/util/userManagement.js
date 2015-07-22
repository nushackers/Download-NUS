var config = require("../config");
var db = config.db;
var Sequelize = require('sequelize');
var sequelize = new Sequelize(db.database, db.user, db.pass, db.opt);
var Schema = sequelize.import(__dirname + '/../lib/schema.js');
var User = Schema.User;

function getUserByNusId(nusId, callback) {
    User.findOrCreate({ nusId: nusId })
    .success(function(user, created){
        callback(user);
    }).failure(function(err){
        callback(user);
    });
}

// assume using only socket
var redisClient = require("redis").createClient(config.redis.unixSocket);
redisClient.select(config.redisStore.db);

function invalidateSession(nusIds) {
    redisClient.keys(config.redisStore.prefix + "*", function(err, keys) {
        if (err) {
            return console.error(err);
        }

        keys.forEach(function(k) {
            redisClient.get(k, function(err, val) {
                if (err) {
                    return console.log(err);
                }
                try {
                    if (nusIds.indexOf(JSON.parse(val).passport.user.nusId) != -1) {
                        redisClient.del(k);
                    }
                } catch(e) {
                    console.log(e);
                }
            });
        });
    })
}

var updatedIds = [];

module.exports = {
    ban: function(nusId) {
        updatedIds.push(nusId);
        getUserByNusId(nusId, function(user) {
            user.level = 0;
            user.save().success(function() {
                console.log(nusId, user.name, "banned");
            });
        })
    },

    unban: function(nusId) {
        updatedIds.push(nusId);
        getUserByNusId(nusId, function(user) {
            user.level = 1;
            user.save().success(function() {
                console.log(nusId, user.name, "unbanned");
            });
        })
    },

    makeSuper: function(nusId) {
        updatedIds.push(nusId);
        getUserByNusId(nusId, function(user) {
            user.level = 2;
            user.save().success(function() {
                console.log(nusId, user.name, "is now super");
            });
        })
    },

    invalidateSessions: function() {
        invalidateSession(updatedIds);
        updatedIds = [];
    }
};