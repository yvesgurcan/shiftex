import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import apiRequestHandler from './../apiRequestHandler'
import View from './web/View'
import FormGroup from './web/FormGroup'
import Button from './web/Button'

const mapStateToProps = (state, ownProps) => {
  return {
    ...state
  }
}

class ShiftComponent extends Component {
  state = {}
  componentDidMount = () => {
    this.mounted = true
    const { shift, timetracking } = this.props
    const { end } = shift || {}
    if (!end) {
      const { day } = timetracking || {}
      if (moment(day).isSame(moment(), 'day')) {
        this.setState({ ongoingEnd: moment() })
        const millisecondsToNextMinute = moment.duration(moment().endOf('minute').diff(moment())).asMilliseconds()
        this.timeout = setTimeout(this.firstUpdateActiveTimer, millisecondsToNextMinute)  
      }
    }

  }

  firstUpdateActiveTimer = () => {
    this.updateActiveTimer()
    this.interval = setInterval(this.updateActiveTimer, 60000)
  }

  updateActiveTimer = () => {
    if (this.mounted) {
      let ongoingEnd = moment()
      this.setState({ ongoingEnd })
      if (!this.state.updatedEnd) {
        this.props.dispatch({ type: 'UPDATE_SHIFT' })
      }
    }
  }
  
  calcDiff = (reference) => {
    const { day } = this.props.timetracking || {}
    const { shift } = this.props || {}
    const { start, end } = shift
    const { updatedStart, updatedEnd } = this.state || {}
    
    if (!updatedStart && !start) {
      return '-'
    }

    if (!end && !updatedEnd && moment().isAfter(moment(day).endOf('day'))) {
      return '-'
    }

    const diff = moment.duration(moment(reference).diff(moment(updatedStart || start)))

    if (diff < 0) {
      return '-'
    }

    return moment.utc(diff.asMilliseconds()).format('H:mm')
  }

