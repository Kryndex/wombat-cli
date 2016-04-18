/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand   = require('must'),
	sinon    = require('sinon'),
	Registry = require('../lib/registry')
	;

describe('registry client', function()
{
	describe('constructor', function()
	{
		it('can be constructed', function()
		{
			Registry.must.be.a.function();
		});

		it('exports some functions', function()
		{
			var reg = Registry();

			reg.must.have.property('authed');
			reg.authed.must.be.a.function();
			reg.must.have.property('anonymous');
			reg.anonymous.must.be.a.function();

			reg.must.have.property('registry');
		});
	});

	describe('anonymous()', function()
	{
		it('calls request with the passed uri', function(done)
		{
			var reg = Registry();

			var expected = {
				url: 'https://api.npmjs.org/foo',
				method: 'GET',
				json: true,
			};

			var spy = sinon.stub();
			spy.yields(null, 'response', 'body');
			reg.requestfunc = spy;

			reg.anonymous({ method: 'GET', uri: '/foo' }, function(err, res, body)
			{
				demand(err).not.exist();
				res.must.equal('response');
				body.must.equal('body');
				spy.calledWith(expected).must.be.true();

				done();
			});
		});
	});

	describe('authed()', function()
	{
		it('responds with an error when there is no auth token', function(done)
		{
			var authstub = sinon.stub();
			authstub.returns(null);

			var reg = Registry();
			reg.getAuthToken = authstub;

			reg.authed({ method: 'GET', uri: '/foo' }, function(err, res, body)
			{
				err.must.be.an.object();
				err.must.match(/you are not logged in/);
				done();
			});
		});

		it('calls request with the passed uri', function(done)
		{
			var expected = {
				url: 'https://api.npmjs.org/foo',
				method: 'GET',
				json: true,
				auth: { bearer: 'i-am-a-token' },
			};
			var requestSpy = sinon.stub();
			requestSpy.yields(null, 'response', 'body');

			var authstub = sinon.stub();
			authstub.returns('i-am-a-token');

			var reg = Registry();
			reg.getAuthToken = authstub;
			reg.requestfunc = requestSpy;

			reg.authed({ method: 'GET', uri: '/foo' }, function(err, res, body)
			{
				demand(err).not.exist();
				res.must.equal('response');
				body.must.equal('body');
				requestSpy.calledWith(expected).must.be.true();

				done();
			});
		});
	});
});
