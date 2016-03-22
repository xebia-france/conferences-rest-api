var rp = require('request-promise');
var join = require('bluebird').join;
var _ = require('lodash');
var moment = require('moment-timezone');
var conferenceStore = require('../store/conference_store')

module.exports = {
    fetch: function (conference) {
        var speakersRequest = {
            url: conference.baseUrl + '/speakers',
            headers: {
                'User-Agent': 'conferences-fetcher'
            }
        };
        var mondayScheduleRequest = {
            url: conference.baseUrl + '/schedules/monday',
            headers: {
                'User-Agent': 'conferences-fetcher'
            }
        };
        var tuesdayScheduleRequest = {
            url: conference.baseUrl + '/schedules/tuesday',
            headers: {
                'User-Agent': 'conferences-fetcher'
            }
        };
        var wednesdayScheduleRequest = {
            url: conference.baseUrl + '/schedules/wednesday',
            headers: {
                'User-Agent': 'conferences-fetcher'
            }
        };
        var thursdayScheduleRequest = {
            url: conference.baseUrl + '/schedules/thursday',
            headers: {
                'User-Agent': 'conferences-fetcher'
            }
        };
        var fridayScheduleRequest = {
            url: conference.baseUrl + '/schedules/friday',
            headers: {
                'User-Agent': 'conferences-fetcher'
            }
        };
        var saturdayScheduleRequest = {
            url: conference.baseUrl + '/schedules/saturday',
            headers: {
                'User-Agent': 'conferences-fetcher'
            }
        };

        var speakersPromises = rp(speakersRequest).then(JSON.parse).map(
            function (remoteSpeaker) {
                return rp({
                    url: remoteSpeaker.links[0].href,
                    headers: {
                        'User-Agent': 'request'
                    }
                });
            }
        ).map(
            function (response) {
                return toSpeakerDetails(JSON.parse(response));
            }
        );

        function toSpeakerDetails(remoteSpeakersDetails) {
            return {
                id: remoteSpeakersDetails.uuid,
                conferenceId: conference.id,
                lang: remoteSpeakersDetails.lang,
                blog: remoteSpeakersDetails.blog,
                talks: toTalks(remoteSpeakersDetails.acceptedTalks),
                tweetHandle: remoteSpeakersDetails.twitter,
                imageURL: remoteSpeakersDetails.avatarURL,
                company: remoteSpeakersDetails.company,
                bio: remoteSpeakersDetails.bioAsHtml,
                lastName: remoteSpeakersDetails.lastName,
                firstName: remoteSpeakersDetails.firstName
            };
        }

        function toTalks(acceptedTalks) {
            _.map(acceptedTalks, function (acceptedTalk) {
                return {
                    presentationId: acceptedTalk.id,
                    presentationUri: acceptedTalk.links[0].href,
                    track: acceptedTalk.track,
                    event: acceptedTalk.talkType,
                    title: acceptedTalk.title
                }
            })
        }

        var slotPromises = function (request) {
            return rp(request).then(JSON.parse);
        };

        function toSlotDetails(remoteSlotDetails) {
            var talk = remoteSlotDetails.talk;
            if (!talk && !remoteSlotDetails.break) {
                return null;
            }
            return {
                conferenceId: conference.id,
                fromTime: moment(remoteSlotDetails.fromTimeMillis).tz(conference.timezone).format("YYYY-MM-DD HH:mm"),
                toTime: moment(remoteSlotDetails.toTimeMillis).tz(conference.timezone).format("YYYY-MM-DD HH:mm"),
                id: !talk ? remoteSlotDetails.slotId : talk.id,
                speakers: toSlotSpeakers(remoteSlotDetails),
                partnerSlot: false,
                note: "",
                summary: !talk ? "" : talk.summaryAsHtml,
                room: remoteSlotDetails.roomName,
                track: !talk ? "" : talk.track,
                kind: !remoteSlotDetails.break ? "Talk" : "Break",
                type: !talk ? remoteSlotDetails.break.id : talk.talkType,
                code: !talk ? remoteSlotDetails.slotId : talk.id,
                title: !talk ? remoteSlotDetails.break.nameFR : talk.title
            };
        }

        function toSlotSpeakers(remoteSlotDetails) {
            if (!remoteSlotDetails.talk) {
                return [];
            }
            return _.map(remoteSlotDetails.talk.speakers, function (remoteSlotSpeaker) {
                return {
                    id: remoteSlotSpeaker.link.href.substr(remoteSlotSpeaker.link.href.lastIndexOf('/') + 1),
                    uri: "",
                    name: remoteSlotSpeaker.name
                }
            })
        }

        function filterNull(data) {
            return data != null;
        }

        function buildTracks(schedule) {
            return _.uniq(schedule, "track")
            .filter(function(el) { 
                return el.track != "" 
            })
            .map(function(el) { 
                return { 
                    id: el.id, 
                    name: el.track, 
                    description: "", 
                    conferenceId: el.conferenceId, 
                    descriptionPlainText: "" 
                } 
            })
        }

        function buildSpeakerTracks(speakers, schedule) {
            return _.map(speakers, function(speak) {
                var talks = _.filter(schedule, function(sched) { 
                    return _.any(sched.speakers, {'id': speak.id});
                })
                .map(function(talk) {
                    return {
                        id: talk.id,
                        title: talk.title
                    };
                });
                speak.talks = talks;
                return speak;
            })
        }

        join(
            speakersPromises,
            slotPromises(mondayScheduleRequest),
            slotPromises(tuesdayScheduleRequest),
            slotPromises(wednesdayScheduleRequest),
            slotPromises(thursdayScheduleRequest),
            slotPromises(fridayScheduleRequest),
            slotPromises(fridayScheduleRequest)
        ).
            then(function (responses) {                
                var schedule = [];
                schedule = schedule.concat(_.map(responses[1].slots, toSlotDetails).filter(filterNull));
                schedule = schedule.concat(_.map(responses[2].slots, toSlotDetails).filter(filterNull));
                schedule = schedule.concat(_.map(responses[3].slots, toSlotDetails).filter(filterNull));
                schedule = schedule.concat(_.map(responses[4].slots, toSlotDetails).filter(filterNull));
                schedule = schedule.concat(_.map(responses[5].slots, toSlotDetails).filter(filterNull));
                schedule = schedule.concat(_.map(responses[6].slots, toSlotDetails).filter(filterNull));

                var tracks = buildTracks(schedule);
                var speakers = buildSpeakerTracks(responses[0], schedule);

                conferenceStore.saveConference(conference.id, speakers, schedule, tracks);
                console.log('Data saved for ' + conference.name);
            });
    }
};
