import React, { Component } from 'react'
import { connect } from 'react-redux'



const mapStateToProps = (state, ownProps) => {
  return {
    ...state
  }
}

class App extends Component {
  render () {
    console.log(this.props)
    return (
      <div>
        test
      </div>
    )
  }
}

export default connect(mapStateToProps)(App)