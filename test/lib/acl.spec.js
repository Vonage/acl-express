const fs = require('fs');
const rewire = require('rewire');
const chai = require('chai');
const sinon = require('sinon');


const UnauthorizedError = require('../../lib/UnauthorizedError');

let expect = chai.expect;

describe('Test ACL', function() {
	describe('config', function() {
		it('Should read configuration successfully', function() {
			const path = 'test/resources/rules.json';
			const acl = rewire('../../lib/acl.js');
			acl.config({
				path
			});

			let file = fs.readFileSync(path, 'utf-8');
			let rules = JSON.parse(file);

			expect(acl.__get__('configs').rules).to.deep.equal(rules);
		});

		it('Should read configuration successfully and set a default role', function() {
			const acl = rewire('../../lib/acl.js');
			acl.config({
				path: 'test/resources/rules.json',
				defaultRole: 'test'
			});

			expect(acl.__get__('configs').defaultRole).to.equal('test');
		});

		it('Should fail - No config object', function() {
			const acl = require('../../lib/');
			expect(acl.config).to.throw(Error, 'Please supply a configuration object');
		});

		it('Should fail - No config object', function() {
			const acl = require('../../lib/');

			let noPath = function() {
				acl.config({});
			};

			expect(noPath).to.throw(Error, 'Please supply the route to the ACL Rules');
		});

		it('Should fail - Config file problems', function() {
			const acl = require('../../lib/');

			let wrongPath = function() {
				acl.config({
					path: 'wrong/path'
				});
			};

			expect(wrongPath).to.throw(Error, 'Could not read rules file');

			let brokenFile = function() {
				acl.config({
					path: 'test/resources/broken-rules-file.json'
				});
			};

			expect(brokenFile).to.throw(Error, 'Invalid rule file given. Make sure the file is a proper JSON');
		});
	});

	describe('authorize', function() {
		let acl, next;

		beforeEach(function() {
			next = sinon.spy();
		});

		beforeEach(function() {
			acl = require('../../lib');
			acl.config({
				path: 'test/resources/rules.json',
			});
		});

		it('Should succeed - * rule', function() {
			acl.authorize({ user: { role: 'admin' } }, { }, next);

			expect(next.callCount).to.equal(1);
			expect(next.args[0]).to.deep.equal([]);
		});

		it('Should succeed - specific rule', function() {
			acl.authorize({ method: 'GET', originalUrl: '/test', user: { role: 'user' } }, { }, next);

			expect(next.args[0]).to.deep.equal([]);
		});

		it('Should succeed - route ends with /', function() {
			acl.authorize({ method: 'GET', originalUrl: '/test/', user: { role: 'user' } }, { }, next);

			expect(next.args[0]).to.deep.equal([]);
		});

		it('Should succeed - subroute', function() {
			acl.authorize({ method: 'GET', originalUrl: '/test/test2', user: { role: 'user' } }, { }, next);

			expect(next.args[0]).to.deep.equal([]);
		});

		it('Should succeed - url parameter', function() {
			acl.authorize({ method: 'GET', originalUrl: '/param/123', user: { role: 'user' } }, { }, next);

			expect(next.args[0]).to.deep.equal([]);
		});

		it('Should succeed - subroute + url parameter', function() {
			acl.authorize({ method: 'GET', originalUrl: '/param/123/test', user: { role: 'user' } }, { }, next);

			expect(next.args[0]).to.deep.equal([]);
		});

		it('Should succeed - subroute ends with *', function() {
			acl.authorize({ method: 'GET', originalUrl: '/test/star/long/path', user: { role: 'user' } }, { }, next);

			expect(next.args[0]).to.deep.equal([]);
		});

		it('Should succeed - default role', function() {
			acl.config({
				path: 'test/resources/rules.json',
				defaultRole: 'guest'
			});
			acl.authorize({ method: 'GET', originalUrl: '/test', user: {} }, { }, next);

			expect(next.args[0]).to.deep.equal([]);
		});

		it('Should reject - no default role', function() {
			acl.authorize({ method: 'GET', originalUrl: '/test', user: {} }, { }, next);

			expect(next.args[0]).to.have.lengthOf(1);
			expect(next.args[0][0]).to.be.an.instanceof(UnauthorizedError);
		});

		it('Should reject - unauthorized path', function() {
			acl.authorize({ method: 'GET', originalUrl: '/test2', user: { role: 'user' } }, { }, next);

			expect(next.args[0]).to.have.lengthOf(1);
			expect(next.args[0][0]).to.be.an.instanceof(UnauthorizedError);
		});

		it('Should reject - deny path', function() {
			acl.authorize({ method: 'GET', originalUrl: '/deny', user: { role: 'user' } }, { }, next);

			expect(next.args[0]).to.have.lengthOf(1);
			expect(next.args[0][0]).to.be.an.instanceof(UnauthorizedError);
		});

		it('Should reject - unauthorized method', function() {
			acl.authorize({ method: 'POST', originalUrl: '/test', user: { role: 'user' } }, { }, next);

			expect(next.args[0]).to.have.lengthOf(1);
			expect(next.args[0][0]).to.be.an.instanceof(UnauthorizedError);
		});

		it('Should reject - no rules for role', function() {
			acl.authorize({ method: 'GET', originalUrl: '/test', user: { role: 'user2' } }, { }, next);

			expect(next.args[0]).to.have.lengthOf(1);
			expect(next.args[0][0]).to.be.an.instanceof(UnauthorizedError);
		});
	});
});
