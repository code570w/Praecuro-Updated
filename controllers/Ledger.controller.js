var mongoose = require('mongoose');
const Ledger = mongoose.model('Ledger');

exports.allLedgers = async (req, res) =>  {
    Ledger.find()
        .exec(function(err, ledgers) {
        if (err) {
            return res.json({success: false, errMessage: "Unknown errors occurred while getting all ledgers."});
        } else {
            return res.json({success: true, ledgers: ledgers});
        }
    });
};

exports.addLedger = async (req, res) => {
    let ledgerObj = new Ledger(req.body);
    await ledgerObj.save();
    let ledgers = await Ledger.find();
    return res.json({success: true, ledgers: ledgers});
}

exports.updateLedger = async (req, res) =>  {
    let ledgerObj = new Ledger(req.body);

    Ledger.findOneAndUpdate({_id: ledgerObj._id}, {
        vendor: ledgerObj.vendor,
        amount: ledgerObj.amount,
        memo: ledgerObj.memo,
        company: ledgerObj.company,
    }, {
        new: true,
        useFindAndModify: false
    }, async function(err, ledger){
        if(err) {
            return res.json({success: false, errMessage: "Unknown errors occurred while updating clarizen ledgers."});
        } else {
            let ledgers = await Ledger.find();
            return res.json({success: true, ledgers: ledgers});
        }
    });
};

exports.deleteLedger = (req,res) => {
    var id = req.params.id;
    Ledger.findByIdAndRemove(id, {
        new: true,
        useFindAndModify: false
    }, async function(err, ledger){
        if(err) {
            res.json({success: false, errMessage: "Unknown errors occurred while deleting ledger."});
        } else {

            let ledgers = await Ledger.find();
            return res.json({success: true, ledgers: ledgers});
        }
    });

};