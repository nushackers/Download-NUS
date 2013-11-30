/**
 * Module dependencies.
 */
var util = require('util');
var sanitize = require('validator').sanitize;
var ldap = require('ldapjs');
var passport = require('passport');
var BadRequestError = require('./errors/badrequesterror');
var InternalLdapError = require('./errors/internalldaperror');

/**
 * `Strategy` constructor.
 *
 * An NUS authentication strategy authenticates requests by delegating to the
 * NUS ldap servers using the openldap protocol.
 *
 * Applications must supply a `verify` callback which accepts a user `profile` entry
 * from the directory, and then calls the `done` callback supplying a `user`, which
 * should be set to `false` if the credentials are not valid.  If an exception occured,
 * `err` should be set.
 *
 * Options:
 *   - `usernameField`  field name where the username is found, defaults to _username_
 *   - `passwordField`  field name where the password is found, defaults to _password_
 *   - `domainField`    field name where the domain is found, defaults to _domain_
 *   - `domainAllowed`  array of allowed domains, defaults to nusstu, nusstf and nusext 
 *
 * Examples:
 *
 *    passport.use(new LDAPStrategy(
 *      function(profile, done) {
 *        return done(null, profile);
 *      }
 *    ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }
    if (!verify) throw new Error('NUS authentication strategy requires a verify function');
    
    this._usernameField  = options.usernameField  || 'username';
    this._passwordField  = options.passwordField  || 'password';
    this._domainField    = options.domainField    || 'domain';
    this._domainAllowed  = options.domainAllowed  || ['nusstu', 'nusstf', 'nusext'];
    
    this._maxConnections = options.maxConnections || 5;
    this._timeout        = options.timeout        || 10000;
    
    passport.Strategy.call(this);
    
    this.name = 'nus';
    this.clients = {
        'nusstu': ldap.createClient({
            url:'ldap://ldapstu.nus.edu.sg:389',
            maxConnections: this._maxConnections,
            timeout: this._timeout
        }),
        'nusstf': ldap.createClient({
            url:'ldap://ldapstf.nus.edu.sg:389',
            maxConnections: this._maxConnections,
            timeout: this._timeout
        }),
        'nusext': ldap.createClient({
            url:'ldap://ldapext.nus.edu.sg:389',
            maxConnections: this._maxConnections,
            timeout: this._timeout
        })
    };
    this.baseDNs = {
        'nusstu': 'dc=stu,dc=nus,dc=edu,dc=sg',
        'nusstf': 'dc=stf,dc=nus,dc=edu,dc=sg',
        'nusext': 'dc=ext,dc=nus,dc=edu,dc=sg'
    };
    this._verify = verify;
    this._options = options;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
    options = options || {};
    var username = lookup(req.body, this._usernameField) || lookup(req.query, this._usernameField);
    var password = lookup(req.body, this._passwordField) || lookup(req.query, this._passwordField);
    var domain   = lookup(req.body, this._domainField)   || lookup(req.query, this._domainField);
    
    var username = sanitize(username).xss();
    
    if (!username || !password || !domain) {
        return this.fail(new BadRequestError(options.badRequestMessage || 'Missing credentials'));
    }
    
    var self = this;

    if (self._domainAllowed.indexOf(domain) < 0) {
        return this.fail(new BadRequestError(options.badRequestMessage || 'Domain not allowed'));
    }

    var client = self.clients[domain];
    var baseDN = self.baseDNs[domain];

    client.bind(domain + '\\' + username, password, function(err) {
        if (err) {
            return self.fail({ message: 'Invalid credentials' });
        }

        var search = {
            filter: '(sAMAccountName=' + username + ')',
            scope: 'sub'
        };
        client.search(baseDN, search, function(err, res) {
            if (err) {
                return self.error(new InternalLdapError('LDAP search error', err));
            }

            res.on('searchEntry', function(entry) {
                var profile = entry.object;

                self._verify(profile, function(err, user, msg) {
                    var message = msg || 'User verification failed';
                    
                    if (err || !user) {
                        return self.fail({ message: message });
                    }
                    self.success(user);
                });
            });

            res.on('error', function(err) {
                return self.error(new InternalLdapError('LDAP network error', err));
            });

            res.on('end', function(result) {
                if (result.status !== 0) {
                    return self.error(new InternalLdapError('LDAP connection terminated unexpectedly', err));
                }
            });
        });
    });

    function lookup(obj, field) {
        if (!obj) {
            return null;
        }
        var chain = field.split(']')
            .join('')
            .split('[');
        for (var i = 0, len = chain.length; i < len; i++) {
            var prop = obj[chain[i]];
            if (typeof(prop) === 'undefined') {
                return null;
            }
            if (typeof(prop) !== 'object') {
                return prop;
            }
            obj = prop;
        }
        return null;
    }
};

/**
 * Expose `Strategy`.
 */ 
module.exports.Strategy = Strategy;
