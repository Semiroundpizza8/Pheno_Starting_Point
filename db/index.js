const {Client} = require('pg');
const CONNECTION_STRING = "postgres://localhost:5432/phenomena-dev";
const client = new Client(CONNECTION_STRING);

/**
 * Report Related Methods
 */

async function getOpenReports() {
  try {
    const {rows: reports} = await client.query(`
      SELECT *
      FROM reports
      WHERE "isOpen"=true;
    `);
    
    const {rows: comments} = await client.query(`
      SELECT *
      FROM comments
      WHERE "reportId" IN (${reports.map(report => report.id).join(', ')});
    `);
    
    reports.map(report => {
      if (Date.parse(report.expirationDate) < new Date()) {
        report.isExpired = true;
      } else {
        report.isExpired = false;
      };

      report.comments = [];
      comments.map(comment => {
        if (comment.reportId === report.id) {
          report.comments = [...report.comments, comment];
        };
      })

      delete report.password;
    })

    return reports;  
  } catch (error) {
    throw error;
  }
}

async function createReport(reportFields) {
  const {
    title,
    location,
    description,
    password
  } = reportFields;

  try {
    const {rows: [report]} = await client.query(`
      INSERT INTO
      reports(title, location, description, password)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [title, location, description, password]); 

    delete report.password;

    return report;
  } catch (error) {
    throw error;
  }
}

async function _getReport(reportId) {
  try {
    const {rows: [report]} = await client.query(`
      SELECT * FROM reports
      WHERE id=$1;
    `, [reportId])
    
    return report;
  } catch (error) {
    throw error;
  }
}

async function closeReport(reportId, password) {
  try {
    const report = await _getReport(reportId);

    if (!report) {
      throw Error('Report does not exist with that id');  
    } 
    if (password !== report.password) {
      throw Error('Password incorrect for this report, please try again');  
    }
    if (report.isOpen === false) {
      throw Error('This report has already been closed');  
    }

    await client.query(`
      UPDATE reports
      set "isOpen"=false
      WHERE id=$1;
    `, [reportId]);

    return { message: "Report successfully closed!" };
  } catch (error) {
    throw error;
  }
}

/**
 * Comment Related Methods
 */

async function createReportComment(reportId, commentFields) {
  //const content = commentFields.content;

  try {
    const report = await _getReport(reportId);

    if (!report) {
      throw Error('That report does not exist, no comment has been made');
    }
    if (report.isOpen === false) {
      throw Error('That report has been closed, no comment has been made');
    }
    if (Date.parse(report.expirationDate) < new Date()) {
      throw Error('The discussion time on this report has expired, no comment has been made');
    }

    const {rows: [comment]} = await client.query(`
      INSERT INTO comments("reportId", content)
      VALUES ($1, $2)
      RETURNING *;
    `, [reportId, commentFields.content]);

    await client.query(`
      UPDATE reports
      set "expirationDate"=CURRENT_TIMESTAMP + interval '1 day'
      WHERE id=$1;
    `, [reportId]);

    return comment;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  createReport,
  createReportComment,
  getOpenReports,
  closeReport,
  _getReport,
}
