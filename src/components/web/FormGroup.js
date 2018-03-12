import React, { Component } from 'react'
import PropTypes from 'prop-types'
import View from './View'
import Label from './Label'
import Textbox from './Textbox'
import Checkbox from './Checkbox'
import Dropdown from './Dropdown'

class FormGroup extends Component {
  render () {
    const { props } = this
    const {
      label,
      checkbox,
      options,
    } = props
    return (
    <View>
      {checkbox || !label ? null : <Label>{label}</Label>}
      <View>
        {
          options ? <Dropdown {...props} /> :
          checkbox ? <Checkbox {...props}>{label || ''}</Checkbox> :
          <Textbox {...props} />
        }
      </View>
    </View>
    )
  }
}

FormGroup.defaultProps = {
  label: '',
}

FormGroup.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onPressEnter: PropTypes.func,
  placeholder: PropTypes.string,
  options: PropTypes.array,
  max: PropTypes.number,
  min: PropTypes.number,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  pattern: PropTypes.string,
  maxLength: PropTypes.number,
  label: PropTypes.string,
}

export default FormGroup