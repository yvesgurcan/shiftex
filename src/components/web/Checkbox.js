import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Checkbox extends Component {
  onChange = (input) => {
    const {id} = this.props || {}
    const {checked, name} = input.target
    const value = checked
    this.props.onChange({id, name, checked, value, input: "checkbox"})
  }
  render () {
    const {styles} = this.props.environment
    const {
      name,
      id,
      disabled,
      value,
      checked,
      style,
    } = this.props
    return (
      <span>
        <input name={name} id={id || name} type={"checkbox"} checked={value || checked} disabled={disabled} style={{...(value || checked ? styles.checkboxChecked : styles.checkbox), ...style}} onChange={this.onChange}/>
        <label htmlFor={id || name}>{this.props.children}</label>
      </span>
    )  
  }
}

Checkbox.defaultProps = {
  value: false,
  checked: false,
}

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.any.isRequired,
  value: PropTypes.bool,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
}