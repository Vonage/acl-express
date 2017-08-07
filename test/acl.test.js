const chai = require('chai');
const sinon = require('sinon');

let expect = chai.expect;

describe('Test ACL', function() {
	it('Should succeed', function(done) {
		// sinon.stub(redis, 'hmget').returns('');
		done();
	});

	it('Should fail', function(done) {
		expect([]).to.be.an('array');
		done();
	});
});
