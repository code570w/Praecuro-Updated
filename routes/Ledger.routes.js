var ledger = require("../controllers/Ledger.controller");

module.exports = (app) => {
    app.post("/ledger/allLedgers", ledger.allLedgers);
    app.post("/ledger/addLedger", ledger.addLedger);
    app.post("/ledger/updateLedger", ledger.updateLedger);
    app.delete("/ledger/deleteLedger/:id", ledger.deleteLedger);
};
