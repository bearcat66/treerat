import React from 'react';
import {Jumbotron, Table} from 'react-bootstrap'

export default class UserTable extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        users: []
      };
    }
    componentDidMount() {
      this.props.users.then(r => {
        this.setState({users: r})
      })
    }
    componentDidUpdate(prevProps) {
      this.props.users.then(r => {
        if (r.length !== this.state.users.length) {
          this.setState({users: r})
        }
      })
    }
    renderTableData() {
      return this.state.users.map((user, index) => {
        const {id, name} = user
        return (
          <tr>
            <td>{id}</td>
            <td>{name}</td>
          </tr>
        )
      })
    }
    render() {
        return (
            <Jumbotron fluid>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th text-center="true">MB ID</th>
                            <th text-center="true">Name</th>
                        </tr>
                    </thead>
                    <tbody>
                      {this.renderTableData()}
                    </tbody>
                </Table>
            </Jumbotron>
            );
    }
}

