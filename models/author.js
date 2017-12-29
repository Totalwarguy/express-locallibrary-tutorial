var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

// Virtual for author's full name
AuthorSchema
.virtual('name')
.get(function () {
  return this.family_name + ', ' + this.first_name;
});

// Virtual for author's URL
AuthorSchema
.virtual('url')
.get(function () {
  return '/catalog/author/' + this._id;
});

AuthorSchema
.virtual('lifespan')
.get(function () {
	var xlifespan = this.date_of_birth ? '(b.' + moment(this.date_of_birth).format('YYYY-MM-DD') : '';
	if (xlifespan != '' && this.date_of_death) {
		xlifespan += ' - d.' + moment(this.date_of_death).format('YYYY-MM-DD');
	}
	if (xlifespan) {
		xlifespan += ')';
	}
	return xlifespan;
});

AuthorSchema
.virtual('naturalname')
.get(function () {
	return this.first_name + ' ' + this.family_name;
});


//Export model
module.exports = mongoose.model('Author', AuthorSchema);