  updateShift = (input, watchTimer) => {
    const { shift, timetracking, invalidDailyTotal } = this.props
    const { day } = timetracking || {}
    let { name, value, resume } = input
    const formattedDay = moment(day).format('YYYY-MM-DD')

    let newValue
    let state = {...this.state}
    if (name === 'updatedClient' || name === 'updatedProject' || name === 'updatedRole') {
      newValue = value
    }
    else {
      if (!value && !resume) {
        state.startShift = false
        name = 'updatedEnd'
        newValue = moment(day).hours(moment().format('HH')).minutes(moment().format('mm')).format('YYYY-MM-DD HH:mm')
      }
      else if (resume) {
        name = 'updatedEnd'
        newValue = null
      }
      else {
        newValue = moment(`${formattedDay} ${value}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm')
      }

    }

    state[name] = newValue
    this.setState(state, () => {
      const { updatedEnd, updatedStart } = this.state || {}
      this.calcDiff(updatedEnd)
      let key = name.replace('updated','')
      key = key[0].toLowerCase() + key.substring(1)
      let updateShift = {
        shiftId: shift.shiftId,
        [key]: newValue,
      }

      if (watchTimer) {
        this.firstUpdateActiveTimer()
        updateShift = {
          ...updateShift,
          start: state.updatedStart,
        }
      }
      else {
        let diff
        if (name === 'updatedEnd') {
          diff = moment.duration(moment(newValue).diff(moment(updatedStart || shift.start))).asMilliseconds()
        }
        else if (name === 'updatedStart') {
          diff = moment.duration(moment(updatedEnd || shift.end).diff(moment(newValue))).asMilliseconds()
        }

        if (resume || diff >= 0 || (name !== 'updatedStart' && name !== 'updatedEnd')) {
          this.props.dispatch({ type: 'UPDATE_SHIFT', shiftId: shift.shiftId, name: key, value: newValue})
          invalidDailyTotal(false)
          apiRequestHandler(
            'put',
            'shifts',
            { updateShift },
          )
        }
        else if (newValue) {
          invalidDailyTotal(true)
        }

      }


    })

  }

  resumeShift = () => {
    const { updateShift, firstUpdateActiveTimer, props, state } = this
    const { shift } = props
    const { start } = shift || {}
    const { updatedStart } = state || {}
    this.setState({startShift: true })
    if (!start && !updatedStart) {
      updateShift({name: 'updatedStart', value: moment().format('YYYY-MM-DD HH:mm')}, true)
    }
    else {
      updateShift({name: 'updatedEnd', value: null, resume: true})
      this.setState({ ongoingEnd: moment(), startShift: true })
      const millisecondsToNextMinute = moment.duration(moment().endOf('minute').diff(moment())).asMilliseconds()
      this.timeout = setTimeout(firstUpdateActiveTimer, millisecondsToNextMinute)  
    }

  }

  deleteShift = () => {
    const { shift } = this.props
    this.props.dispatch({ type: 'DELETE_SHIFT', shiftId: shift.shiftId})
    apiRequestHandler(
      'delete',
      'shifts',
      { deleteShift: {shiftId: shift.shiftId} },
      this.props.handleDeleteShiftResponse
    )
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  hasStarted = () => {
    const { shift } = this.props || {}
    const { start } = shift || {}
    const { updatedStart } = this.state || {}
    return start || updatedStart
  }

  hasNotStarted = () => {
    const { shift } = this.props || {}
    const { start } = shift || {}
    const { updatedStart } = this.state || {}
    return !start && !updatedStart
  }

  hasEnded = () => {
    const { shift } = this.props || {}
    const { end } = shift || {}
    const { updatedEnd } = this.state || {}
    return end || updatedEnd
  }

  hasNotEnded = () => {
    const { shift } = this.props || {}
    const { end } = shift || {}
    const { updatedEnd } = this.state || {}
    return !end && !updatedEnd
  }

  render () {
    const {
      shift,
      timetracking,
    } = this.props
    const {
      day
    } = timetracking || {}
    const {
      client,
      project,
      role,
      start,
      end,
    } = shift
    const {
      updatedClient,
      updatedProject,
      updatedRole,
      updatedStart,
      updatedEnd,
      ongoingEnd,
      startShift,
    } = this.state || {}
    const {
      updateShift,
      resumeShift,
      deleteShift,
      calcDiff,
      hasStarted,
      hasNotStarted,
      hasEnded,
      hasNotEnded,
    } = this || {}
    const today = moment().startOf('day').format('YYYY-MM-DD')
    return (
      <View className='shiftGrid'>
        <FormGroup
          name='updatedClient'
          placeholder='Enter client name'
          value={updatedClient || client}
          onChange={updateShift}
          onPressEnter={updateShift}
        />
        <FormGroup
          name='updatedProject'
          placeholder='Enter project'
          value={updatedProject || project}
          onChange={updateShift}
          onPressEnter={updateShift}
        />
        <FormGroup
          name='updatedRole'
          placeholder='Enter your role'
          value={updatedRole || role}
          onChange={updateShift}
          onPressEnter={updateShift}
        />
        <FormGroup
          name='updatedStart'
          type='time'
          value={updatedStart && moment(updatedStart).isValid() ? moment(updatedStart).format('HH:mm') : start ? moment(start).format('HH:mm') : undefined}
          onChange={updateShift}
          onPressEnter={updateShift}
        />
        <FormGroup
            name='updatedEnd'
            type='time'
            value={updatedEnd === null ? undefined : updatedEnd && moment(updatedEnd).isValid() ? moment(updatedEnd).format('HH:mm') : end ? moment(end).format('HH:mm') : undefined}
            onChange={updateShift}
            onPressEnter={updateShift}
          />
        <View>
          {calcDiff(updatedEnd || end || ongoingEnd)}
        </View>
        <RunningTimer start={(hasStarted() && hasNotEnded()) || startShift} />
        <Button hidden={(hasEnded() || hasNotStarted()) && !startShift} onClick={updateShift} className='stop'>Stop</Button>
        <View hidden={(hasStarted() && hasNotEnded()) || startShift}>
          <Button hidden={!moment(today).isSame(moment(day).format('YYYY-MM-DD'))} onClick={resumeShift} className='start'>Start</Button>
        </View>
        <Button onClick={deleteShift} className='delete'>Delete</Button>
      </View>
    )
  }
}

export default connect(mapStateToProps)(ShiftComponent)

class RunningTimer extends Component {
  render () {
    const { start } = this.props
    return (
      <View className='timerContainer desktop'>
        <View className='timer' style={{animation: start && 'fullRotation 5s linear infinite'}}/>
      </View>
    )
  }
}