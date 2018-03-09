import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import apiRequestHandler from './../apiRequestHandler'
import Link from './web/Link'
import View from './web/View'
import Text from './web/Text'
import SectionHeader from './web/SectionHeader'
import ShiftNav from './ShiftNav'
import ShiftsTable from './ShiftsTable'

const mapStateToProps = (state, ownProps) => {
  return {
    ...state
  }
}

const setWindowTitle = () => {
  // document.title = ''
}

class App extends Component {
  componentWillMount = () => {
    const { year, month, day } = this.props.match.params
    let start = undefined
    let inputDate = undefined
    if (year && month && day) {
      inputDate = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD').format('YYYY-MM-DD')
      start = inputDate
    }
    else {
      start = moment().format('YYYY-MM-DD')
      this.setUrl()
    }

    this.props.dispatch({type: "STORE_SHIFT_DAY", day: start})
    this.getShifts(start)

    apiRequestHandler(
      'get',
      'settings',
      {},
      this.props.session,
      this.storeSettings,
    )

  }

  setUrl = () => {
    const { review } = this.props || {}
    let start = undefined
    let inputDate = undefined
    if (window.history.pushState) {
      if (!start || inputDate !== start) {
        start = moment()
        const { routes } = this.props.environment || {}
        const controller = window.history.pushState('','',`/${moment(start).format('YYYY/M/D')}`)
  
      }
      
    }
  }

  storeSettings = (response) => {
    this.props.dispatch({ type: 'STORE_SETTINGS', settings: {...response.settings} })
  }

  getShifts = (date) => {
    const day = moment(date).format('YYYY-MM-DD')
    apiRequestHandler(
      'get',
      'shifts',
      { day },
      this.props.session,
      this.storeShifts
    )
  }

  storeShifts = (response) => {
    if (response.feedback.status === 'success') {
      this.props.dispatch({
        type: 'STORE_SHIFTS',
        shifts: response.shifts,
        dailyTotals: response.dailyTotals,
      })
    }
  }

  setToToday = () => {
    this.componentWillMount()
  }

  render () {
    const {
      getShifts,
    } = this
    const {
      timetracking,
    } = this.props || {}
    let { day, dailyTotals } = timetracking
    const mainHeader = `${moment(day, 'YYYY-MM-DD').format('dddd, MMMM D')}`
    setWindowTitle()
    return (
      <View>
        <View>
          <View/>
          <View>
            <Text>Total: {dailyTotals ? moment.utc(moment.duration(dailyTotals.map(dailyTotal => dailyTotal.total).reduce((sum, value) => sum + value)) * 60 * 1000).format('HH:mm') : '00:00'} | </Text>
            <Link onClick={this.setToToday}>Today</Link>
          </View>
        </View>        
        <ShiftNav getShifts={getShifts} />
        <SectionHeader>{mainHeader}</SectionHeader>
        <View>{dailyTotals ? moment.utc(dailyTotals.filter(dailyTotal => dailyTotal.day === moment(day).format('YYYY-MM-DD'))[0].total * 60 * 1000).format('HH:mm') : '00:00'}</View>
        <ShiftsTable />
      </View>
    )  
  }
}

export default connect(mapStateToProps)(App)