
/**
 * Module Dependencies
 */

var crypto = require('crypto');

/**
 * Configuration
 */

var config = {
    'signatureField': 'signature',
    'publicKeyField': 'key',
    'tokenField': 'token',
    'hashAlgorithm': 'sha256'
};

/**
 * Helper methods
 */

var helpers = {
    "getPrivateKey": function(publicKey) {
        return '';
    },
    'isValidToken': function(token) {
        return false;
    }
};

/**
 * Sign a request
 * 
 * @param {Array} a key-value array of query parameters
 * @param {Integer} (optional) the timestamp to sign this request with
 * @returns {String} a hashed representation of the query parameters
 */
function sign(query, timestamp) {
    var keys = Object.keys(query),
        values = '',
        timestamp = typeof timestamp !== 'undefined' ?
            timestamp : new Date().getTime();
    keys.sort();
    if (keys.indexOf(config.signatureField) !== -1) {
        keys.splice(config.signatureField, 1);
    }
    for (var i = 0; i < keys.length; i++) {
        values += keys[i] + '=' + query[keys[i]];
    }
    values += helpers.getPrivateKey(query[config.publicKeyField]);
    values += timestamp;
    return crypto.createHash(config.hashAlgorithm).update(values).digest('hex')
        + '-' + timestamp;
}

/**
 * Does the query have a valid public key?
 * 
 * @param {Array} a key-value array of query parameters
 * @returns {Boolean} whether the public key was valid
 */
function hasValidKey(query) {
    var valid = true;
    if (typeof query[config.publicKeyField] === 'undefined') {
        valid = false;
        console.log('invalid: typeof');
    } else if (
        helpers.getPrivateKey(query[config.publicKeyField]) === ''
    ) {
        valid = false;
        console.log('invalid: private key');
    }
    return valid;
}

/**
 * Does the query have a valid signature?
 * 
 * @param {Array} a key-value array of query parameters
 * @returns {Boolean} whether the signature was valid
 */
function hasValidSignature(query) {
    var valid = true,
        signature = new String(query[config.signatureField]),
        timestamp = 0;
    if (typeof query[config.signatureField] === 'undefined') {
        valid = false;
    } else if (!hasValidKey(query)) {
        valid = false;
    } else if (signature.indexOf('-') === -1) {
        valid = false;
    } else {
        // timestamp is in milliseconds
        timestamp = signature.substring(signature.lastIndexOf('-') + 1);
        if (Date.now() - timestamp > 300000) {
            valid = false;
        } else if (
            sign(query, timestamp)
            !== query[config.signatureField]
        ) {
            valid = false;
        }
    }
    return valid;
}

/**
 * Does the query have a valid token?
 * 
 * @param {Array} a key-value array of query parameters
 * @returns {Boolean} whether the token was valid
 */
function hasValidToken(query) {
    var valid = true;
    if (typeof query[config.tokenField] === 'undefined') {
        valid = false;
    } else if (!hasValidSignature(query)) {
        valid = false;
    } else if (!helpers.isValidToken(query[config.tokenField])) {
        valid = false;
    }
    return valid;
}

/**
 * Module Exports
 */

exports.config = config;
exports.helpers = helpers;
exports.sign = sign;
exports.hasValidKey = hasValidKey;
exports.hasValidSignature = hasValidSignature;
exports.hasValidToken = hasValidToken;
