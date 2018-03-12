import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Textbox extends Component {
  onChange = (input, blurEvent) => {
    const { onChange } = this.props
    const {value, name} = input.target
    onChange({name, value, input: "textbox"})
    
  }

  onBlur = (input) => {
    this.onChange(input, true)
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
      type,
      value='',
      placeholder,
      style,
    } = this.props

    return (
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        style={style}
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