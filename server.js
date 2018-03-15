const express = require('express')
const server = express()
const bodyParser = require('body-parser')
const moment = require('moment')
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// note: nested objects in GET/DELETE queries are stringified. use JSON.parse() to convert them back to objects.
server.use(bodyParser.json({extended: true}))
server.use(bodyParser.urlencoded({extended: true}))

// api config
const port = 5000
const supportedMethods = ['get','post','put','delete']
const requireAuth = true
// database config
// must be one of: global (default), mongo
const database = 'mongo'
const url = 'mongodb://localhost:27017'
const name = 'myproject'

switch (database) {
  default:
  // you can create a mock database in the form of a JSON object here
  case 'global': {
    let shiftId = 0
    global = {
      shifts: [
        {
          shiftId: ++shiftId,
          day: '2018-02-23',
          start: "2018-02-23 09:00",
          end: "2018-02-23 12:00",
          submitted: false,
          deleted: false,
        },
        {
          shiftId: ++shiftId,
          day: '2018-02-23',
          start: "2018-02-23 13:00",
          submitted: false,
          deleted: false,
        },
        {
          shiftId: ++shiftId,
          day: '2018-02-26',
          start: "2018-02-26 15:00",
          end: "2018-02-26 15:26",
          submitted: false,
          deleted: false,
        },
        {
          shiftId: ++shiftId,
          day: '2018-03-02',
          start: "2018-03-02 06:56",
          submitted: false,
          deleted: false,
        },
        {
          shiftId: ++shiftId,
          day: '2018-02-26',
          start: "2018-02-26 15:10",
          submitted: false,
          deleted: false,
        },
        {
          shiftId: ++shiftId,
          day: '2018-03-01',
          start: "2018-03-01 19:45",
          submitted: false,
          deleted: false,
        },
      ],

    }
    break
  }
  case 'mongo': {
    MongoClient.connect(url, function(err, client) {
      assert.equal(null, err)
      console.log(`Database ${name} connected successfully to server at ${url}.`);
      const db = client.db(name)
    
      client.close()
    })
  }

}

// use endpointWrapper to create a quick mock endpoint
const endpointWrapper = function endpointWrapper (method, resource, apiBody) {
  console.log(`Endpoint: ${method} ${resource}`)
  if (supportedMethods.indexOf(method) === -1) {
    console.error(`Error: Unsupported method '${method}'. The method must be one of the following: '${supportedMethods.join('\', \'')}'.`)
    return false
  }
  else if (!resource) {
    console.error(`Error: You must enter the name of the resource. If you meant to create a resource at the root of the API, please enter '/'.`)
    return false
  }
  else if (!apiBody) {
    console.error(`Warning: The body of the endpoint is not defined. The API will return 'null' when handling requests.`)
  }

  server[method](resource, (req, res) => {
    let parameters = {}
    if (method === 'get' || method === 'delete') {
      parameters = req.query
    }
    else {
      parameters = req.body
    }
    
    console.log(`\n${Date()} - request: ${method} ${resource}\n`, parameters)

    let response = null
    if (!apiBody) {
      res.send(null)
    }
    else {
      response = apiBody(req, res, parameters)
      res.send(response)
    }
    console.log(`\n${Date()} - response:\n`, response)
  })

}

