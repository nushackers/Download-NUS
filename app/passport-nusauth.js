var util = require('util');
var validator = require('validator');
var ldap = require('ldapjs');
var passport = require('passport');

function Strategy(options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {
            debug: false
        };
    }
    if (!verify) throw new Error('NUSAuth authentication strategy requires a verify function');

    passport.Strategy.call(this);

    this.name = 'nusauth';
    this.clients = {
        'nusstu': ldap.createClient({url:'ldap://ldapstu.nus.edu.sg:389'}),
        'nusstf': ldap.createClient({url:'ldap://ldapstf.nus.edu.sg:389'}),
        'nusext': ldap.createClient({url:'ldap://ldapext.nus.edu.sg:389'})
    };
    this._verify = verify;
    this._options = options;
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function(req, options) {
    var self = this;

    if (!req.body.username || !req.body.password || !req.body.windomain) {
        if (self._options.debug) console.log('(EE) [nusauth] Missing fields');
        return self.fail(401);
    }
    
    var windomainAllowed = ['nusstu', 'nusstf', 'nusext'];
    var baseDNs = {
        'nusstu': 'dc=stu,dc=nus,dc=edu,dc=sg',
        'nusstf': 'dc=stf,dc=nus,dc=edu,dc=sg',
        'nusext': 'dc=ext,dc=nus,dc=edu,dc=sg'
    };

    var username = validator.sanitize(req.body.username).xss();
    var password = req.body.password;
    var windomain = req.body.windomain;
    
    if (windomainAllowed.indexOf(windomain) < 0) {
        if (self._options.debug) console.log('(EE) [nusauth] Domain not allowed: ' + windomain);
        return self.fail(401);
    }
    
    var client = self.clients[windomain];
    
    client.bind(windomain + '\\' + username, password, function(err) {
        if (err) {
            if (self._options.debug) console.log('(EE) [nusauth] LDAP error:', err.stack);
            return self.fail(403);
        }
        
        var baseDN = baseDNs[windomain];
        var search = {
            filter: '(sAMAccountName=' + username + ')',
            scope: 'sub'
        };
        client.search(baseDN, search, function(err, res) {
            if (err) {
                if (self._options.debug) console.log('(EE) [nusauth] LDAP error:', err.stack);
                return self.fail(403);
            }

            res.on('searchEntry', function(entry) {
                var profile = entry.object;

                self._verify(profile, function(err, user) {
                    if (err) {
                        if (self._options.debug) console.log('(EE) [nusauth] LDAP error:', err.stack);
                        return self.error(err);
                    }
                    if (!user) {
                        if (self._options.debug) console.log('(EE) [nusauth] LDAP user error:', self._challenge());
                        return self.fail(self._challenge());
                    }
                    if (self._options.debug) console.log('(II) [nusauth] auth success:', user);
                    self.success(user);
                });
            });

            res.on('error', function(err) {
                if (self._options.debug) console.log('(EE) [nusauth] Network error:', err.stack);
                self.error(err);
            });

            res.on('end', function(result) {
                if (result.status !== 0) {
                    if (self._options.debug) console.log('(EE) [nusauth] Result not OK:', result);
                    self.fail(result.status);
                }
            });
        });
    });
};

module.exports.Strategy = Strategy;
