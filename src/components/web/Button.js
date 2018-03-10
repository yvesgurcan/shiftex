import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class ButtonComponent extends Component {
  render () {
    const {
      style,
      className,
      children,
      disabled,
      title,
      hidden,
      onClick,
    } = this.props
    return (
      <button
        className={className}
        disabled={disabled}
        hidden={hidden}
        children={children}
        title={title}
        onClick={onClick}
        style={style}
      />
    )
  }
}

ButtonComponent.propTypes = {
  children: PropTypes.any.isRequired,
  onClick: PropTypes.func.isRequired,
}