// endpoints
// shifts
endpointWrapper(
  'get',
  '/shifts',
  (req, res, parameters) => {

    let shifts
    switch (database) {
      default:
      case 'global': {
        shifts = global.shifts.filter(shift => !shift.deleted && moment(shift.start).isAfter(moment(parameters.day).startOf('day')) && moment(shift.start).isBefore(moment(parameters.day).endOf('day'))).sort((a, b) => moment(a.start).isAfter(moment(b.start)) ? 1 : moment(a.start).isBefore(moment(b.start)) ? -1 : 0)
        break
      }
      case 'mongo': {
        // TODO (this is taken from https://www.npmjs.com/package/mongodb#insert-a-document)
        const insertDocuments = function(db, callback) {
          // Get the documents collection
          const collection = db.collection('documents');
          // Insert some documents
          collection.insertMany([
            {a : 1}, {a : 2}, {a : 3}
          ], function(err, result) {
            assert.equal(err, null);
            assert.equal(3, result.result.n);
            assert.equal(3, result.ops.length);
            console.log("Inserted 3 documents into the collection");
            callback(result);
          });
        }

        MongoClient.connect(url, function(err, client) {
          assert.equal(null, err)
          console.log(`Database ${name} connected successfully to server at ${url}.`);
          const db = client.db(name)
        
          insertDocuments(db, function() {
            client.close();
          });
        })
      }
    }

    let weekOf = null
    if (moment(parameters.day).format('d') === '0') {
      weekOf = moment(parameters.day).subtract(1, 'day').startOf('week').add(1, 'day').format('YYYY-MM-DD')
    }
    else {
      weekOf = moment(parameters.day).startOf('week').add(1, 'day').format('YYYY-MM-DD')
    }

    // get shifts of the week
    let weekShifts
    switch (database) {
      default:
      case 'global': {
        weekShifts = global.shifts.filter(shift => {
          const isAfter = moment(shift.day).isAfter(moment(weekOf)) || moment(shift.day).isSame(moment(weekOf), 'day')
          const isBefore = moment(shift.day).isBefore(moment(weekOf).add(7, 'days')) || moment(shift.day).isSame(moment(weekOf).add(7, 'days'), 'day')
          return !shift.deleted && isAfter && isBefore
        })
      }
    }

    let dailyTotals = []
    for (let i = 0; i < 7; i++) {
      let ongoing = false
      let ongoingCount = 0
      const day = moment(weekOf).add(i, 'days')
      const shiftDurations = weekShifts.filter(shift => !shift.deleted && moment(shift.start).isSame(day, 'day')).map(shift => {
        if (!shift.end) {
          ongoing = true
          ongoingCount += 1
          if (moment(day).isSame(moment(), 'day')) {
            return moment.duration(moment().diff(moment(shift.start))).asMinutes()
          }
          else {
            return moment.duration(moment(day).endOf('day').diff(moment(shift.start))).asMinutes()
          }
        }
        return moment.duration(moment(shift.end).diff(moment(shift.start))).asMinutes()
      })

      let total = 0
      if (shiftDurations.length > 0) {
        total = shiftDurations.reduce((sum, value) => sum+value)
      }

      dailyTotals.push({
        day: moment(day).format('YYYY-MM-DD'),
        total,
        ongoing,
        ongoingCount,
      })

    }

    return { shifts, dailyTotals, feedback: { status: "success" } }
  }
)

endpointWrapper(
  'post',
  '/shifts',
  (req, res, parameters) => {

    const shiftId = global.shifts.length + 1

    const newShift = {
      shiftId,
      day: parameters.day,
      start: parameters.start,
      end: parameters.end,
    }

    global.shifts = [...global.shifts, newShift]

    return { shiftId, feedback: { status: 'success'} }

  }
)

endpointWrapper(
  'put',
  '/shifts',
  (req, res, parameters) => {

   // get shift
    const shift = global.shifts.filter(shift => !shift.deleted && shift.shiftId === parameters.updateShift.shiftId)

    if (shift.length === 0) {
    return { feedback: { status: 'error', message: 'The shift could not be found.' } }
    }

    const updateShift = {
      ...shift[0],
      ...parameters.updateShift,
    }

    global.shifts = global.shifts.map(shift => {
      if (shift.shiftId === updateShift.shiftId) {
        return updateShift
      }
      return shift
    })

    return { feedback: { status: 'success' } }
  }
)

endpointWrapper(
  'delete',
  '/shifts',
  (req, res, parameters) => {


    const requestShift = JSON.parse(parameters.deleteShift)

    let shiftDeleted = false
    global.shifts = global.shifts.map(shift => {
      let updatedShift = {...shift}
      if (shift.shiftId === requestShift.shiftId) {
        shiftDeleted = true
        updatedShift = {
          ...updatedShift,
          deleted: true,
        }
      }
      return updatedShift
    })

    if (!shiftDeleted) {
      return { feedback: { status: 'error', message: 'The shift could not be found.' } }
    }

    return { feedback: { status: 'success' } }
  }
)

server.listen(port, () => console.log(`\n${Date()} - the API is listening at http://localhost:${port}`))