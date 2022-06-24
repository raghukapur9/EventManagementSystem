# Technical Implementation

## Create Event
- Details Required for creating an event
    - Host Address
    - No. of tickets
    - Event Start Time
    - Event Details ( Event Name)
    - Wallet Address where ticket funds need to be transferred after the start of the event.
    - Ticket Price
    - Event Duration

## Buy Event Ticket
- Details Required for buying a ticket
    - Host Address
    - NFT Address

## Resell Event Ticket
- Details Required for reselling a ticket
    - Host Address
    - NFT Address
    - Price quoted by the owner

## Re-buying Event Ticket
- Details Required for reselling a ticket
    - Host Address
    - NFT Address

## TODO
- Cancel Event
- Contract to hold the money until the end
- In case of cancellation, amound to be blocked to be taken by the host
- NFT owners can take the amount in case of cancellation
- Store ticket info also in a different struct