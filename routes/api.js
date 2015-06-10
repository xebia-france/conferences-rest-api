var express = require('express');
var router = express.Router();
var conferenceStore = require('../store/conference_store');


router.get('/api/v1/conferences', function (req, res) {
    res.json(conferenceStore.availableConferences);
});

router.get('/api/v1/conferences/:conferenceId/speakers', function (req, res) {
    conferenceStore.getSpeakers(req.param('conferenceId'), function (response) {
        res.json(response);
    });
});

router.get('/api/v1/conferences/:conferenceId/schedule', function (req, res) {
    conferenceStore.getSchedule(req.param('conferenceId'), function (response) {
        res.json(response);
    });
});


module.exports = router;
