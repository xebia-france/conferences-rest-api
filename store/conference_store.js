var redis = require('redis');

module.exports = {
    availableConferences: [
        {
            id: 16,
            backgroundUrl: "http://blog.xebia.fr/images/devoxxuk-2015-background.png",
            logoUrl: "http://blog.xebia.fr/images/devoxxuk-2015-logo.png",
            iconUrl: "http://blog.xebia.fr/images/devoxxuk-2015-icon.png",
            from: "2015-06-17",
            name: "DevoxxUK 2015",
            description: "DevoxxUK 2015",
            location: "London - Business Design Centre",
            baseUrl: "http://cfp.devoxx.co.uk/api/conferences/DevoxxUK2015",
            timezone: "Europe/London",
            enabled: true,
            to: "2015-06-19"
        }
    ],

    saveConference: function (conferenceId, speakers, schedule) {
        var redisClient = redis.createClient();
        redisClient.on("error", function (err) {
            console.log("Error " + err);
        });
        redisClient.set('speakers_' + conferenceId, JSON.stringify(speakers), redis.print);
        redisClient.set('schedule_' + conferenceId, JSON.stringify(schedule), redis.print);
        redisClient.end();
    },

    getSpeakers: function (conferenceId, callback) {
        var redisClient = redis.createClient();
        redisClient.on("error", function (err) {
            console.log("Error " + err);
        });
        redisClient.get('speakers_' + conferenceId, function (err, reply) {
            callback(JSON.parse(reply));
            redisClient.end();
        });
    },

    getSchedule: function (conferenceId, callback) {
        var redisClient = redis.createClient();
        redisClient.on("error", function (err) {
            console.log("Error " + err);
        });
        redisClient.get('schedule_' + conferenceId, function (err, reply) {
            callback(JSON.parse(reply));
            redisClient.end();
        });
    }
};