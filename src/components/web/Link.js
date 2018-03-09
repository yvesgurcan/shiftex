import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Link extends Component {
  state = {}
  // state = {linkStyle: this.props.environment.styles.link}
  onHover = () => {
    // this.setState({linkStyle: styles.linkHover})
  }
  restoreLinkStyle = () => {
    // this.setState({linkStyle: styles.link})
  }
  render () {
    const { children, href, target, style, onClick } = this.props
    const { state, onHover, restoreLinkStyle } = this
    return (
      <a href={href} target={target} onMouseEnter={onHover} onMouseLeave={restoreLinkStyle} onClick={onClick} style={{...style, ...state.linkStyle}}>{children}</a>
    )  
  }
}

Link.propTypes = {
  href: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
}