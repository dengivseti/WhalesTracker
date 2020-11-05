const { Router } = require('express')
const { validationResult } = require('express-validator')
const auth = require('../middleware/auth.middleware')
const {
  editGroup,
  addStream,
  addGroup,
  addOffer,
} = require('../utils/validators.utils')
const Group = require('../models/Group')
const Offer = require('../models/Offer')
const Stream = require('../models/Stream')

const router = Router()

router.get('/dashboard', auth, async (req, res) => {
  try {
    res.json('TEST GET')
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong' })
  }
})

router.post('/offers/edit', auth, addOffer, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg })
    }
    if (req.body && req.body._id) {
      const { name, type, _id, offers } = req.body
      await Offer.where({ _id }).updateOne({
        name,
        type,
        offers,
      })
      return res.json(req.body)
    }
    const offer = new Offer({ ...req.body })
    const id = await offer.save()
    return res.json(id)
  } catch (e) {
    return res
      .status(500)
      .json({ message: 'Something went wrong', e })
  }
})

router.delete('/offers/:id/', auth, async (req, res) => {
  try {
    await Offer.deleteOne({ _id: req.params.id })
    res.json({ status: 'OK' })
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong' })
  }
})

router.post('/group/create', auth, addGroup, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg })
    }
    const group = new Group({ ...req.body })
    const id = await group.save()
    return res.json(id)
  } catch (e) {
    return res
      .status(500)
      .json({ message: 'Something went wrong', e })
  }
})

router.get('/group/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      'streams',
    )
    return res.json(group)
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.delete('/group/:id/:idstream', auth, async (req, res) => {
  try {
    const idGroup = req.params.id
    const idStream = req.params.idstream
    const group = await Group.findById(idGroup)
    await group.removeStream(idStream)
    await Stream.deleteOne({ _id: idStream })
    res.json({ status: 'OK' })
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong' })
  }
})

router.delete('/group/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
    await Stream.deleteMany({ _id: { $in: group.streams } })
    await Group.deleteOne({ _id: req.params.id })
    res.json({ status: 'OK' })
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong' })
  }
})

router.post('/group/:id', auth, editGroup, async (req, res) => {
  try {
    const { group, streams } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg })
    }
    const bulkUpdates = []
    await Group.where({ _id: req.params.id }).updateOne({
      label: group.label,
      name: group.name,
      typeRedirect: group.typeRedirect,
      checkUnic: group.checkUnic,
      timeUnic: group.timeUnic,
      code: group.code,
      useLog: group.useLog,
      isActive: group.isActive,
    })
    if (streams && streams.length) {
      streams.forEach((stream) => {
        const filter = { _id: stream._id }
        const update = {
          position: stream.position,
          name: stream.name,
          typeRedirect: stream.typeRedirect,
          code: stream.code,
          useLog: stream.useLog,
          isActive: stream.isActive,
          relation: stream.relation,
          isBot: stream.isBot,
          filters: stream.filters ? stream.filters : [],
        }
        bulkUpdates.push({
          updateOne: {
            filter,
            update,
          },
        })
      })
      await Stream.bulkWrite(bulkUpdates)
    }
    return res.json({ status: 'OK' })
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.post('/stream/create', auth, addStream, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg })
    }
    const { igGroup, ...bodyStream } = req.body
    const stream = new Stream({ ...bodyStream })
    const mongoStream = await stream.save()
    const group = await Group.findById(igGroup)
    await group.addToStream(mongoStream._id)
    return res.status(201).json(mongoStream)
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.post('/filters/create', auth, async (req, res) => {
  try {
    const { igStream, filters } = req.body
    const stream = await Stream.findById(igStream)
    await stream.updateFilters(filters)
    res.json(req.body)
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong' })
  }
})

module.exports = router
