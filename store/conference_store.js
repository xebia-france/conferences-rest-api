var redis = require('redis');

var redisClient = redis.createClient();

module.exports = {
    availableConferences: [
        {
            id: 23,
            backgroundUrl: "http://frenchkit.fr/wp-content/uploads/2016/04/frenchkit-background-conference-ios.jpg",
            logoUrl: "https://s3-eu-west-1.amazonaws.com/confcompanion.xebia.fr/FrenchKit/logo.png",
            logoHasTransparentBackground: true,
            iconUrl: "",
            from: "2016-09-23",
            to: "2016-09-24",
            name: "FrenchKit",
            description: "FrenchKit",
            location: "Pan Piper",
            shouldFetch: false,
            baseUrl: "-",
            timezone: "Europe/Paris",
            enabled: true
        },
        {
            id: 22,
            backgroundUrl: "https://s3.amazonaws.com/civetta-works/works/xebia/conf-companion/la-product-conf-2016/banner.jpg",
            logoUrl: "https://s3.amazonaws.com/civetta-works/works/xebia/conf-companion/la-product-conf-2016/logo.png",
            iconUrl: "",
            from: "2016-06-21",
            to: "2016-06-21",
            name: "La Product Conf",
            description: "La Product Conf",
            location: "CAP 15",
            shouldFetch: false,
            baseUrl: "-",
            timezone: "Europe/Paris",
            enabled: true
        },
        {
            id: 21,
            backgroundUrl: "http://devoxx.fr/assets/photos/2015/grande_salle2.jpg",
            logoUrl: "https://s3.amazonaws.com/civetta-works/works/xebia/conf-companion/devoxx-france-2016/devoxxFranceLogo.png",
            iconUrl: "",
            from: "2016-04-20",
            name: "Devoxx France 2016",
            description: "Devoxx France 2016",
            location: "Sihlcity Cinema",
            shouldFetch: true,
            baseUrl: "https://cfp.devoxx.fr/api/conferences/Devoxx2016",
            timezone: "Europe/Paris",
            enabled: true,
            to: "2016-04-22"
        },
        {
            id: 20,
            backgroundUrl: "https://voxxeddays.com/ticino16/wp-content/uploads/sites/14/2015/11/lago.jpg",
            logoUrl: "https://s3.amazonaws.com/civetta-works/works/xebia/conf-companion/doxxed-days-zurich-2016/iTunesArtwork.png",
            iconUrl: "",
            from: "2016-04-30",
            name: "Voxxed Days Ticino",
            description: "Voxxed Days Ticino",
            location: "Palazzo dei Congressi, Lugano",
            shouldFetch: true,
            baseUrl: "https://cfp-vdt.exteso.com/api/conferences/VDT16",
            timezone: "Europe/Zurich",
            enabled: false,
            to: "2016-04-30"
        },
        {
            id: 19,
            backgroundUrl: "https://voxxeddays.com/zurich16/wp-content/uploads/sites/10/2015/10/zurich_by_night.jpg",
            logoUrl: "https://s3.amazonaws.com/civetta-works/works/xebia/conf-companion/doxxed-days-zurich-2016/iTunesArtwork.png",
            iconUrl: "http://blog.xebia.fr/images/devoxxuk-2015-icon.png",
            from: "2016-03-03",
            name: "Voxxed Days Zürich",
            description: "Voxxed Days Zürich",
            location: "Sihlcity Cinema",
            shouldFetch: true,
            baseUrl: "https://cfp-vdz.exteso.com/api/conferences/VDZ16",
            timezone: "Europe/Zurich",
            enabled: false,
            to: "2016-03-03"
        },
        {
            id: 18,
            backgroundUrl: "http://devoxxbelgium.s3-eu-west-1.amazonaws.com/wp-content/uploads/2015/06/08154520/Devoxx2015Thema.jpg",
            logoUrl: "http://devoxxbelgium.s3-eu-west-1.amazonaws.com/wp-content/uploads/2015/09/24131549/Logo_Devoxx_square.png",
            iconUrl: "http://blog.xebia.fr/images/devoxxuk-2015-icon.png",
            from: "2015-11-09",
            name: "Devoxx 2015",
            description: "Devoxx 2015",
            location: "Kinepolis @ Antwerp, Belgium",
            shouldFetch: true,
            baseUrl: "http://cfp.devoxx.be/api/conferences/Devoxx2015",
            timezone: "Europe/Paris",
            enabled: false,
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
            shouldFetch: true,
            baseUrl: "http://cfp.devoxx.pl/api/conferences/DevoxxPL2015",
            timezone: "Europe/Paris",
            enabled: false,
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
            shouldFetch: true,
            baseUrl: "http://cfp.devoxx.co.uk/api/conferences/DevoxxUK2015",
            timezone: "Europe/London",
            enabled: false,
            to: "2015-06-19"
        }
    ],

    saveConference: function (conferenceId, speakers, schedule, tracks) {
        redisClient.set('speakers_' + conferenceId, JSON.stringify(speakers), redis.print);
        redisClient.set('schedule_' + conferenceId, JSON.stringify(schedule), redis.print);
        redisClient.set('tracks_' + conferenceId, JSON.stringify(tracks), redis.print);
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
    },

    getTracks: function (conferenceId, callback) {
        redisClient.get('tracks_' + conferenceId, function (err, reply) {
            callback(JSON.parse(reply));
        });
    }
};
