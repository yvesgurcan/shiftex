import React, { Component } from 'react'

export default class View extends Component {
  render () {
    const {
      style,
      children,
      onClick,
      hidden,
      className,
    } = this.props
    return (
      <div
        children={children}
        className={className}
        onClick={onClick}
        hidden={hidden}
        style={style}
      />
    )  
  }
}