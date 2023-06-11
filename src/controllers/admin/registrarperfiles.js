const pool = require("../../../database/db");


const vistaPerfil= (req, res) => {
    // Puedes acceder al ID del usuario desde req.userId
    res.render("perfil");
  };





  module.exports = {vistaPerfil}
  
