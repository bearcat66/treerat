import React from 'react';

export default class About extends React.Component {
  render() {
    return (
      <div className="jumbotron jumbotron-transparent-25">
        <h3 className="text-center">About Us</h3>
        <hr/>
        <div className="container bg-light">
          <h5 className="text-center">What is True Reviews?</h5>
          <p>TrueReviews is an online review platform that enables businesses
            to incentivize more reviews for their businesses and for users to
            earn Bitcoin and tokenized rewards for good reviews. Every action
            taken on TrueReviews is an onchain Bitcoin transaction. There are
            three main components to the platform: Reviews, Reputation, and
            Rewards.</p>
          <hr/>
          <h5 className="text-center">Reviews</h5>
          <p>
            TrueReviews is powered by the Run on Bitcoin platform, which is a
            smart contract and tokenization platform for Bitcoin SV that allows
            you to put interactive data objects on the blockchain. This means
            that we can start having true digital property ownership on the
            blockchain.
            <ul/>
            Each review posted on TrueReviews is an interactive data object
            that is owned by a public key. Users own the reviews that they
            create, meaning the object cannot be altered by anyone else once
            created. Because reviews are interactive objects, we can enable
            editing, deleting, and other modifications to the objects by the
            owners.
            <ul/>
            Reviews have a few main components:
            <li>Location: This is the Google Search location being reviewed</li>
            <li>Review Body: This is the text of your review</li>
            <li>Rating: A 1-10 rating system that accepts a rating to one decimal place (ie 5.4, 7.8, etc)</li>
            <li>True Review Code: A manual way of entering a redeemable code for rewards. This will most likely not be used during the Alpha testing.</li>
            <ul/>
            Reviews can be searched for and voted on with a simple positive or negative score.
          </p>
          <hr/>
          <h5 className="text-center">Reputation</h5>
          <p>
            Users maintain a tokenized reputation across the platform that is
            tied to how popular their posts are. Users start with no reputation
            at all, but earn reputation for creating reviews and when others
            “upvote” their reviews. Users can also lose reputation for reviews
            deemed not helpful by other users. Across the platform are Positive
            Reputation tokens, and Negative Reputation tokens. TrueReviews
            mints these tokens and distributes them to users based on the
            following criteria:
            <ul/>
            <li>Creating a review: 1 positive reputation token</li>
            <li>Review earns a “like”: 5 positive reputation tokens</li>
            <li>Reviews earns a “dislike”: 5 negative reputation tokens.</li>
            <ul/>
            Your total reputation across the site is the calculated difference
            between your Positive Reputation tokens and your Negative
            Reputation tokens.
          </p>
          <hr/>
          <h5 className="text-center">Rewards</h5>
          <p>
            Users are rewarded with real goods for creating popular reviews.
            Users are rewarded with 1000 satoshis for creating reviews and 5000
            satoshis when a review is “liked”. Users can browse reviews and tip
            any reviewer any amount using the MoneyButton tip button.
            <ul/>
            Because each location is its own interactive object, business
            owners can contact TrueReviews to become the owner of their
            business location. After doing so, businesses can issue tokenized
            rewards that are rewards to users when a verified review is made.
            Today, Amazon maintains a “verified review” system that
            distinguishes reviews made by verified purchasers. TrueReviews
            extends this functionality to all businesses by using the
            blockchain. At point of sale, a unique identifier is created that
            is tied to the original purchase. When a review is made, we can
            link to the original point of sale to verify that this reviewer
            actually patronized the business.
            <ul/>
            In exchange for a verified review, tokenized rewards (gift cards,
            coupons, etc) can be issued to the reviewer and redeemed at the
            business.
            <ul/>
            If you own a business currently identifiable with Google Search and
            are interested in piloting our reward system, please email
            businessrequest@truereviews.io with your information and we’d like
            to set you up.
          </p>
        </div>
      </div>
    );
  }
}
