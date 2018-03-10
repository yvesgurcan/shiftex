import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Link extends Component {
  render () {
    const {
      children,
      href,
      target,
      style,
      onClick,
      className,
    } = this.props
    return (
      <a
        className={className}
        href={href}
        target={target}
        onClick={onClick}
        style={style}
      >{children}</a>
    )  
  }
}

Link.propTypes = {
  href: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
}