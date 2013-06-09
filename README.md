authsux
=======

A simple Node.js authentication library


authsux follows a very basic HMAC & bearer token strategy.

**Authentication Scheme**

  - client public key
    - The client's publicly available key; sent with requests
  - client private key
    - The client's "secret" key; hidden from public view
  - bearer token
    - The user's bearer token; granted upon valid authentication
  - signature + timestamp
    - The signature for the request; a timestamp is appended to the end

**Express Middleware Example**

(You should be able to adapt this to your purposes)

``` javascript
  /* auth.js */

  var authsux = require('./path/to/authsux');
  
  // a helper method for retrieving a private key, given a public key
  authsux.helpers.getPrivateKey = function(publicKey) {
    // beyond the scope of this example
  }
  
  // a helper method to check whether a bearer token is valid
  authsux.helpers.isValidToken = function(token) {
    // beyond the scope of this example
  }
  
  // check for a valid public key and private key
  exports.checkKey = function(request, response, next) {
    if (authsux.hasValidKey(request.query)) {
      next();
    } else {
      response.writeHead(401, 'Unauthorized');
      response.end();
    }
  }
  
  // check for a valid signature
  exports.checkSignature = function(request, response, next) {
    if (authsux.hasValidSignature(request.query)) {
      next();
    } else {
      response.writeHead(401, 'Unauthorized');
      response.end();
    }
  }
  
  // check for a valid token
  exports.checkToken = function(request, response, next) {
    if (authsux.hasValidToken(request.query)) {
      next();
    } else {
      response.writeHead(401, 'Unauthorized');
      response.end();
    }
  }
```

You can then use the middleware like so:

``` javascript
  /* server.js */

  // ...
  
  var auth = require('./path/to/auth.js');
  
  // ...
  
  app.get('/foo', auth.checkToken, function() {
    // will only execute if the keys, token, and signature are all valid
  });
  
  app.post('/foo', auth.checkSignature, function() {
    // will only execute if the keys and signature are valid
  });
  
  app.put('/foo', auth.checkKey, function() {
    // will only execute if the keys are valid
  });
  
  app.delete('/foo', function() {
    // performs no authentication
  });
  
  // ...

```

Obviously, you might want to add some additional security over top of this, but now you should hopefully have a good base to build upon.  My hope is that it abstracts out some of the more mundane tasks - like checking your query parameters and building hashes - so that you can focus on adding more complexity to your security layer.  Hopefully, I've provided this for you.

**Configuration options**

  - *authsux.config.signatureField*: the query field for the signature value (defaults to 'signature')
  - *authsux.config.publicKeyField*: the query field for the public key value (defaults to 'key')
  - *authsux.config.tokenField*: the query field for the token value (defaults to 'token')
  - *authsux.config.hashAlgorithm*: the [crypto](https://npmjs.org/package/crypto) hash algorithm to use for the signature (defaults to 'sha256')

**Exports**

  - *authsux.config*: configuration parameters (see above)
  - *authsux.helpers*: helper functions to be defined by the developer and used by authsux internals
  - *authsux.sign*: the function used to sign requests; accepts an array of query parameters and an optional timestamp
  - *authsux.hasValidKey*: checks for a valid public key and private key
  - *authsux.hasValidSignature*: checks for a valid signature; also checks hasValidKey
  - *authsux.hasValidToken*: checks for a valid token; also checks hasValidSignature

**Future Plans**

  - Support sending parameters in the header in addition to the query string


I hope you enjoy authsux.  If you have any questions or concerns, please voice them!

Thanks,

MP
