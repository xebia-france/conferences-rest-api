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
                id: remoteSlotDetails.slotId,
                speakers: toSlotSpeakers(remoteSlotDetails),
                partnerSlot: false,
                note: "",
                summary: !talk ? null : talk.summaryAsHtml,
                room: remoteSlotDetails.roomName,
                track: !talk ? null : talk.track,
                kind: !remoteSlotDetails.break ? "Talk" : "Break",
                type: !talk ? remoteSlotDetails.break.id : talk.talkType,
                code: remoteSlotDetails.slotId,
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

        join(
            speakersPromises,
            slotPromises(mondayScheduleRequest),
            slotPromises(tuesdayScheduleRequest),
            slotPromises(wednesdayScheduleRequest),
            slotPromises(thursdayScheduleRequest),
            slotPromises(fridayScheduleRequest)
        ).
            then(function (responses) {
                var speakers = responses[0];
                var schedule = [];
                schedule = schedule.concat(_.map(responses[1].slots, toSlotDetails).filter(filterNull));
                schedule = schedule.concat(_.map(responses[2].slots, toSlotDetails).filter(filterNull));
                schedule = schedule.concat(_.map(responses[3].slots, toSlotDetails).filter(filterNull));
                schedule = schedule.concat(_.map(responses[4].slots, toSlotDetails).filter(filterNull));
                schedule = schedule.concat(_.map(responses[5].slots, toSlotDetails).filter(filterNull));

                conferenceStore.saveConference(conference.id, speakers, schedule);
                console.log('Data saved for ' + conference.name);
            });
    }
};
