import React from 'react';
import {Navbar} from 'react-bootstrap'

export default class UserInfo extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        id: '',
        name: '',
        balance: '',
        paymail: '',
      };
    }
    componentDidMount() {
      this.props.userInfo.then(r => {
        this.setState({id: r.id, name: r.name, balance: r.balance, paymail: r.paymail})
      })
    }
    render() {
      if (this.state.id === '') {
        return null
      }
      return (
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            Welcome Back <h2><a size="lg" href="https://moneybutton.com" rel="noopener noreferrer" target="_blank">{this.state.name}</a></h2>
            Balance: {this.state.balance}<br/>
            Paymail: {this.state.paymail}
          </Navbar.Text>
        </Navbar.Collapse>
        );
    }
}

