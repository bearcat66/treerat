# True Reviews - BSV Hackathon
Traditional review sites suffer from the same incentive problem that plagues
modern sites built on top of the internet. There is little to no incentive to
produce reviews for businesses, locations, and events that are accurate,
truthful, and of high quality. Historically there have been two main attempts
to solve this incentive problem:

1. Rewards for filling out reviews/surveys
1. Fake internet points used as a reputation system for reviewers

Alongside the incentive problem, review websites suffer from another problem
inherent to the legacy internet: creating fake reviews has no inherent costs
associated with it, which makes “Sybil attacks” trivial. This means that it is
hard to know whether the reviews you are reading are from real people or if
they are a social engineering campaign to promote a business, location, event,
etc.

TrueReviews solves both problems by creating a review platform powered by
Bitcoin. TrueReviews solves the incentive problem by allowing users to earn BSV
for high quality reviews. Since each user account on TrueReviews is associated
with a BSV wallet, every action performed by the user can have a cost
associated with it and users can show appreciation for other users’ reviews by
tipping and voting. Because we can associate a cost with each review that is
created, we remove the incentive to create fake reviews and replace it with an
incentive to create honest and truthful reviews.


During the BSV Hackathon, we began an implementation of this project using a
simple OP_RETURN protocol and all actions were performed using MoneyButton. As
we progressed, we realized the long-term vision of the project required us to
tokenize the users, actions, and locations. We accomplished this by utilizing
the Run platform. As a result we have split our submission into two parts:

1. V1 of the application is a Proof of Concept to show the user flow of
   creating reviews and tipping for content.
1. V2 of the application is a Proof of Concept to show how the platform can be
   built with tokens. This will enable us in the future to allow editing of
   reviews but keeping an immutable history of the review, receipt of tokens
   that can be redeemed for value at businesses (gift cards), and a reputation
   system.

## Version 1 - Planaria as backend
* Users login with their MoneyButton account
* Users can create reviews by searching for a Google location, writing out a review, giving a rating, and submitting with a MoneyButton swipe.
* Users can view a map of all submitted reviews
* Users can tip other reviewers
* Users can filter to view all of their own reviews

### Running Version 1
To run version 1, run:
```
$ cd v1/
$ npm install
$ npm start
```

## Version 2 - RunOnBitcoin jigs as review assets
* Users login with a MoneyButton account
  * This prompts the creation of a public key that is used to store all of the Reviews (Jigs from the Run platform). This public key is stored in a database jig that maps public keys to MoneyButton ID’s, and the corresponding private key is thrown away.
  * With more development, this public key can be one controlled by the user to allow edits to existing reviews
* Users can submit a review for a Google location ID
  * If a Location Jig has not yet been created for the location specified, one will be created
  * The Review Jig is created and sent to the public key mapped to the users MoneyButton ID
  * This means the Review cannot be modified by anyone once created, as the private key is thrown away.
  * Users can search for Google locations and any Review jigs created for the location are logged to the console
    * Didn’t have time to show this on the webpage

For more information about RunOnBitcoin, check out their [documentation](https://star.store)

### Running Version 2
To run version 2, run:
```
$ cd v2/
# Optionally setup owner/purse private keys (not required when using virtualbox image)
# To do this, modify public/jigs.js and fill out the constants at the top
$ npm install
$ npm start
```

# Future
The foundation we built during this Hackathon will allow us to implement the
following pieces of functionality with the Run platform:
* Tokenized rewards for businesses (gift cards)
* Tokenized reputation system for TrueReviews
* Voting on reviews with rewards for curating content
