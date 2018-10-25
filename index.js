const express = require('express')
const passport = require('passport')
const cookieSession = require('cookie-session')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const keys = require('./config/keys')
const mongoose = require('mongoose')
require('./models/User')

mongoose.connect(keys.mongodbURI, { useNewUrlParser: true })

const User = mongoose.model('users')

const app = express()

app.use(
    cookieSession({
        maxAge: 30 * 24 * 60 * 60 * 1000,
        keys: [keys.cookieKey]
    })
)

app.use(passport.initialize())

app.use(passport.session())

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    console.log(id)
    User.findById(id)
    .then(user => {
        console.log(user)
        done(null, user)
    })
})

passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback',
    proxy: true
}, (accessToken, refreshToken, profile, done) => {
   User.findOne({googleId: profile.id}).then(existingUser => {
       if (existingUser) {
           done(null, existingUser)
       } else {
           new User({googleId: profile.id}).save().then(user => done(null, user))
       }
   } )
}
))


app.get('/google/auth', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

app.get('/auth/google/callback', passport.authenticate('google'))

app.get('/api/getUser', (req, res) => {
    console.log(req.user)
    res.send(req.user)
})

app.get('/api/logout', (req, res) => {
    req.logOut()
    res.send(req.user)
})

const port = process.env.PORT || 5000

app.listen(port, ()=>{
    console.log(`Server is up and running at port ${port}`)
} )
