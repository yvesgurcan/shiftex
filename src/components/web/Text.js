import React, { Component } from 'react'

export default class Text extends Component {
  render () {
    const { style, children, hidden, onClick } = this.props
    return (
      <span children={children} hidden={hidden} onClick={onClick} style={style}/>
    )  
  }
}