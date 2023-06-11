const express = require('express')
const { vistaPrincipal } = require('../controllers/login.controller')


const router = express.Router()

router.get("/", (req, res) => {
    res.render("login")
})


router.get("/login", (req, res) => {
    res.render("login")
})



router.get("/principal", vistaPrincipal) 



module.exports= router
