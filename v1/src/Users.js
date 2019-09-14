import React from 'react';
import UserTable from './UserTable.js';
import {GetMBUser} from './MB';
import {Jumbotron} from 'react-bootstrap';
import './App.css';
 
const UnwriterAPIKey = process.env.REACT_APP_UNWRITERAPIKEY

export default class Users extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userID: '',
    }
  }
  componentDidMount() {
    GetMBUser().then(r=>{
      this.setState({userID: r.id})
    })
  }
  renderUserTable() {
    return (
      <UserTable
        users={getAllUsers()}
      />
    )
  }
  render () {
    return (
    <Jumbotron>
      <div>
      </div>
    </Jumbotron>
    );
  }
}

function getAllUsers() {
  var userQuery = {
    "v": 3,
    "q": {
      "find": {
        "out.s1": "tr-hack",
        "out.h2": "808b",
      },
      "project": {
        "out.h2": 1,
        "out.s3": 1,
        "out.s4": 1,
      }
    },
    "r": {
      "f": "[ .[] | {id: .out[0].s3, name: .out[0].s4} ]"
    }
  }
  var suf = btoa(JSON.stringify(userQuery))
  var url = "https://genesis.bitdb.network/q/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/"+suf
  //var url = "https://genesis.bitdb.network/q/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/ewogICJ2IjogMywKICAicSI6IHsKICAgICJmaW5kIjogeyJvdXQuczEiOiAicmV2aWV3IiwgIm91dC5oMiI6ICI4MDhhIn0sCiAgICAicHJvamVjdCI6IHsKICAgICAgIm91dC5oMiI6IDEsCiAgICAgICJvdXQuczMiOiAxLAogICAgICAib3V0LnM0IjogMSwKICAgICAgIm91dC5zNSI6IDEsCiAgICAgICJvdXQuczYiOiAxLAogICAgICAib3V0LnM3IjogMSwKICAgICAgIm91dC5zOCI6IDEKICAgIH0KICB9LAogICJyIjogewogICAgImYiOiAiWyAuW10gfCB7dHlwZTogLm91dFswXS5zMywgbmFtZTogLm91dFswXS5zNCwgcmV2aWV3Qm9keTogLm91dFswXS5zNSwgcmF0aW5nOiAub3V0WzBdLnM2LCBjb2RlOiAub3V0WzBdLmgyLCBpZDogLm91dFswXS5zNywgbWJOYW1lOiAub3V0WzBdLnM4fSBdIgogIH0KfQ=="
    /*var source = new EventSource("https://genesis.bitdb.network/s/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/ewogICJ2IjogMywKICAicSI6IHsKICAgICJmaW5kIjoge30sCiAgICAibGltaXQiOiAxMAogIH0KfQ==")
    source.onmessage = function(event) {
      var data = JSON.parse(event.data)
      console.log(data.data[0])

    }*/
    var header = {
      headers: { key: UnwriterAPIKey}
    };
    var l = fetch(url, header).then(function(r) {
      return r.json()
    }).then(function(r) {
      console.log(r)
      var list = []
      var j = 0
      var displayNumber = r.c.length
      //var displayNumber = 5
        for (var i=0; i< displayNumber; i ++) {
            var user = r.c[i]
            if (user.id == null) {
                continue
            }
            var u = {id: user.id, name: user.name}
            if (u == null) {
                continue
            }
            list[j] = u
            j++
        }
      displayNumber = r.u.length
      //displayNumber = 0
        for (i=0; i< displayNumber; i ++) {
            user = r.u[i]
            if (user.rating == null) {
                continue
            }
            u = {id: user.id, name: user.name}
            if (u == null) {
                continue
            }
            list[j] = u
            j++
        }
        return list
    })
    return l
}

