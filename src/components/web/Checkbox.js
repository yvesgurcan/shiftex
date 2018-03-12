import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Checkbox extends Component {
  onChange = (input) => {
    const { id, onChange } = this.props
    const { checked, name } = input.target
    onChange({id, name, checked, value: checked, input: "checkbox"})
  }

  render () {
    const {
      name,
      id,
      value=false,
      checked=false,
      style,
    } = this.props

    return (
      <span>
        <input name={name} id={id || name} type="checkbox" checked={value || checked} style={style} onChange={this.onChange}/>
        <label htmlFor={id || name}>{this.props.children}</label>
      </span>
    )  
  }
}

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.any.isRequired,
  value: PropTypes.bool,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
}