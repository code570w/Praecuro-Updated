var job = require("../controllers/Job.controller");

module.exports = (app) => {
    app.post('/job/add', job.addJob)
    app.post('/job/update', job.updateJob)
    app.post('/job/update-status',job.updateJobStatus)
    app.post('/job/delete', job.deleteJob)
    app.post('/job/deletes', job.deletesJob)
    app.post("/job/get",job.getAllJob)
    app.post("/job/getshow",job.getAllJobShow)
    app.post("/job/getsel",job.getSelJob)
    app.post('/job/award',job.setAward)
    app.post('/job/complete',job.setComplete)

    app.post('/bid/get',job.getBid)
    app.post('/bid/getAll',job.getAllBid)
    app.post('/bid/add', job.addBid)
    app.post('/bid/update', job.updateBid)
    app.post('/bid/delete', job.deleteBid)
    app.post('/bid/deletes', job.deletesBid)

    app.post('/review/set', job.setReview)
    app.post('/review/get', job.getReview)

     
   
 

};
