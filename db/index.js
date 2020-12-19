const {Client} = require('pg');
const CONNECTION_STRING = "postgres://localhost:5432/phenomena_dev";
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

    if (report.length === 0) {
      throw `"report with id: '${reportId}' does not exist`;  
    } else if (password !== report.password) {
      throw "password does not match";
    } else if (report.isOpen === false) {
      throw "report is already closed";
    } else {
      await client.query(`
        UPDATE reports
        set "isOpen"=false
        WHERE id=$1;
      `, [reportId]);



      return { message: "Report successfully closed!" };
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Comment Related Methods
 */

async function createReportComment(reportId, commentFields) {
  const content = commentFields.content;

  try {
    const report = await _getReport(reportId);

    if (report.length === 0) {
      throw "report not found"
    } else if (report.isOpen === false) {
      throw "report is not open"
    } else if (Date.parse(report.expirationDate) < new Date()) {
      throw "report is expired"
    } else {
      const {rows: [comment]} = await client.query(`
        INSERT INTO comments("reportId", content)
        VALUES ($1, $2)
        RETURNING *;
      `, [reportId, content]);

      await client.query(`
        UPDATE reports
        set "expirationDate"=CURRENT_TIMESTAMP + interval '1 day'
        WHERE id=$1;
      `, [reportId]);

      return comment;
    }
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
}