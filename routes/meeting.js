var express = require('express');
var router = express.Router();
var Meeting = require('../models/meeting');
var moment = require('moment');
var sendgrid  = require('sendgrid')('username', 'password');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

module.exports = function(){

	/* GET all meetings. */
	router.get('/', isAuthenticated, function(req, res) {
    	// Display the Meetings page with any flash message, if any
        Meeting.find({}, function(err, meetings) {
            if (err) throw err;

            res.render('getmeetings', { meetings: meetings});
        });
	});

    /* GET new meeting. */
	router.get('/new', isAuthenticated, function(req, res) {
    	// Display the new Meeting page with any flash message, if any
        var today = moment().format('YYYY-MM-DD');
		res.render('newmeeting', { message: req.flash('message'), minDate: today });
	});

	/* Handle Meeting POST */
	router.post('/create',  function(req, res) {
        // create the meeting
        var newMeeting = new Meeting();

        // set the meetings's data
        newMeeting.name = req.param('name');
        newMeeting.objective = req.param('objective');
        newMeeting.startTime = req.param('startTime');
        newMeeting.endTime = req.param('endTime');
        newMeeting.participant = req.param('participant');
        console.log(newMeeting.startTime);
        // save the meeting
        newMeeting.save(function(err) {
            if (err){
                console.log('Error in Saving meeting: '+err);
                throw err;
            }
            console.log('Meeting has been saved');
            //sendging email to participant
            var payload   = {
                to      : newMeeting.participant,
                from    : 'sebi@nodeslices.com',
                subject : 'Meeting Invitation',
                text    : 'You have been invited to the '+newMeeting.name+' meeting.'
            }
            sendgrid.send(payload, function(err, json) {
                if (err) { console.error(err); }
                console.log(json);
            });
            res.redirect('/meetings/'+newMeeting._id);
        });
	});

    /*GET a Meeting's page*/
    router.get('/:id', isAuthenticated, function(req, res){
        console.log(req.params);
        Meeting.findById(req.params.id, function (error, data) {
            if(error){
                console.log(error);
            } else {
                res.render('showmeeting', { meeting: data });
            }
        });
    });

	return router;
}
