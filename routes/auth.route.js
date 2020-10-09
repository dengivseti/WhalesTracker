const { Router } = require('express')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const User = require('../models/User')
const { authValidator } = require('../utils/validators.utils')

const router = Router()

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
})

router.post('/login', authValidator, async (req, res) => {
  try {
    const { username, password } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg })
    }
    let user = await User.findOne({ username })
    if (!user) {
      const countUsers = await User.findOne()
      if (countUsers) {
        return res.status(400).json({ message: 'Incorrect data' })
      }
      const hashedPassword = await bcrypt.hash(password, 12)
      user = new User({ username, password: hashedPassword })
      await user.save()
    } else {
      const isMath = await bcrypt.compare(password, user.password)
      if (!isMath) {
        return res.status(400).json({ message: 'Incorrect data' })
      }
    }
    req.session.user = user._id
    req.session.isAuthenticated = true
    return req.session.save((err) => {
      if (err) {
        throw err
      }
      return res.status(201).json({ id: user._id, message: 'ok' })
    })
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

module.exports = router
