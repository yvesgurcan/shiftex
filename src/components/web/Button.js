import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class ButtonComponent extends Component {
  state = {style: this.props.environment.styles.button}
  
  componentWillMount = () => {
    const { disabled } = this.props || {}
    if (disabled) {
      const {styles} = this.props.environment || {}
      this.setState({ style: styles.buttonDisabled })
    }
  }

  componentDidMount () {
    this.mounted = true
  }

  componentWillUpdate = (nextProps) => {
    const { style } = this.state
    const {styles} = this.props.environment || {}
    if (this.props.disabled && !nextProps.disabled) {
      if (style !== styles.button) {
        this.setState({style: styles.button})
      }
    }
    else if (!this.props.disabled && nextProps.disabled) {
      if (style !== styles.buttonDisabled) {
        this.setState({style: styles.buttonDisabled})
      }
    }
  }

  onHover = () => {
    const { disabled } = this.props || {}
    if (!disabled) {
      const {styles} = this.props.environment || {}
      this.setState({style: styles.buttonHover})  
    }
  }

  onClick = (input) => {
    const {styles} = this.props.environment || {}
    this.setState({style: styles.buttonClick})
    setTimeout(this.restoreStyle, 200)
    this.props.onClick(input)
  }

  restoreStyle = () => {
    if (this.mounted) {
      const {styles} = this.props.environment || {}
      const { disabled } = this.props || {}
      this.setState({style: disabled ? styles.buttonDisabled : styles.button})
    }
  }

  componentWillUnmount () {
    this.mounted = false
  }

  render () {
    const { style, children, disabled, title, hidden } = this.props || {}
    const {onHover, onClick, restoreStyle} = this
    return (
      <button disabled={disabled} hidden={hidden} children={children} title={title} onMouseEnter={onHover} onMouseLeave={restoreStyle} onClick={onClick} style={{ ...this.state.style, ...style}}/>
    )  
  }
}

ButtonComponent.propTypes = {
  children: PropTypes.any.isRequired,
  onClick: PropTypes.func.isRequired,
}