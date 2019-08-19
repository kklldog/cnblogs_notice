
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var MongoClient = require('mongodb').MongoClient;

var db;

var init = function () {
    MongoClient.connect("mongodb://mongodb:27017/pingcheji", (err, database) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('connect to db success');
        db = database;
    });
}

var insert = function (collName, data, callback) {
    var coll = db.collection(collName);
    coll.insert(data, (err, r) => {
        if (!err) {
            console.log('save to ' + collName + ' success !');
            if (callback) {
                callback(r);
            }
        }
        else {
            console.error(err);
        }

    });
};

var queryPage = function (collName, filter, skip, limit, callback) {
    var coll = db.collection(collName);
    coll.find(filter).sort({ videoId: 1 }).skip(skip).limit(limit).toArray((err, r) => {
        if (!err) {
            callback(r);
        }
        else {
            console.error(err);
            callback([]);
        }
    });
}

var remove = function (collName, filter, callback) {
    var coll = db.collection(collName);
    coll.remove(filter, ((err, r) => {
        if (!err) {
            console.log('remove to ' + collName + ' success !');
            if (callback) {
                callback(r);
            }
        }
        else {
            console.error(err);
        }

    }));
}

var find = function (collName, filter, callback) {
    var coll = db.collection(collName);
    coll.find(filter).toArray((err, r) => {
        if (!err) {
            callback(r);
        }
        else {
            console.error(err);
            callback([]);
        }
    })
}

var update = function (collName, filter, updateObj, callback, errCallback) {
    var coll = db.collection(collName);
    coll.update(filter, { $set: updateObj }, (err, r) => {
        if (!err) {
            console.log('update to ' + collName + ' success !');
            if (callback) {
                callback(r);
            }
        }
        else {
            console.error(err);
            errCallback(err);
        }
    });
}

exports.insert = insert;
exports.queryPage = queryPage;
exports.remove = remove;
exports.find = find;
exports.update = update;

exports.init = init;