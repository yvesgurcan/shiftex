import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Label extends Component {
  render () {
    const { styles } = this.props.environment
    const { children } = this.props
    return (
      <label children={children} style={{...styles.label, ...this.props.style}}/>
    )  
  }
}

Label.propTypes = {
  children: PropTypes.any.isRequired,
}