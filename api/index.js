// Build an apiRouter using express Router
const express = require('express');
const apiRouter = express.Router();

// Import the database adapter functions from the db
const {getOpenReports, createReport, closeReport, createReportComment} = require('../db')
/**
 * Set up a GET request for /reports
 * 
 * - it should use an async function
 * - it should await a call to getOpenReports
 * - on success, it should send back an object like { reports: theReports }
 * - on caught error, call next(error)
 */

apiRouter.get('/reports', async (req, res, next) =>{
    try{
        console.log("attempting to run getOpenReports");
const reports = await getOpenReports();
console.log("reposrts here!!!!!", reports)

res.send({
    reports
});
    }
    catch(error){
        next(error)
    }
})



/**
 * Set up a POST request for /reports
 * 
 * - it should use an async function
 * - it should await a call to createReport, passing in the fields from req.body
 * - on success, it should send back the object returned by createReport
 * - on caught error, call next(error)
 */

//  apiRouter.post('/reports', async (req, res, next) => {
//      const {title, location, description, password} = req.body
//      try{
//          const reports = await createReport(title, location, description, password);

//          res.send({
//              reports
//          }); 
//      }catch(error){
//         next(error)
//      }
//  });
apiRouter.post('/reports', async (req, res, next) => {
    console.log(req.body)
    console.log('hitting route for creating post')
    // if (!req.body) {
    //   return res.sendStatus(404)
    // }
    try {
      const newReport = await createReport(req.body)
      console.log("report body", req.body)
     // res.setHeader('content-type', 'application/json')
      res.send(
        newReport
      )
    } catch (error) {
      next(error)
    }
  })



/**
 * Set up a DELETE request for /reports/:reportId
 * 
 * - it should use an async function
 * - it should await a call to closeReport, passing in the reportId from req.params
 *   and the password from req.body
 * - on success, it should send back the object returned by closeReport
 * - on caught error, call next(error)
 */
apiRouter.delete('/reports/:reportId', async (req, res, next) => {
    const {reportId} = req.params;

    try {
        const deletedReports = await closeReport(reportId, req.body.password);
        res.send(
            deletedReports
        );
    }catch(error){
        next(error)
    }
})



/**
 * Set up a POST request for /reports/:reportId/comments
 * 
 * - it should use an async function
 * - it should await a call to createReportComment, passing in the reportId and
 *   the fields from req.body
 * - on success, it should send back the object returned by createReportComment
 * - on caught error, call next(error)
 */
apiRouter.post('/reports/:reportId/comments', async (req, res, next) => {
   // const [reportId, commentFields] = req.body;
    console.log("this is req.body", req.body)

    try{
        const {reportId} = req.params
        const newComment = await createReportComment(reportId, req.body)
        res.send(
            newComment
        )
    }catch(error){
        next(error)
    }
});



// Export the apiRouter

module.exports = apiRouter;
