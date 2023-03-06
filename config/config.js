module.exports = {
  salt: "b05bd5a64e9a5b1f3046bef577b81bdf",
  secretKey: "jwt-default-secret",
  fileUploadedSubPath:
    process.env.NODE_ENV === "production" ? "build" : "public",
  clientUrl:
    process.env.NODE_ENV === "production"
      ? "https://nurse-job.herokuapp.com/"
      : "http://localhost:4000/",

  // clientUrl: "http://localhost:4000",
  // email: "praecuroapp@gmail.com",
  // password: "Anthem34221??"
  // email: "praecuroapp917@gmail.com",
  // password: "Anthem34221??"
  // email: "praecuroapp2021@gmail.com",
  // password: "Praecuroapp!@2021",
  // email: "slowmanfromdhilwan@gmail.com",
  // password: "Sl0wmaNDh1lwaN",
};
//"Master515"
// console.log(module.exports);
