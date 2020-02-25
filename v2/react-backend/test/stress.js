const Jigs = require('../lib/jigs')
const axios = require('axios')

const { NETWORK } = Jigs
const HOST = 'http://localhost:3001'
const WAIT_TIME = 0
const ASYNC = false

const knownUsers = new Set()

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const getRandomUser = () => Array.from(knownUsers.values())[Math.floor(Math.random() * knownUsers.size)]

async function createUser() {
    const randomPaymail = `user${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}@moneybutton.com`

    console.log(`Creating user ${randomPaymail}`)

    await axios.post(`${HOST}/api/users/${randomPaymail}`, { profile: { primaryPaymail: randomPaymail } })
        .then(() => knownUsers.add(randomPaymail))
        .then(() => console.log(`Created ${randomPaymail}`))
}
async function createReview() {
  const randomUser = getRandomUser()
  console.log(`Creating review for user ${randomPaymail}`)

}

async function getUsers() {
    console.log('Getting users')

    await axios.get(`${HOST}/api/users`)
        .then(response => {
            knownUsers.clear()
            response.data.forEach(user => knownUsers.add(user.id))
        })
        .then(() => console.log('Retrieved all users'))
}

async function getUser() {
    if (!knownUsers.size) {
        console.log('Getting user ...but no users to get')
        return
    } 

    const randomUser = getRandomUser()

    console.log(`Getting ${randomUser}`)

    await axios.get(`${HOST}/api/users/${randomUser}`)
        .then(() => console.log(`Retrieved user ${randomUser}`))
}

async function getUserProfile() {
    if (!knownUsers.size) {
        console.log('Getting user profile ...but no users to get')
        return
    } 

    const randomUser = getRandomUser()

    console.log(`Getting profile for ${randomUser}`)

    await axios.get(`${HOST}/api/users/${randomUser}/profile`)
        .then(() => console.log(`Retrieved profile for ${randomUser}`))
}

async function nextAction() {
    const possibleActions = [
        createUser,
        getUsers,
        getUser,
        getUserProfile
    ]

    const randomChoice = Math.floor(Math.random() * possibleActions.length)

    const action = possibleActions[randomChoice]

    if (ASYNC) {
        action()
    } else {
        await action()
    }

    setTimeout(nextAction, WAIT_TIME)
}

console.log(`Running stress test on ${HOST} (${NETWORK}net)`)

//nextAction()
