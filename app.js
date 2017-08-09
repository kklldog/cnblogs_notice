var schedule = require('node-schedule');
var cnblogs =require('./cnblogs');

var filter = function(){
    cnblogs.filter(1,10);
}

var initSchedule = function () {
    schedule.scheduleJob({ hour:10, minute: 01 }, filter);
    console.log('schedule inited .');
}

initSchedule();
filter();