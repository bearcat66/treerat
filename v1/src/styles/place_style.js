const K_WIDTH = 20;
const K_HEIGHT = 20;

const PlaceStyle = {
  // initially any map object has left top corner at lat lng coordinates
  // it's on you to set object origin to 0,0 coordinates
  position: 'absolute',
  width: K_WIDTH,
  height: K_HEIGHT,
  left: -K_WIDTH / 2,
  top: -K_HEIGHT / 2,

  border: '5px solid red',
  borderRadius: K_HEIGHT,
  backgroundColor: 'white',
  textAlign: 'center',
  color: 'red',
  fontSize: 11,
  fontWeight: 'bold',
  padding: 4
};
const PlaceStyleHover = {
  ...PlaceStyle,
  border: '5px solid blue',
  borderRadius: K_HEIGHT *5,
  width: K_WIDTH * 5,
  height: K_HEIGHT * 5,
  padding: 12,
};

export {PlaceStyle, PlaceStyleHover};
