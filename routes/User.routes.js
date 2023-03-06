var user = require("../controllers/User.controller");

// console.log('user',user.getsAllCertification_fronted);

module.exports = (app) => {
  // console.log('--- 555addclient ---',user.getAllCertification);
  app.post("/payment/charge", user.paymentCharge);
  app.post("/payment/setinfo", user.paymentInfo);
  app.post("/payment/adminsetinfo", user.adminpaymentInfo);

  app.post("/payment/getcharge", user.paymentgetcharge);
  app.post("/payment/verify", user.paymentverify);
  app.post("/payment/adminverify", user.adminpaymentverify);

  app.post("/auth/registerUser", user.register);
  app.post("/auth/registerUserAdmin", user.registerUserAdmin);
  app.post("/user/allUsers", user.allUsers);
  app.post("/user/addUser", user.addUser);
  app.post("/user/updateUser", user.updateUser);
  app.post("/user/updateRealUser", user.updateRealUser);
  app.post("/user/updateUserOneItem", user.updateUserOneItem);
  app.post("/user/confirm-email", user.confirmEmail);
  app.post("/user/forgotPassword", user.forgotPassword);
  app.post("/user/savepasswordwithverify", user.savePasswordWithVerify);

  app.delete("/user/deleteUser/:id", user.deleteUser);
  app.post("/nurse/add", user.addNurse);
  app.post("/nurse/update", user.updateNurse);
  app.post("/nurse/delete", user.deleteNurse);
  app.post("/nurse/deletes", user.deletesNurse);
  app.post("/nurse/permission", user.permissionNurses);
  app.post("/nurse/get", user.getAllNurse);
  app.post("/nurse/updateActive", user.updateActive);
  app.post("/nurse/getNurseByid", user.getNurseDetails);

  app.post("/client/add", user.addClient);
  app.post("/client/update", user.updateClient);
  app.post("/client/delete", user.deleteClient);
  app.post("/client/deletes", user.deletesClient);
  app.post("/client/get", user.getAllClient);
  app.post("/client/updateActive", user.updateClientActive);
  app.post("/client/updateHide", user.updateClientHide);

  app.post("/sendcontext", user.sendContext);
  app.post("/getNewPassword", user.getNewPassword);

  app.post("/certification/add", user.addCertification);
  app.post("/certification/update", user.updateCertification);
  app.post("/certification/delete", user.deleteCertification);
  app.post("/certification/deletes", user.deletesCertification);
  app.post("/certification/get", user.getAllCertification);
  app.post("/certification/gets", user.getsAllCertification_fronted);
  app.post("/notifications/get", user.getAllNotifications);

  app.post("/certification/updateActive", user.updateActiveCertification);
};
