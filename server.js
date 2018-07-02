const express = require('express')
const lambda = require('./index.js')

const app = express()

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true })); 

app.use(express.static('frontend'))


app.post('/lambda', (req, res) => {

	var startDate = req.body.startDate
	var endDate = req.body.endDate

	lambda.handler({
		startDate: startDate,
		endDate: endDate
	}, {
		succeed: function(response) {
			res.status(response.status || 200).send(response.body)
		}
	}, {

	})
})

var port = process.argv[2];

console.log(port)

app.listen(port || 8080, () => console.log('Example app listening on port ' + (port || 8080) + '!'))