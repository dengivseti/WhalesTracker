const { Router } = require('express')
const Statistic = require('../models/Statistic')

const router = Router()

router.get('/', async (req, res) => {
  try {
    return res.status(500).json('Something went wrong')
  } catch (e) {
    return res.status(500).json('Something went wrong')
  }
})

router.get('/:id', async (req, res) => {
  try {
    if (
      req.params.id === global.postbackKey &&
      req.query.subid &&
      req.query.payout
    ) {
      await Statistic.where({ subid: req.query.subid }).updateOne({
        amount: +req.query.payout,
      })
      return res.json({ status: 'ok' })
    }
    return res.status(500).json('Something went wrong')
  } catch (e) {
    return res.status(500).json('Something went wrong')
  }
})

module.exports = router
