import React, { Component } from 'react'
import PropTypes from 'prop-types'
import View from './View'

export default class Dropdown extends Component {
  render () {
    const { hidden } = this.props || {}
    if (hidden) {
      return null
    }
    return (
      <InternalDropdown {...this.props} />
    )
  }
}

class InternalDropdown extends Component {
  onChange = (input) => {
    const {options} = this.props
    const {value, name} = input.target
    const valueProcessed = value === "-1" ? null : !isNaN(Number(value)) ? Number(value) : value
    const label = input.target[input.target.selectedIndex].label
    const objectMatch = options.filter(option => option.value === valueProcessed)
    const object = objectMatch.length > 0 ? objectMatch[0].object : {}
    this.props.onChange({input: "dropdown", name, value: valueProcessed, label, object})
  }
  onKeyPress = (input) => {
    if (input.key === "Enter" && this.props.onPressEnter) {
      this.props.onPressEnter(input)
    }
  }
  render () {
    const { styleState } = this.state || {}
    const { name, value, style, options, placeholder, disabled, title, readOnly, hidden } = this.props || {}
    if (hidden) {
      return null
    }
    if (readOnly) {
      return <View style={style} >{value}</View>
    }
    return (
      <span>
        <select name={name} disabled={disabled} title={title} value={value} style={{...styleState, ...style}} onChange={this.onChange} onKeyPress={this.onKeyPress}>
          {placeholder ? <option value={-1}>{placeholder}</option> : null}
          {(options || []).map(option => <option key={option.value || option.label} value={option.value}>{option.label}</option>)}
        </select>
      </span>
    )  
  }
}

InternalDropdown.defaultProps = {
  value: -1,
  placeholder: 'Select',
  options: [],
}

InternalDropdown.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
}