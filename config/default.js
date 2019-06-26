module.exports = {
  port: 3000,
  session: {
    secret: 'Blog',
    key: 'Blog',
    maxAge: 2592000000
  },
  mongodb: 'mongodb://localhost:27017/Blog'
}
