import { combineReducers } from 'redux'
import moment from 'moment'

function timetracking (state = {}, action) {

  let newState = {...state}

  switch (action.type) {
    default:
      break
    
    case 'STORE_SHIFT_DAY': {
      newState = {
        ...state,
        day: action.day,
      }
      break
    }

    case 'STORE_SHIFTS': {
      newState = {
        ...state,
        shifts: [...action.shifts],
        dailyTotals: [...action.dailyTotals],
      }

      break
    }

    case 'ADD_SHIFT': {
      const day = moment(state.day)
      const updatedShifts = [...state.shifts, {
        shiftId: action.tempShiftId,
        day: day.format('YYYY-MM-DD'),
        start: action.start,
        end: action.end,
      }]
      newState = {
        ...state,
        shifts: updatedShifts,
      }
      break
    }

    case 'STORE_NEW_SHIFT_ID': {
      let updatedShifts = state.shifts.map(shift => {
        let updatedShift = {...shift}
        if (updatedShift.shiftId === action.tempShiftId) {
          updatedShift.shiftId = action.newShiftId
        }

        return updatedShift
      })

      newState = {
        ...state,
        shifts: updatedShifts,
      }

      break
    }

    case 'UPDATE_SHIFT': {
      let shifts = [...state.shifts]
      if (action.name && action.value) {
        shifts = [...state.shifts].map(shift => {
          let augmentedShift = {...shift}
          if (shift.shiftId === action.shiftId) {
            augmentedShift = {
              ...augmentedShift,
              [action.name]: action.value,
            }
          }
          
          return augmentedShift
        })  
      }

      const dailyTotals = [...state.dailyTotals].map(dailyTotal => {
        let recalculatedDailyTotal = {...dailyTotal}
        if (dailyTotal.day === state.day) {
          recalculatedDailyTotal = {
            ...recalculatedDailyTotal,
            total: [...shifts].map(shift => {
              if (!shift.end) {
                return moment.duration(moment().diff(moment(shift.start))).asMinutes()
              }
              return moment.duration(moment(shift.end).diff(moment(shift.start))).asMinutes()
            }).reduce((sum, value) => sum + value),
          }
        }
        return recalculatedDailyTotal
      })

      newState = {
        ...state,
        shifts,
        dailyTotals,
      }

      break
    }

    case 'DELETE_SHIFT': {
      const shifts = [...state.shifts].filter(shift => shift.shiftId !== action.shiftId)
      newState = {
        ...state,
        shifts,
      }

      break
    }

  }


  return newState
}

export default combineReducers({
  timetracking,
})