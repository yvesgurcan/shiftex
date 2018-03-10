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

const transformArrayIntoOptions = function (list, keys) {
  return (list || []).filter(item => item).map(item => ({value: item[keys.value], label: item[keys.label], object: item}))
}

class ShiftComponent extends Component {
  state = {}
  componentDidMount = () => {
    this.mounted = true
    const { shift } = this.props || {}
    const { end } = shift || {}
    if (!end) {
      const { day } = this.props.timetracking || {}
      if (moment(day).isSame(moment(), 'day')) {
        this.setState({ ongoingEnd: moment() })
        const millisecondsToNextMinute = moment.duration(moment().endOf('minute').diff(moment())).asMilliseconds()
        this.timeout = setTimeout(this.firstUpdateActiveTimer, millisecondsToNextMinute)  
      }
    }

  }

  firstUpdateActiveTimer = () => {
    console.log('firstUpdateActiveTimer')
    this.updateActiveTimer()
    this.interval = setInterval(this.updateActiveTimer, 60000)
  }

  updateActiveTimer = () => {
    console.log('updateActiveTimer')
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
    
    const { day } = this.props.timetracking || {}
    const { shift } = this.props || {}
    
    const formattedDay = moment(day).format('YYYY-MM-DD')
    let state = {...this.state}
    let { name, value, resume } = input
    if (!value && !resume) {
      this.setState({startShift: false })
      name = 'updatedEnd'
      if (moment().isAfter(moment(day).endOf('day'))) {
        const { scheduleEnd } = this.props.settings || {}
        if (scheduleEnd) {
          value = scheduleEnd
        }
        else {
          value = '23:59'
        }
      }
      else {
        value = moment().format('HH:mm')
      }
    }
    

    let newValue
    if (resume) {
      newValue = null
    }
    else {
      newValue = moment(`${formattedDay} ${value}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm')
    }
    state[name] = newValue
    this.setState(state, () => {
      const { updatedEnd } = this.state || {}
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

      apiRequestHandler(
        'put',
        'shifts',
        { updateShift },
        this.props.session,
      )
    })


  }

  resumeShift = () => {
    const { updateShift, state } = this || {}
    const { shift } = this.props || {}
    const { start } = shift || {}
    const { updatedStart } = state || {}
    this.setState({startShift: true })
    if (!start && !updatedStart) {
      updateShift({name: 'updatedStart', value: moment().format('YYYY-MM-DD HH:mm')}, true)
    }
    else {
      updateShift({name: 'updatedEnd', value: null, resume: true})
      this.setState({ ongoingEnd: moment() })
      const millisecondsToNextMinute = moment.duration(moment().endOf('minute').diff(moment())).asMilliseconds()
      this.timeout = setTimeout(this.firstUpdateActiveTimer, millisecondsToNextMinute)  
    }

  }

  deleteShift = () => {
    const { shift } = this.props || {}
    this.props.dispatch({ type: 'DELETE_SHIFT', shiftId: shift.shiftId})
    apiRequestHandler(
      'delete',
      'shifts',
      { deleteShift: {shiftId: shift.shiftId} },
      this.props.session,
      this.props.handleDeleteShiftResponse
    )
  }

  handleDeleteShiftResponse = () => {
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
    const { shift, timetracking } = this.props
    const mobile = false
    const shiftTypes = []
    const { day } = timetracking || {}
    const { shiftTypeId, start, end } = shift
    const { updatedStart, updatedEnd, ongoingEnd, startShift } = this.state || {}
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
        <View>
          <FormGroup
            name='shiftTypeName'
            value={shiftTypeId}
            options={transformArrayIntoOptions(shiftTypes, {value: 'shiftTypeId', label: 'shiftTypeName'})}
            onChange={updateShift}
          />
        </View>
        <View>
          <FormGroup
            name='updatedStart'
            type='time'
            value={updatedStart && moment(updatedStart).isValid() ? moment(updatedStart).format('HH:mm') : start ? moment(start).format('HH:mm') : undefined}
            onChange={updateShift}
            onPressEnter={updateShift}
          />
        </View>
        <View>
          <FormGroup
              name='updatedEnd'
              type='time'
              value={updatedEnd === null ? undefined : updatedEnd && moment(updatedEnd).isValid() ? moment(updatedEnd).format('HH:mm') : end ? moment(end).format('HH:mm') : undefined}
              onChange={updateShift}
              onPressEnter={updateShift}
            />
        </View>
        <View>
          {calcDiff(updatedEnd || end || ongoingEnd)}
        </View>
        <View>
          <RunningTimer start={(hasStarted() && hasNotEnded()) || startShift} />
        </View>
        <View hidden={(hasEnded() || hasNotStarted()) && !startShift}>
          <Button onClick={updateShift} className='stop'>Stop</Button>
        </View>
        <View hidden={(hasStarted() && hasNotEnded()) || startShift}>
          <Button hidden={!moment(today).isSame(moment(day).format('YYYY-MM-DD'))} onClick={resumeShift} className='start'>Start</Button>
        </View>
        <View>
          <Button onClick={deleteShift} className='delete'>Delete</Button>
        </View>
      </View>
    )
  }
}

export default connect(mapStateToProps)(ShiftComponent)

class RunningTimer extends Component {
  render () {
    const { start } = this.props
    return (
      <View className='timerContainer'>
        <View className='timer' style={{animation: start && 'fullRotation 5s linear infinite'}}/>
      </View>
    )
  }
}