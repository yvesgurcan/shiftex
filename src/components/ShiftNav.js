import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import View from './web/View'
import Link from './web/Link'
import SectionHeader from './web/SectionHeader'

const mapStateToProps = (state, ownProps) => {
  return {
    ...state
  }
}

class ScheduleWeekNav extends Component {
  getPreviousWeek = () => {
    this.switchToDay(-7)
  }

  getNextWeek = () => {
    this.switchToDay(7)
  }

  switchToDay = (weekdayNumber) => {
    const { day } = this.props.timetracking
    const { getShifts } = this.props
    const newDay = moment(day).subtract(weekdayNumber === '5' ? '1' : '0', 'day').startOf('week').add(1, 'day').add(weekdayNumber, 'day')

    this.props.dispatch({type: "STORE_SHIFT_DAY", day: moment(newDay).format('YYYY-MM-DD')})
    getShifts(newDay)

    if (window.history.pushState) {
      window.history.pushState('','',`/${moment(newDay).format('YYYY/M/D')}`)

    }

  }

  switchToDayMobile = (weekdayNumber, operation) => {
    const { day } = this.props.timetracking
    const { getShifts } = this.props
    let newDay = moment(day).add(
      operation === 'add' && weekdayNumber === '6' ? '-1'
      : operation === 'remove' && weekdayNumber === '0' ? '1'
      : '0', 'day').startOf('week').add(weekdayNumber, 'day')

    this.props.dispatch({type: "STORE_SHIFT_DAY", day: moment(newDay).format('YYYY-MM-DD')})
    getShifts(newDay)

    if (window.history.pushState) {
      window.history.pushState('','',`/${moment(newDay).format('YYYY/M/D')}`)

    }
  }

  weekdaysToArray = () => {
    const { day } = this.props.timetracking
    // FIXME
    const weekStart = moment(day).add((moment(day).format('d') === '0' ? '-1' : '0'), 'day').startOf('week').add(1, 'day')
    let weekdays = []
    for (let i = 0; i < 7; i++) {
      weekdays.push(moment(weekStart).add(i, 'days').format('YYYY-MM-DD'))
    }

    return weekdays
  }

  render () {
    const { mainHeader, dailyTotalIsInvalid, timetracking } = this.props
    const { day, dailyTotals } = timetracking || {}
    const { getPreviousWeek, getNextWeek, switchToDay, switchToDayMobile } = this
    const shiftDateFormat = 'dddd'
    const weekdays = this.weekdaysToArray()
    return (
      <View className='shiftNav'>
        <View>
          <Link className='desktop' onClick={getPreviousWeek}>
          &lt;
          </Link>
          <Link className='mobile' onClick={() => switchToDayMobile(moment(day).subtract(1, 'day').format('d'), 'add')}>
          &lt;
          </Link>
        </View>
        <SectionHeader className='mobile'>{mainHeader}</SectionHeader>
        {weekdays.map(weekday => {
            const matchTotal = (dailyTotals || []).filter(total => moment(total.day).isSame(moment(weekday), 'day'))
            let duration = '0:00'
            let ongoing = false
            if (matchTotal.length > 0) {
              duration = moment.utc(matchTotal[0].total * 60 * 1000).format('HH:mm')
              ongoing = matchTotal[0].ongoing
            }
            return (
              <View key={weekday} className={'desktop ' + (moment(weekday).isSame(moment(day)) ? 'selectedDay' : '')}>
              <Link onClick={() => switchToDay(moment(weekday).subtract(1, 'day').format('d')) }>
                {moment(weekday).format(shiftDateFormat)}
              </Link>
              <View className={ongoing ? 'ongoingTotal' : null}>{moment(weekday).isSame(moment(day)) && dailyTotalIsInvalid ? '-' : duration}</View>
            </View> 
            )
          })
        } 
        <View>
          <Link className='desktop' onClick={getNextWeek}>
          &gt; 
          </Link>
          <Link className='mobile' onClick={() => switchToDayMobile(moment(day).add(1, 'day').format('d'), 'remove')}>
          &gt; 
          </Link>
        </View>
      </View>
    )  
  }
}
export default connect(mapStateToProps)(ScheduleWeekNav)