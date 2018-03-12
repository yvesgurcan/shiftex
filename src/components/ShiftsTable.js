import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import apiRequestHandler from './../apiRequestHandler'
import View from './web/View'
import Link from './web/Link'
import Shift from './Shift'

const mapStateToProps = (state, ownProps) => {
  return {
    ...state
  }
}

class ShiftsTableComponent extends Component {
  addShift = () => {
    const { getNewShiftTime } = this
    const { day } = this.props.timetracking || {}
    const { scheduleStart, scheduleEnd } = this.props.settings || {}
    const tempShiftId = 'newShift' + Math.random()
    const start = getNewShiftTime(scheduleStart)
    const end = getNewShiftTime(scheduleEnd, true)
    this.props.dispatch({
      type: 'ADD_SHIFT',
      tempShiftId,
      start,
      end,
    })
    apiRequestHandler(
      'post',
      'shifts',
      { day, start, end },
      this.props.session,
      (response) => this.updateNewShiftId(response, tempShiftId)
    )
  }

  getNewShiftTime = (referenceTime, openEnded) => {
    const { day } = this.props.timetracking || {}

    if (moment(day, 'YYYY-MM-DD').isSame(moment(), 'day')) {
      if (openEnded) {
        return undefined
      }
      else {
        const date = (
          moment(`
          ${moment(day).format('YYYY')}-
            ${moment(day).format('MM')}-
            ${moment(day).format('DD')} 
            ${moment().format('HH')}:
            ${moment().format('mm')}
            `, 'YYYY-MM-DD HH:mm')
            .format('YYYY-MM-DD HH:mm')
        )
        return date
      }
      
    }
    else {
      return `${day} ${referenceTime}`
    }
    
  }

  updateNewShiftId = (response, tempShiftId) => {
    if (response.feedback.status === 'success') {
      this.props.dispatch({
        type: 'STORE_NEW_SHIFT_ID',
        tempShiftId,
        newShiftId: response.newShiftId,
      })  
    }
  }

  render () {
    const { shifts } = this.props.timetracking || {}
    return (
      <View>
        <View>
        {
          (shifts || []).map(shift =>
            <Shift
              key={shift.shiftId}
              shift={shift}
            />
          )
        }
        </View>
        <Link className='addTimer' onClick={this.addShift}>Add Timer</Link>
      </View>
    )
  }
}

export default connect(mapStateToProps)(ShiftsTableComponent)