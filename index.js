const mysql = require('mysql');

// in case of weird errors
process.on('uncaughtException', function (error) {
  console.log(error.stack);
});


// date utility
function formatDate(date, subtract=false) {
  let formattedDate = new Date(date);
  if (subtract) {
    formattedDate = formattedDate.setDate(formattedDate.getDate() - 30);  

  } else {
    formattedDate = formattedDate.setDate(formattedDate.getDate() + 30);
  }
  return new Date(formattedDate).toISOString();
}

// initialize db connection
  let pool = mysql.createPool({
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE,
    port     : 3306
  });

// main function
exports.handler = (event, context, callback) => {
  //context.callbackWaitsForEmptyEventLoop = false;
  
  
  
  let query = `
    SELECT 
      DATE_FORMAT(payment_date, "%Y/%m/%d %H:%i:%S") as payment_date,
      order_number, 
      product_name, 
      quantity, 
      status,
      calculated_amount, 
      total_calculated_amount, 
      total_paid_amount,
      payment_method, 
      psp_txn_id, 
      psp_type,
      psp_payer_name, 
      psp_payer_email, 
      customer_id, 
      DATE_FORMAT(created_at, "%Y/%m/%d %H:%i:%S") as created_at
    FROM orders`;

  let args = [];
  if (typeof event.startDate !== 'undefined' && typeof event.endDate !== 'undefined') {
    query += ` WHERE DATE(payment_date) >= ? AND DATE(payment_date) <= ?`;
    args = [event.startDate, event.endDate];

  } else if (typeof event.startDate !== 'undefined') {
    query += ` WHERE DATE(payment_date) >= ? AND DATE(payment_date) <= DATE(?)`;
    args = [event.startDate, formatDate(event.startDate)];

  } else if (typeof event.endDate !== 'undefined') {
    query += ` WHERE DATE(payment_date) >= DATE(?) AND DATE(payment_date) <= ?`;
    args = [formatDate(event.endDate, true), event.endDate];

  } else {
    query += ` WHERE DATE(payment_date) >= DATE(?)`;
    args = [formatDate(new Date(), true)];
  }
  
  console.log('Query: ', query)
  console.log('Args: ', args)

  let response = {
    'statusCode': 200,
    'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    },
    'isBase64Encoded': false
  };
  
  pool.getConnection((err, conn) => {
    if (err) {
      response['statusCode'] = 500;
      response['body'] = err;
      
      if (conn) {
        conn.release();
      }
      
      context.succeed(response)
    } 
    
    conn.query(query, args, (err, results) => {
      console.log('Retrieved ', results.length, ' results');
      
      if (err) {
        console.log(err);
        response['statusCode'] = 500;
        response['body'] = err;
        
        conn.release();
      } else {
        response['body'] = JSON.stringify(results);
        
        conn.release();
        //callback(null, null);
      }
      context.succeed(response);

    });

  });
}
