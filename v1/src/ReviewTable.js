import React from 'react';
import MoneyButton from '@moneybutton/react-money-button'
import {Jumbotron, Table} from 'react-bootstrap'

export default class ReviewTable extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        reviews: []
        /*[
          {code: "0x808a", name: "Dylan's Brewery", type: "brewery", reviewBody: "Great place!", rating: "10"},
          {code: "0x808a", name: "Connor's Brewery", type: "brewery", reviewBody: "Worst place I've ever been to", rating: "1.4"},
          {code: "0x808a", name: "Kevin's Brewery", type: "brewery", reviewBody: "Not as shitty as Connor's Brewery but still trash city", rating: "3.5"}
        ]*/
      };
    }
    componentDidMount() {
      this.props.reviews.then(r => {
        this.setState({reviews: r})
      })
    }
    componentDidUpdate(prevProps) {
      this.props.reviews.then(r => {
        if (r.length !== this.state.reviews.length) {
          this.setState({reviews: r})
        }
      })
    }
    renderTableData() {
      return this.state.reviews.map((review, index) => {
        var out = [{type: 'userId', amount: "1", currency: "USD", userId: review.id}]
        return (
          <tr>
            <td>{review.type}</td>
            <td>{review.locationName}</td>
            <td>{review.reviewBody}</td>
            <td>{review.rating}</td>
            <td>{review.mbName}</td>
            <td text-center="true"><MoneyButton outputs={out}
                />
            </td>
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
                            <th text-center="true">Type</th>
                            <th text-center="true">Name</th>
                            <th text-center="true">Body</th>
                            <th text-center="true">Rating</th>
                            <th text-center='true'>User</th>
                            <th text-center="true">Tip</th>
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

