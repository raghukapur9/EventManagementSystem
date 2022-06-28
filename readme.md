# Event MarketPlace

## Actors
- Event Host -> Person who will host the event on the website.
- Retail Users -> People who will buy tickets to these events.
- Retail Trades -> Users who will trade their event tickets in a secondary marketplace. (These can be Retail users or users looking to buy event tickets when the slots are booked.)

## Scope
- Event MarketPlace is a decentralized platform that allows event hosts to create an event on the platform with all the necessary details.The contract will generate NFTs for the no. of seats available for the event. The users will use this platform to buy tickets to these events which will be in the form of NFT. These NFTs will be associated with the user address. 
- The owner of the NFT will have access to a P2P marketplace for reselling these NFTs.

## Advantages over Similar Traditional Web2.0 platforms
- No platform in the web2.0 space has a secondary marketplace for trading event tickets.
    - This is useful for 2 use-cases
        - Over hyped events - tickets can be sold at a profit as demand is more
        - Users who cannot attend the event - users' money usually get wasted if they are not able to attend the event, but with the marketplace they have a chance to re-sell the ticket to manage their loss.

- Reduces the risk of entry of fraudulent users from entering the event, as NFT is unique and once the owner of the NFT has entered the event, the NFT will be burned which will stop subsequent users from entering the event.

## Disadvantages over Similar Traditional Web2.0 platforms
- Crypto adoption is still not very much in this area, so difficult to get volume on the platform
- Current implementation cannot handle events which require authenticating a user’s identity.

## Useful Links
- [Event Management Platform article](https://medium.com/t14g/decentralized-event-management-platforms-d1fce0748a26)
- [Door Github](https://github.com/d0or)

## Feature List
- Event Host
    - Host can create the event 
    - Host can cancel the event
    - Host can put the address where tokens will be transferred
    - Modify the event details
    - Event details and analytics in terms of tickets sold, attendees, etc
    - Dashboard showing the event list hosted by the host

- Retail Users
    - Users can buy tickets for the event
    - Dashboard showing the list of upcoming and ended shows
    - Ticket cancel if allowed by the event
    - Redeeming ticket price if event is cancelled by the host

- Retail Trades
    - Users can resell their tickets in the marketplace
    - Cancel the order placed by the user in the marketplace
    - Users can buy tickets from the marketplace
    - Popover showing the details of the event

## Flow Diagrams
- Event Creator Flow (Before event ends)
    ![Host Flow](/images/host_flow.png?raw=true "Host Flow")
- Retail User Flow 
    ![Retail User Flow](/images/retail_user_flow.png?raw=true "Retail User Flow")
- Secondary Marketplace for Ticket Reselling Flow
    ![Secondary Marketplace Flow](/images/secondary_marketplace_flow.png?raw=true "Secondary Marketplace Flow")

## Future Enhancements
- Introduction of Platform generated NFTs that can be used as a priority pass to get discounts on the events.
- Enabling of bidding process when the user re-sells the ticket.
    
