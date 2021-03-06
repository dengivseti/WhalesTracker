const { body } = require('express-validator')

exports.authValidator = [
  body(
    'username',
    'Username must be alphanumeric string length min 3 max 56 characters',
  )
    .isAlphanumeric()
    .trim()
    .isLength({ min: 3, max: 56 }),
  body(
    'password',
    'Password must have length min 6 max 56 characters',
  )
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),
]

exports.editGroup = [
  body(
    'group.label',
    'Label group must be alphanumeric string length min 3 max 20 characters',
  )
    .isAlphanumeric()
    .trim()
    .isLength({ min: 3, max: 20 }),
  body(
    'group.name',
    'Identifier  group must be alphanumeric string length min 3 max 20 characters',
  )
    .isAlphanumeric()
    .trim()
    .isLength({ min: 3, max: 20 }),
  body('group.typeRedirect', 'Select type redirect  group')
    .trim()
    .exists(),
  body(
    'group.checkUnic',
    'Check unique has been boolean',
  ).isBoolean(),
  body(
    'group.timeUnic',
    'Time unique has been number. Min 1 hour. Max 720 hour',
  )
    .isNumeric()
    .isLength({ min: 1, max: 720 }),
  body('group.useLog', 'Logging has been boolean').isBoolean(),
  body('group.isActive', 'Active has been boolean').isBoolean(),
]

exports.editSetting = [
  body(
    'postbackKey',
    'Postback must be string length min 5 max 20 characters',
  )
    .trim()
    .isLength({ min: 5, max: 20 }),
  body(
    'clearDayStatistic',
    'Time unique has been number. Min 1 days. Max 30 days',
  )
    .isNumeric()
    .isInt({ min: 1, max: 30 }),
  body('trash', 'Select type trash').trim().exists(),
  body(
    'logLimitClick',
    'Limit clicks has been number. Min 5. Max 1500',
  )
    .isNumeric()
    .isInt({ min: 1, max: 1500 }),
  body(
    'logLimitAmount',
    'Limit amount has been number. Min 5. Max 5000',
  )
    .isNumeric()
    .isInt({ min: 5, max: 5000 }),
  body(
    'getKey',
    'Get Key must be string length min 1 max 20 characters',
  )
    .trim()
    .isLength({ min: 1, max: 20 }),
]

exports.addGroup = [
  body(
    'label',
    'Label group must be alphanumeric string length min 3 max 15 characters',
  )
    .isAlphanumeric()
    .trim()
    .isLength({ min: 3, max: 15 }),
  body(
    'name',
    'Identifier group must be alphanumeric string length min 3 max 20 characters',
  )
    .isAlphanumeric()
    .trim()
    .isLength({ min: 3, max: 20 }),
  body('typeRedirect', 'Select type redirect group').trim().exists(),
  body('checkUnic', 'Check unique has been boolean').isBoolean(),
  body(
    'timeUnic',
    'Time unique has been number. Min 1 hour. Max 720 hour',
  )
    .isNumeric()
    .isLength({ min: 1, max: 720 }),
  body('useLog', 'Logging has been boolean').isBoolean(),
  body('isActive', 'Active has been boolean').isBoolean(),
]

exports.addStream = [
  body(
    'name',
    'Label stream must be alphanumeric string length min 3 max 15 characters',
  )
    .isAlphanumeric()
    .trim()
    .isLength({ min: 3, max: 15 }),
  body('position', 'Position has been number').isNumeric(),
  body('typeRedirect', 'Select type redirect group').trim().exists(),
  body('relation', 'Relation has been boolean').isBoolean(),
  body('useLog', 'Logging has been boolean').isBoolean(),
  body('isActive', 'Active has been boolean').isBoolean(),
  body('isBot', 'Bot has been boolean').isBoolean(),
]

exports.addOffer = [
  body(
    'name',
    'Name offer must be alphanumeric string length min 3 max 25 characters',
  )
    .trim()
    .isLength({ min: 3, max: 25 }),
  body('type', 'Select type distribution offer').trim().exists(),
  body('offers.*.url', 'String must be url').trim().isURL(),
  body(
    'offers.*.percent',
    'Input correct percent min 0 max 100 percent',
  )
    .isNumeric()
    .isInt({ min: 0, max: 100 }),
]
