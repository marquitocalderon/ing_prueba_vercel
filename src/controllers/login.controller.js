// const { pool } = require("../basededatos");
// const bcryptjs = require("bcryptjs");



// const vistaPrincipal=(req,res)=>{
//     res.render("principal")
// }



// const PostvistaPrincipal = async (req, res) => {
//     const { usuario, password } = req.body;
  
//     let passEncryptado = await bcryptjs.hash(password, 8);
//     if (usuario && password) {
//       // use placeholders (?) to avoid SQL injection
//       pool.query(
//         "SELECT * FROM usuarios u JOIN perfil p ON u.idperfil = p.idperfil WHERE u.usuario = ?",
//         [usuario],
//         async (error, results) => {
//           if (error) {
//             console.error(error);
//             res.status(500).send("Internal Server Error");
//             return;
//           }
  
//           if (
//             results.length === 0 ||
//             !(await bcryptjs.compare(password, results[0].password))
//           ) {
//             res.redirect("/login");
//             console.log("error tu contraseña")
//           } else if (results[0].estado === "Inactivo") {
//             res.redirect("/login");
//             console.log("erro no estas activo")
//           } else {
//             const perfilId = results[0].idperfil; // Obtener el ID del perfil desde los resultados de la consulta
  
//             pool.query(
//               "SELECT * FROM perfil WHERE idperfil = ?",
//               [perfilId],
//               (error, results) => {
//                 if (error) {
//                   console.error(error);
//                   res.status(500).send("Internal Server Error");
//                   return;
//                 }
//                 const cargo = results[0].cargo;
//                 if (cargo === "Administrador") {
//                   res.redirect("/principal")
//                   console.log("entraste")
//                 } else if (cargo === "Caja") {
//                   res.redirect("/caja");
//                 } else if (cargo === "Almacenero") {
//                   res.redirect("/almacen");
//                 } else {
//                   res.redirect("/");
//                 }
//               }
//             );
//           }
//         }
//       );
//     } else {
//       res.redirect("/login");
//     }
//   };
  





// module.exports= {vistaPrincipal , PostvistaPrincipal}