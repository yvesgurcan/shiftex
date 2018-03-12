import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Dropdown extends Component {
  onChange = (input) => {
    const { options, onChange } = this.props
    const { value, name } = input.target
    const valueProcessed = value === "-1" ? null : !isNaN(Number(value)) ? Number(value) : value
    const label = input.target[input.target.selectedIndex].label
    const objectMatch = options.filter(option => option.value === valueProcessed)
    const object = objectMatch.length > 0 ? objectMatch[0].object : {}
    onChange({name, value: valueProcessed, label, object, input: "dropdown"})
  }

  onKeyPress = (input) => {
    const { onPressEnter } = this.props
    if (input.key === "Enter" && onPressEnter) {
      onPressEnter(input)
    }
  }

  render () {
    const {
      name,
      value=-1,
      style,
      options=[],
      placeholder='Select',
    } = this.props
    
    return (
      <span>
        <select name={name} value={value} style={style} onChange={this.onChange} onKeyPress={this.onKeyPress}>
          {placeholder && <option value={-1}>{placeholder}</option>}
          {options.map(option => <option key={option.value || option.label} value={option.value}>{option.label}</option>)}
        </select>
      </span>
    )  
  }
}

Dropdown.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
}