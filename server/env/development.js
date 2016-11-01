module.exports = {
  DATABASE_URL: 'postgres://localhost:5432/grace_shopper',
  SESSION_SECRET: 'Optimus Prime is my real dad',
  TWITTER: {
    consumerKey: 'INSERT_TWITTER_CONSUMER_KEY_HERE',
    consumerSecret: 'INSERT_TWITTER_CONSUMER_SECRET_HERE',
    callbackUrl: 'INSERT_TWITTER_CALLBACK_HERE'
  },
  FACEBOOK: {
    clientID: '354574198216997',
    clientSecret: '1f2ff338f29ca22242ee1e31e1f6fa4b',
    callbackURL: 'http://localhost:1337/auth/facebook/callback'
  },
  GOOGLE: {
    clientID: '310960242224-pjjqjk1ostqmg7gbc1kmsfnovm053cl6.apps.googleusercontent.com',
    clientSecret: '0geBR7Ju7XG7F8ZNDXOIJ7WM',
    callbackURL: 'http://localhost:1337/auth/google/callback'
  },
  LOGGING: true,
  NATIVE: true
};
