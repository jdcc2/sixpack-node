'use strict'

module.exports = {
    jwtOptions : {
        crypto: {
            algorithm: 'HS512',
            secret: 'supersecret'
        },
        claims: {
        // Automatically set 'Issued At' if true (epoch), or set to a number
        iat: true,
        // Set 'Not Before' claim (Unix epoch)
        nbf: Math.floor(Date.now() / 1000) - 60,
        // Set 'Expiration' claim (one day)
        exp: Math.floor(Date.now() / 1000) + 3600,
        issuer: 'sixpack'
      }
    }
}
