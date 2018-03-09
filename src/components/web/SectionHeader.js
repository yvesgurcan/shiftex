import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class SectionHeader extends Component {
  render () {
    return (
      <h2 {...this.props}>{this.props.children}</h2>
    )  
  }
}

SectionHeader.propTypes = {
  children: PropTypes.any.isRequired,
}