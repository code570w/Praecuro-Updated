var admin = require("../controllers/Admin.controller");

module.exports = (app) => {
    app.post("/auth/registerAdmin", admin.register);
    app.post("/auth/updateAdmin", admin.updateAdmin);
    app.post("/auth/login", admin.login);
    app.post("/auth/userlogin", admin.userlogin);
    app.post('/category/add', admin.addCategory)
    app.post('/category/update', admin.updateCategory)
    app.post('/category/delete', admin.deleteCategory)
    app.post('/category/deletes', admin.deletesCategory)
    app.post("/category/get",admin.getAllCategory)
    app.post('/auth/pass',admin.updateHash)
    app.post('/auth/commision_percentage',admin.addCommisionPercentage)
    app.post('/auth/getPercentage',admin.getPercentageValue)
};
