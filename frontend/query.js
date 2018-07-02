const URI = '/lambda';

$( document ).ready(function() {

  $( 'img.loadingGIF' ).hide();
  console.log('loaded!');

  // set start and end dates for easy use
  let startDate = moment().subtract(30, 'days'),
      endDate = moment();

  // initialize data table
  let table = $( 'table.orderTable' ).DataTable({
    paging: true,
    pageLength: 50,
    columns: [
      { title: 'created_at', data: 'created_at' },
      { title: 'order_number', data: 'order_number' },
      { title: 'quantity', data: 'quantity' },
      { title: 'product_name', data: 'product_name' },
      { title: 'calculated_amount', data: 'calculated_amount' },
      { title: 'total_calculated_amount', data: 'total_calculated_amount' },
      { title: 'total_paid_amount', data: 'total_paid_amount' },
      { title: 'payment_method', data: 'payment_method' },
      { title: 'psp_txn_id', data: 'psp_txn_id' },
      { title: 'psp_type', data: 'psp_type' },
      { title: 'payment_date', data: 'payment_date' },
      { title: 'psp_payer_name', data: 'psp_payer_name' },
      { title: 'psp_payer_email', data: 'psp_payer_email' },
      { title: 'customer_id', data: 'customer_id' },
      { title: 'status', data: 'status' },
    ]
  });
  createDataTable(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));

  // initialize date range picker
  $('input[name="daterange"]').daterangepicker({
    startDate: startDate,
    endDate: endDate

  }, function(start, end, label) {
    console.log('Getting order data from api');
    createDataTable(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));

  });

  // export to csv link
  $( 'a.exportCSV' ).click((event) => {
    let data = '';
    
    // format data from table rows
    table.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
      let rowData = this.data();
      let cellData = Object.keys(rowData).map((key) => {return rowData[key]});
      data += cellData.join(',') + '\r\n';
    });

    downloadCSV(data, 'order-data.csv');
  });

  function createDataTable(startDate, endDate) {
    $( 'img.loadingGIF' ).show();
    
    $.ajax({
      url: URI, 
      type: 'post',
      data: {'startDate': startDate, 'endDate': endDate}, 
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      crossDomain: true,
      contentType: 'application/json',
      dataType: 'json',
      success: (data) => {
        console.log('in success');

        table.rows().remove().draw();
        table.rows.add(data).draw(); 

        $( 'img.loadingGIF' ).hide();
      },
      error: (data) => {
        $( 'img.loadingGIF' ).hide();

        console.error('Error retrieving api data');
        console.log(data);
      }
    });
  }

  function downloadCSV(data, filename) {
    if (data == null) return;
    console.log(data);

    if (!data.match(/^data:text\/csv/i)) {
        data = 'data:text/csv;charset=utf-8,' + data;
    }
    data = encodeURI(data);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  }
  
});