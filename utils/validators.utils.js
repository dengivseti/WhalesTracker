const {body} = require('express-validator')


exports.authValidator = [
    body('username', 'Username must be alphanumeric string length min 3 max 56 characters')
        .isAlphanumeric()
        .trim()
        .isLength({min: 3, max: 56}),
    body('password', 'Password must have length min 6 max 56 characters')
        .isLength({min: 6, max: 56})
        .isAlphanumeric()
        .trim()
]

exports.editGroup = [
    body('group.label', 'Label group must be alphanumeric string length min 3 max 8 characters')
        .isAlphanumeric()
        .trim()
        .isLength({min: 3, max: 8}),
    body('group.name', 'Identifier  group must be alphanumeric string length min 3 max 8 characters')
        .isAlphanumeric()
        .trim()
        .isLength({min: 3, max: 8}),
    body('group.typeRedirect', 'Select type redirect  group')
        .trim()
        .exists(),
    body('group.checkUnic', 'Check unique has been boolean')
        .isBoolean(),
    body('group.timeUnic', 'Time unique has been number. Min 1 hour. Max 720 hour')
        .isNumeric()
        .isLength({min: 1, max: 720}),
    body('group.useLog', 'Logging has been boolean')
        .isBoolean(),
    body('group.isActive', 'Active has been boolean')
        .isBoolean(),
]

exports.addGroup = [
    body('label', 'Label group must be alphanumeric string length min 3 max 8 characters')
        .isAlphanumeric()
        .trim()
        .isLength({min: 3, max: 8}),
    body('name', 'Identifier  group must be alphanumeric string length min 3 max 8 characters')
        .isAlphanumeric()
        .trim()
        .isLength({min: 3, max: 8}),
    body('typeRedirect', 'Select type redirect  group')
        .trim()
        .exists(),
    body('checkUnic', 'Check unique has been boolean')
        .isBoolean(),
    body('timeUnic', 'Time unique has been number. Min 1 hour. Max 720 hour')
        .isNumeric()
        .isLength({min: 1, max: 720}),
    body('useLog', 'Logging has been boolean')
        .isBoolean(),
    body('isActive', 'Active has been boolean')
        .isBoolean(),
]

exports.addStream = [
    body('name', 'Label stream must be alphanumeric string length min 3 max 8 characters')
        .isAlphanumeric()
        .trim()
        .isLength({min: 3, max: 8}),
    body('position', 'Position has been number')
        .isNumeric(),
    body('typeRedirect', 'Select type redirect  group')
        .trim()
        .exists(),
    body('relation', 'Relation has been boolean')
        .isBoolean(),
    body('useLog', 'Logging has been boolean')
        .isBoolean(),
    body('isActive', 'Active has been boolean')
        .isBoolean(),
    body('isBot', 'Bot has been boolean')
        .isBoolean(),
]
