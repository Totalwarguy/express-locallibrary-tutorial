const {
	body,
	validationResult
} = require('express-validator/check');
const {
	sanitizeBody
} = require('express-validator/filter');

const status_list = [
	{code: "Available", description: "Available"},
	{code: "Loaned", description: "Loaned"},
	{code: "Reserved", description: "Reserved"},
	{code: "Maintenance", description: "Maintenance"}
];

var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');

var mongoose = require('mongoose');
var async = require('async');

var notfounderr = new Error('Book instance not found!');
notfounderr.status = 404;

// Display list of all BookInstances
exports.bookinstance_list = function(req, res, next) {
    
	BookInstance.find()
	  .populate('book')
	  .sort('{imprint: asc, status: asc}')
	  .exec(function(err, list_bookinstances) {
	  	if (err) { return next(err); }

	  	//console.log(list_bookinstances);

	  	res.render('bookinstance_list', {title: 'Book Instance List', bookinstance_list: list_bookinstances});
	  });


};

// Display detail page for a specific BookInstance
exports.bookinstance_detail = function(req, res, next) {
    
	

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
		async.parallel({
			bookinstance: function(callback) {
				BookInstance.findById(req.params.id)
				  .populate('book')
				  .exec(callback);
			},
			book: function(callback) {
				Book.find()
				  .populate()
				  .exec(callback)
			}
		}
		, function (err, results) {
			if (err) { return next(err); }

			if (results.bookinstance == null) {
				next(this.notfounderr);
			}
			
			res.render('bookinstance_detail', {title: 'Book Instance', bookinstance: results.bookinstance, status_list: status_list});

		}); 

    } else {
    	next(this.notfounderr);
    }
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = function(req, res, next) {
    Book.find({}, 'title')
    .exec(function(err, books) {
    	if (err) { return next(err); }

    	res.render('bookinstance_form', {title: 'Create Book Instance', book_list:books, status_list: status_list});

    });
};

// Handle BookInstance create on POST
exports.bookinstance_create_post = [
	body('book','Book must be specified').isLength({min: 1}).trim(),
	body('imprint', 'Imprint must be specified').isLength({min: 4}).trim(),
	//body('due_back','Invalid date').optional({checkFalsey: true}).isISO8601(),
	sanitizeBody('book').trim().escape(),
	sanitizeBody('imprint').trim().escape(),
	sanitizeBody('status').trim('status').escape(),
	sanitizeBody('due_back').toDate(),

	(req, res, next) => {
		const errors = validationResult(req);

		var bookinstance = new BookInstance({
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			due_back: req.body.due_back
		});

		if (!errors.isEmpty()) {
			Book.find({},'title')
			.exec(function(err, books) {
				if (err) { return next(err); }
				res.render('bookinstance_form', {title: 'Book Instance Create', errors: errors.array(), book_list: books, selected_book: bookinstance.book._id, bookinstance: bookinstance, status_list: status_list, selected_status: bookinstance.status});
			});
			return;
		} else {
			bookinstance.save(function (err) {
				if (err) { return next(err); }

				res.redirect(bookinstance.url);
			});
		}
	}

]

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET
exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST
exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};