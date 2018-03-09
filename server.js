const express = require('express')
const server = express()
const bodyParser = require('body-parser')
const moment = require('moment')

// note: nested objects in GET/DELETE queries are stringified. use JSON.parse() to convert them back to objects.
server.use(bodyParser.json({extended: true}))
server.use(bodyParser.urlencoded({extended: true}))

// config
const port = 5000
const supportedMethods = ['get','post','put','delete']
const requireAuth = true

// init ids
let shiftId = 0

// you can create a mock database in the form of a JSON object here
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

    const shifts = global.shifts.filter(shift => !shift.deleted && moment(shift.start).isAfter(moment(parameters.day).startOf('day')) && moment(shift.start).isBefore(moment(parameters.day).endOf('day'))).sort((a, b) => moment(a.start).isAfter(moment(b.start)) ? 1 : moment(a.start).isBefore(moment(b.start)) ? -1 : 0)


    let weekOf = null
    if (moment(parameters.day).format('d') === '0') {
      weekOf = moment(parameters.day).subtract(1, 'day').startOf('week').add(1, 'day').format('YYYY-MM-DD')
    }
    else {
      weekOf = moment(parameters.day).startOf('week').add(1, 'day').format('YYYY-MM-DD')
    }

    // get shifts of the week
    const weekShifts = global.shifts.filter(shift => {
      const isAfter = moment(shift.day).isAfter(moment(weekOf)) || moment(shift.day).isSame(moment(weekOf), 'day')
      const isBefore = moment(shift.day).isBefore(moment(weekOf).add(7, 'days')) || moment(shift.day).isSame(moment(weekOf).add(7, 'days'), 'day')
      return !shift.deleted && isAfter && isBefore
    })

    let dailyTotals = []
    for (let i = 0; i < 7; i++) {
      let ongoing = false
      const day = moment(weekOf).add(i, 'days')
      const shiftDurations = weekShifts.filter(shift => !shift.deleted && moment(shift.start).isSame(day, 'day')).map(shift => {
        if (!shift.end) {
          ongoing = true
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
      clientId: parameters.user.clientId,
      userId: parameters.user.userId,
      day: parameters.day,
      start: parameters.start,
      end: parameters.end,
    }

    global.shifts = [...global.shifts, newShift]

    console.log(newShift)

    return { shiftId, feedback: { status: 'success'} }

  }
)

endpointWrapper(
  'put',
  '/shifts',
  (req, res, parameters) => {

   // get shift
    const shift = global.shifts.filter(shift => !shift.deleted && shift.clientId === parameters.user.clientId && shift.shiftId === parameters.updateShift.shiftId)

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