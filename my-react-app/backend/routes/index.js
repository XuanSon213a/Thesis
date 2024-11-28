const express = require('express')

const searchUser = require('../controller/searchUser')

const router = express.Router()


//search user
router.post("/search-user",searchUser)


module.exports = router