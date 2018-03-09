import React, { Component } from 'react'
import PropTypes from 'prop-types'
import View from './View'

export default class Textbox extends Component {
  onChange = (input, blurEvent) => {
    const { pattern, type, max, min } = this.props || {}
    const {value, name} = input.target
    let interceptedValue = value
    if (pattern) {
      const regex = new RegExp(pattern, 'g')
      const match = interceptedValue.match(regex)
      if (match === null) {
        interceptedValue = ''
      }
      else {
        interceptedValue = match.join('')
      }

    }

    if (type === "number" && interceptedValue.length > 1) {
      interceptedValue = interceptedValue.replace(/^0+/, '')
    }

    if (interceptedValue !== this.props.value) {
      if (max && interceptedValue !== '') {
        interceptedValue = Math.min(max, interceptedValue)
      }
  
      if (min && interceptedValue !== '') {
        interceptedValue = Math.max(min, interceptedValue)
      }

      if (blurEvent) {
        if (this.props.onBlur) {
          this.props.onBlur({name, value: interceptedValue, input: "textbox"})
        }

      }
      else if (this.props.onChange) {
        this.props.onChange({name, value: interceptedValue, input: "textbox"})
      }

    }
    
  }

  onBlur = (input) => {
    this.onChange(input, true)
  }

  onKeyPress = (input) => {
    if (input.key === "Enter" && this.props.onPressEnter) {
      this.props.onPressEnter(input)
    }
  }

  render () {
    const { styles } = this.props.environment
    const {
      name,
      type,
      disabled,
      readOnly,
      value,
      placeholder,
      style,
      pattern,
      maxLength,
      step,
      max,
      min,
    } = this.props
    let interceptedType = type
    if (type === 'number') {
      interceptedType = null
    }

    let interceptedStep = step
    if (type === 'time') {
      interceptedStep = 60*15
    }

    let interceptedValue = value
    if (max !== undefined && interceptedValue !== '' && interceptedValue > max) {
      interceptedValue = Math.min(max, interceptedValue)
    }

    if (min !== undefined && interceptedValue !== '' && interceptedValue < min) {
      interceptedValue = Math.max(min, interceptedValue)
    }

    if (readOnly) {
      return <View style={{...styles.readOnlyField, ...style}} >{value}</View>
    }

    return (
      <input
        name={name}
        type={interceptedType}
        value={interceptedValue}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        max={max}
        step={interceptedStep}
        pattern={pattern}
        maxLength={maxLength}
        style={{...styles.textbox, ...style}}
        onChange={this.onChange}
        onBlur={this.onBlur}
        onKeyPress={this.onKeyPress}/>
    )  
  }
}

Textbox.defaultProps = {
  value: '',
}

Textbox.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onPressEnter: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
}