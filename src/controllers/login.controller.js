const { pool } = require("../basededatos");




const vistaPrincipal=(req,res)=>{
    res.render("principal")
}



module.exports= {vistaPrincipal}