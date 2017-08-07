const fs = require('fs');
const debug = require('debug')('acl-express');

const UnauthorizedError = require('./UnauthorizedError');

let configs = {};

/**
 * Get configuration from user and make sure everything is there
 * @param userConfig
 */
function config (userConfig) {
	if (!userConfig) {
		throw new Error('Please supply a configuration object');
	}

	if (!userConfig.path) {
		throw new Error('Please supply the route to the ACL Rules');
	}

	configs.path = userConfig.path;

	configs.roleObjectKey = userConfig.roleObjectKey || 'user';

	if (userConfig.defaultRole) {
		configs.defaultRole = userConfig.defaultRole;
	}

	readRules();
}

/**
 * Read rules file
 */
function readRules() {
	let rules;
	try {
		rules = fs.readFileSync(configs.path, 'utf-8');
	} catch (error) {
		throw new Error('Could not read rules file');
	}

	try {
		rules = JSON.parse(rules);
	} catch (error) {
		throw new Error('Invalid rule file given. Make sure the file is a proper JSON');
	}

	configs.rules = rules;
}

/**
 * Handle route Express parameters
 * @param pattern - The route section to parse
 * @returns string regex string matching the route section
 */
function regexFromPattern(pattern) {
	if (pattern.startsWith(':')) {
		return '.*';
	}

	return pattern;
}

/**
 * Get a route and prepare it for matching
 * @param route
 * @returns {Array|*} An array with all the sections of the route
 */
function prepareRouteArray(route) {
	if (route.startsWith('/')) {
		route = route.substring(1, route.length);
	}

	if (route.endsWith('/')) {
		route = route.substring(0, route.length - 1);
	}

	return route.split('/');
}

/**
 * Check if the given url matches the given url pattern
 * @param url - taken from req.originalUrl
 * @param pattern - Taken from the rules file, should be in the format used by Express
 * @returns {boolean}
 */
function matchURL(url, pattern) {
	let urlArr = prepareRouteArray(url);
	let patternArr = prepareRouteArray(pattern);

	if (urlArr.length !== patternArr.length) {
		return false;
	}

	for (let i = 0; i < urlArr.length; i++) {
		if (!urlArr[i].match(regexFromPattern(patternArr[i]))) {
			return false;
		}
	}

	return true;
}

/**
 * Find the matching rule for the given user role and the current url
 * @param role
 * @param url
 * @returns {*} The first matching rule or undefined
 */
function findRule(role, url) {
	debug('url: ' + url);
	let rules = configs.rules[role];

	for (let rule of rules) {
		if (matchURL(url, rule.route)) {
			return rule;
		}
	}
}

/**
 * Check if the rule allows or blocks the current method
 * @param req - the Express request
 * @param rule
 * @returns {boolean}
 */
function checkRule(req, rule) {
	if (rule.methods.indexOf(req.method) > -1) {
		if (rule.action === 'allow') {
			return true;
		}
	}

	return false;
}

/**
 * The middleware function to be used for access control
 * @param req
 * @param res
 * @param next
 */
function authorize(req, res, next) {
	if (!req[configs.roleObjectKey].role) {
		if (!configs.defaultRole) {
			next(new UnauthorizedError('No Role found'));
			return;
		}

		req[configs.roleObjectKey].role = configs.defaultRole;
	}

	let role = req[configs.roleObjectKey].role;
	let url = req.originalUrl;

	let rule = findRule(role, url);

	debug(rule);

	if (!rule) {
		next(new UnauthorizedError('No matching rule found for \'' + role + '\' on \'' + url + '\''));
		return;
	}

	if (!checkRule(req, rule)) {
		next(new UnauthorizedError());
		return;
	}

	next();
}

module.exports = {
	config,
	authorize,
	UnauthorizedError
};
