import React, { Component } from 'react'

export default class View extends Component {
  render () {
    const { style, children, onClick, hidden } = this.props
    return (
      <div children={children} onClick={onClick} hidden={hidden} style={style}/>
    )  
  }
}