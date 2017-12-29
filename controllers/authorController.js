const {
	body,
	validationResult
} = require('express-validator/check');
const {
	sanitizeBody
} = require('express-validator/filter');

var Author = require('../models/author');
var Book = require('../models/book');

var mongoose = require('mongoose');
var async = require('async');

var notfounderr = new Error('Author not found');
notfounderr.status = 404;

// Display list of all Authors
exports.author_list = function(req, res, next) {
    
	Author.find()
	  .sort([['family_name','asc']])
	  .exec(function (err, list_authors) {
	  	if (err) { return next(err); }


	  	res.render('author_list', {title: 'Author List', author_list: list_authors});
	  });

};

// Display detail page for a specific Author
exports.author_detail = function(req, res, next) {
    
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
	    async.parallel({
	    	"author" : function(callback) {
	    		Author.findById(req.params.id)
	    		  .exec(callback);
	    	},
	    	"authors_books" : function(callback) {
	    		Book.find({"author":req.params.id})
	    		  .sort({"title":"asc"})
	    		  .exec(callback);
	    	}
	    }
	    , function (err, results) {
	    	if (err) { return next(err); }

	    	if (results.author==null){
	    		next(this.notfounderr);
	    	}
	    	res.render('author_detail', {title: 'Author Detail', author: results.author, "authors_books": results.authors_books, deleteurl: '/catalog/author/' + results.author._id + '/delete'});
	    }); 

    } else {
		next(this.notfounderr);
    }

};

// Display Author create form on GET
exports.author_create_get = function(req, res, next) {
    res.render('author_form', { title: 'Create Author'});
};

// Handle Author create on POST
exports.author_create_post = [
	body('first_name')
	  .isLength({min: 1})
	  .trim()
	  .withMessage('First name must be at least 1 character long...')
	  .isAlphanumeric()
	  .withMessage('You can\'t have shit in your name'),
	body('family_name')
	  .isLength({min: 1})
	  .trim()
	  .withMessage('Last name must be at least 1 character long...')
	  .isAlphanumeric()
	  .withMessage('You can\'t have shit in your name'),
	body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

	sanitizeBody('first_name').trim().escape(),
	sanitizeBody('family_name').trim().escape(),
	sanitizeBody('date_of_birth').toDate(),
	sanitizeBody('date_of_death').toDate(),

	(req, res, next) => {

		const errors = validationResult(req);

		var author = new Author({
			first_name: req.body.first_name,
			family_name: req.body.family_name,
			date_of_birth: req.body.date_of_birth,
			date_of_death: req.body.date_of_death
		});	

		
		if (!errors.isEmpty()) {
			res.render('author_form', {title: 'Create Author', author: author, errors: errors.array()});
			return;
		} else {
			Author.findOne({
				first_name: req.body.first_name,
				family_name: req.body.family_name,
				date_of_birth: req.body.date_of_birth
			}).exec(function(err, found_author) {
				if (err) { return next(err); }
				
				if (found_author) { 
					res.redirect(found_author.url);
				} else {
					author.save(function(err) {
						if (err) { return next(err); }

						res.redirect(author.url);
					});
				}
			});		
		}

	}
];

// Display Author delete form on GET
exports.author_delete_get = function(req, res, next) {
    async.parallel({
    	author: function(callback) {
    		Author.findById(req.params.id)
    		.exec(callback);
    	},
    	authors_books: function(callback) {
    		Book.find({'author':req.params.id})
    		.exec(callback);
    	}

    }, function (err, results) {
    	if (err) { return next(err); }

    	if (results.author == null) {
    		res.redirect('/catalog/authors');
    	}

    	res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.authors_books});

    });
};

// Handle Author delete on POST
exports.author_delete_post = function(req, res, next) {
    async.parallel({
    	author: function(callback){
    		Author.findById(req.body.authorid)
    		.exec(callback);
    	},
    	authors_books: function(callback){
    		Book.find({'author': req.body.authorid })
    		.exec(callback);
    	}
    }, function(err, results) {
    	if (err) { return next(err); }

    	if (results.authors_books.length > 0) {
    		res.redner('author_delete', {title: 'Delete Author', author: results.author, author_books: results.authors_books});
    		return;

    	} else {
    		Author.findByIdAndRemove(req.body.authorid, function (err) {
    			if (err) { return next(err); }

    			res.redirect('/catalog/authors');

    		}) 
    	}

    });
};

// Display Author update form on GET
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};