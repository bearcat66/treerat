import React from 'react';
import {PlaceStyle, PlaceStyleHover} from './styles/place_style.js'
 

export default class Place extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      placeDescription: props.name,
      hover: props.$hover,
    }
  }
  componentDidMount() {
    this.setState({hover: this.props.$hover})
  }
  componentDidUpdate() {
    if (this.state.hover === this.props.$hover) {
      return
    }
    this.setState({hover: this.props.$hover})
  }
  render() {
    const style = this.state.hover ? PlaceStyleHover : PlaceStyle
    if (this.state.placeDescription === null) {
      return null
    }
    var name = this.state.placeDescription
    if (style === PlaceStyle) {
      name = ''
    }
    return (
      <div style={style}>
        {name}
      </div>
    )
  }
}
