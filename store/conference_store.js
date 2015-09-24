var redis = require('redis');

var redisClient = redis.createClient();

module.exports = {
    availableConferences: [
        {
            id: 18,
            backgroundUrl: "http://devoxxbelgium.s3-eu-west-1.amazonaws.com/wp-content/uploads/2015/06/08154520/Devoxx2015Thema.jpg",
            logoUrl: "http://devoxxbelgium.s3-eu-west-1.amazonaws.com/wp-content/uploads/2015/09/24094603/Logo_Devoxx_transparent.png",
            iconUrl: "http://blog.xebia.fr/images/devoxxuk-2015-icon.png",
            from: "2015-11-09",
            name: "Devoxx 2015",
            description: "Devoxx 2015",
            location: "Kinepolis @ Antwerp, Belgium",
            baseUrl: "http://cfp.devoxx.be/api/conferences/Devoxx2015",
            timezone: "Europe/Paris",
            enabled: true,
            to: "2015-11-13"
        },
        {
            id: 17,
            backgroundUrl: "http://blog.xebia.fr/images/devoxxuk-2015-background.png",
            logoUrl: "http://blog.xebia.fr/images/devoxxuk-2015-logo.png",
            iconUrl: "http://blog.xebia.fr/images/devoxxuk-2015-icon.png",
            from: "2015-06-22",
            name: "DevoxxPL 2015",
            description: "DevoxxPL 2015",
            location: "ICE Krakow Congress Centre",
            baseUrl: "http://cfp.devoxx.pl/api/conferences/DevoxxPL2015",
            timezone: "Europe/Paris",
            enabled: true,
            to: "2015-06-25"
        },
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
        redisClient.set('speakers_' + conferenceId, JSON.stringify(speakers), redis.print);
        redisClient.set('schedule_' + conferenceId, JSON.stringify(schedule), redis.print);
    },

    getSpeakers: function (conferenceId, callback) {
        redisClient.get('speakers_' + conferenceId, function (err, reply) {
            callback(JSON.parse(reply));
        });
    },

    getSchedule: function (conferenceId, callback) {
        redisClient.get('schedule_' + conferenceId, function (err, reply) {
            callback(JSON.parse(reply));
        });
    }
};
