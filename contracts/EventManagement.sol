// SPDX-License-Identifier: Unlicenced

pragma solidity ^0.8.4;
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

interface TicketNFTInterface {
    function mintTicketNFT(uint256 _tokenID, address _lender) external;

    function burnTicketNFT(uint256 _tokenID) external;

    function ownerOf(uint256 _tokenID) external returns (address);

    function transferFrom( address from, address to, uint256 tokenId) external;
}

contract EventManagement{
  using SafeERC20Upgradeable for IERC20Upgradeable;

  uint256 public eventId;
  uint256 public tradeId;
  address public ticketNFT;

  struct eventDetails {
    address eventHost;
    uint256 eventStartTime;
    address paymentAddress;
    uint256 eventDuration;
    uint256 ticketsPerUser;
    string eventName;
    uint256 totalAttendees;
    bool isEventCancelled;
    bool isPaymentComplete;
    uint256 resellStartTime;
  }

  struct ticketSchedule {
    uint256 ticketsNo;
    string ticketScheduleName;
    uint256 scheduleStartTime;
    uint256 scheduleEndTime;
    uint256 price;
    uint256 ticketsUsed;
  }

  struct tradeDetails {
    address orderCreator;
    uint256 eventId;
    uint256 ticketId;
    uint256 price;
    bool orderFulfilled;
    bool isOrderCancelled;
  }
  mapping(uint256 => eventDetails) public eventDetailsBook;
  mapping(uint256 => tradeDetails) public tradeDetailsBook;
  mapping(uint256 => ticketSchedule[]) public ticketScheduleBook;

  address payable public owner;

    constructor(address _nft){
      ticketNFT = _nft;
      owner = payable(msg.sender);
      eventId = 0;
      tradeId = 0;
    }

  function createEvent(
      uint256 _eventStartTime,
      address _paymentAddress,
      uint256 _eventDuration,
      uint256 _ticketsPerUser,
      string memory _eventName,
      uint256 _resellStartTime,
      string[] memory _ticketScheduleNames,
      uint256[] memory _noOfTickets,
      uint256[] memory _ticketSellingStartTime,
      uint256[] memory _ticketSellingEndTime,
      uint256[] memory _price
  ) external virtual{

    require(
      _eventStartTime>block.timestamp &&
      _paymentAddress != address(0) &&
      _eventDuration >0 &&
      _ticketsPerUser >0 &&
      bytes(_eventName).length != 0, "Incorrect Inputs"
      );
    // Require to handle the ticket selling schedule
    require(
      _noOfTickets.length != 0 &&
      _ticketScheduleNames.length == _noOfTickets.length &&
      _noOfTickets.length == _ticketSellingStartTime.length &&
      _noOfTickets.length == _ticketSellingEndTime.length &&
      _noOfTickets.length == _price.length, "Incorrect Inputs"
      );
    eventId +=1;
    for(uint256 i=0; i< _noOfTickets.length; i++){
      require(
        _noOfTickets[i] > 0 &&
        _price[i] > 0 &&
        _ticketSellingEndTime[i] > _ticketSellingStartTime[i] &&
        _ticketSellingStartTime[i] > block.timestamp &&
        _ticketSellingEndTime[i] <= _eventStartTime &&
        bytes(_ticketScheduleNames[i]).length != 0, "Invalid Input for setting ticket selling schedule"
      );
      if(i>0){
        require(_ticketSellingStartTime[i] >= _ticketSellingEndTime[i-1], "Next round for ticket selling should sell after the previous round is over");
      }
      ticketScheduleBook[eventId].push(
        ticketSchedule(
          _noOfTickets[i],
          _ticketScheduleNames[i],
          _ticketSellingStartTime[i],
          _ticketSellingEndTime[i],
          _price[i],
          0
        )
      );
    }

    // create event details entry in the event details book
    eventDetailsBook[eventId] = eventDetails(
      msg.sender,
      _eventStartTime,
      _paymentAddress,
      _eventDuration,
      _ticketsPerUser,
      _eventName,
      0,
      false,
      false,
      _resellStartTime
    );
  }

  function cancelEvent(uint256 _eventId) external virtual{
    eventDetails memory _eventDetails = eventDetailsBook[_eventId];
    require(
      msg.sender == _eventDetails.eventHost &&
      !_eventDetails.isEventCancelled &&
      _eventDetails.eventStartTime > block.timestamp, "only host can cancel the event before the event start or event is already cancelled"
      );
    _eventDetails.isEventCancelled = !(_eventDetails.isEventCancelled);
    eventDetailsBook[_eventId] = _eventDetails;
  }

  function buyEventTicket(uint256 _eventId, uint256 _noOfTickets) external virtual payable{
    // RECHECK FUNCTION LOGIC
    // add check for max tickets, need to check if there is direct way to get this
    eventDetails memory _eventDetails = eventDetailsBook[_eventId];
    ticketSchedule[] memory _ticketSchedule = ticketScheduleBook[_eventId];

    require(
      _eventDetails.eventHost != address(0) &&
      _eventDetails.eventStartTime > block.timestamp &&
      !(_eventDetails.isEventCancelled) &&
      _ticketSchedule[0].scheduleStartTime > block.timestamp, "Invalid Input"
    );
    bool suitableTicket = false;
    uint256 ticketLeft = 0;
    for(uint256 i=0; i< _ticketSchedule.length; i++){
      if (_ticketSchedule[i].scheduleStartTime < block.timestamp && _ticketSchedule[i].scheduleEndTime > block.timestamp ){
        if(_ticketSchedule[i].ticketsNo >= _ticketSchedule[i].ticketsUsed + _noOfTickets){
          suitableTicket = true;
          for (uint256 j=0; j<_noOfTickets; j++){
            // create NFT here
            _ticketSchedule[i].ticketsUsed += 1;
            // need to break this func into 2
            (address nftOwner, uint256 tokenId) = getNftDetails(
              _eventId,
              _eventDetails.eventHost,
              _ticketSchedule[i].ticketsUsed
            );
            TicketNFTInterface(ticketNFT).mintTicketNFT(
                tokenId,
                msg.sender
            );
          }
          owner.transfer(_ticketSchedule[i].price*_noOfTickets);
          ticketScheduleBook[_eventId][i] = _ticketSchedule[i];
        }
      } else {
        ticketLeft +=_ticketSchedule[i].ticketsNo -  _ticketSchedule[i].ticketsUsed;
      }
    }
    if(!suitableTicket){
      require(ticketLeft >= _noOfTickets &&
      block.timestamp >_eventDetails.eventStartTime, "Not enough tickets are available or event has started");
      uint256 scheduleLength = ticketScheduleBook[_eventId].length;
      for (uint256 j=0; j<_noOfTickets; j++){
        // create NFT here
        _ticketSchedule[scheduleLength-1].ticketsUsed += 1;
        // need to break this func into 2
        (address nftOwner, uint256 tokenId) = getNftDetails(
          _eventId,
          _eventDetails.eventHost,
          _ticketSchedule[scheduleLength-1].ticketsUsed
        );
        TicketNFTInterface(ticketNFT).mintTicketNFT(
            tokenId,
            msg.sender
        );
      }
      owner.transfer(_ticketSchedule[scheduleLength-1].price*_noOfTickets);
      ticketScheduleBook[_eventId][scheduleLength-1] = _ticketSchedule[scheduleLength-1];
    }
  }

  function markEventAttendance(uint256 _eventId, uint256 _ticketId) external virtual{
    eventDetails memory _eventDetails = eventDetailsBook[_eventId];
    (address nftOwner, uint256 userTokenId) = getNftDetails(
      _eventId,
      _eventDetails.eventHost,
      _ticketId
    );
    require(
      nftOwner == msg.sender &&
      block.timestamp >= _eventDetails.eventStartTime &&
      block.timestamp < (_eventDetails.eventStartTime + _eventDetails.eventDuration) &&
      !(_eventDetails.isEventCancelled), "Only User owning the NFT can mark the attendance"
    );
    _eventDetails.totalAttendees +=1;
    eventDetailsBook[_eventId] = _eventDetails;
    TicketNFTInterface(ticketNFT).burnTicketNFT(userTokenId);
  }

  function getEventEarnings(uint256 _eventId) external virtual{
    eventDetails memory _eventDetails = eventDetailsBook[_eventId];
    ticketSchedule[] memory _ticketSchedule = ticketScheduleBook[_eventId];
    require(
      msg.sender == _eventDetails.eventHost &&
      block.timestamp > (_eventDetails.eventStartTime + _eventDetails.eventDuration) &&
      !(_eventDetails.isEventCancelled) &&
      !(_eventDetails.isPaymentComplete), "Only Owner can take the earning after the event is over"
    );
    uint256 ticketsPrice = 0;
    for(uint256 i=0; i < _ticketSchedule.length; i++){
      ticketsPrice+=_ticketSchedule[i].ticketsUsed*_ticketSchedule[i].price;
    }
    (payable(msg.sender)).transfer(ticketsPrice);
    _eventDetails.isPaymentComplete = true;
    eventDetailsBook[_eventId] = _eventDetails;
  }

  function redeemCancelledEventTicket(uint256 _eventId, uint256[] calldata _ticketIds) external virtual payable{
    // NEED TO ADJUST TICKET TIME ALSO IN THE NFT ID
    eventDetails memory _eventDetails = eventDetailsBook[_eventId];
    require(
      _eventDetails.isEventCancelled, "Only cancelled events can be redeemed."
    );
    for (uint256 i=0;i<_ticketIds.length;i++){
      (address nftOwner, uint256 userTokenId) = getNftDetails(
        _eventId,
        _eventDetails.eventHost,
        _ticketIds[i]
      );
      require(
        nftOwner == msg.sender, "Only ticket owner can ask for refund."
      );
      TicketNFTInterface(ticketNFT).burnTicketNFT(userTokenId);
    }
    uint256 total_earnings = _ticketIds.length*_eventDetails.price;
    (payable(msg.sender)).transfer(total_earnings);
  }

  function resellTicket(uint256 _eventId, uint256 _ticketId, uint256 _price) external virtual payable {
    eventDetails memory _eventDetails = eventDetailsBook[_eventId];
    (address nftOwner, uint256 userTokenId) = getNftDetails(
      _eventId,
      _eventDetails.eventHost,
      _ticketId
    );

    require(
      _eventDetails.eventHost != address(0) &&
      _eventDetails.eventStartTime > block.timestamp &&
      nftOwner == msg.sender &&
      _price>0 , "Invalid Input"
    );
    tradeId += 1;
    tradeDetailsBook[tradeId] = tradeDetails(
      msg.sender,
      _eventId,
      _ticketId,
      _price,
      false,
      false
    );
    TicketNFTInterface(ticketNFT).transferFrom(msg.sender, owner, userTokenId);
  }

  function cancelresellTicketOrder(uint256 _tradeId) external virtual{
    tradeDetails memory _tradeDetails = tradeDetailsBook[_tradeId];
    require(
      _tradeDetails.orderCreator != address(0) &&
      _tradeDetails.orderCreator == msg.sender &&
      !(_tradeDetails.isOrderCancelled) &&
      !(_tradeDetails.orderFulfilled), "Order can only be cancelled by the order creator or order is cancelled or fulfilled"
    );
    _tradeDetails.isOrderCancelled = true;
    eventDetails memory _eventDetails = eventDetailsBook[_tradeDetails.eventId];
    (address nftOwner, uint256 userTokenId) = getNftDetails(
      _tradeDetails.eventId,
      _eventDetails.eventHost,
      _tradeDetails.ticketId
    );
    require(
      nftOwner == owner, "Nft should belong to the Contract owner"
    );
    TicketNFTInterface(ticketNFT).transferFrom(owner, msg.sender, userTokenId);
    tradeDetailsBook[_tradeId] = _tradeDetails;
  }

  function buyResellTicket(uint256 _tradeId) external virtual payable{
    tradeDetails memory _tradeDetails = tradeDetailsBook[_tradeId];
    eventDetails memory _eventDetails = eventDetailsBook[_tradeDetails.eventId];
    (address nftOwner, uint256 userTokenId) = getNftDetails(
      _tradeDetails.eventId,
      _eventDetails.eventHost,
      _tradeDetails.ticketId
    );

    require(
      _tradeDetails.orderCreator != address(0) &&
      nftOwner == owner && 
      _tradeDetails.orderCreator != msg.sender &&
      !(_tradeDetails.isOrderCancelled) &&
      !(_tradeDetails.orderFulfilled) &&
      _eventDetails.eventStartTime > block.timestamp, "Order should be in active state and the ticketing event should not have started."
    );

    TicketNFTInterface(ticketNFT).transferFrom(owner, msg.sender, userTokenId);
    owner.transfer(_tradeDetails.price);
    (payable(msg.sender)).transfer(_tradeDetails.price);
    _tradeDetails.orderFulfilled = true;
    tradeDetailsBook[_tradeId] = _tradeDetails;
  }

  function getNftDetails(uint256 _eventId, address _eventHost, uint256 _ticketId) internal returns (address, uint256){
      uint256 userTokenId = uint256(
        keccak256(
          abi.encodePacked(
          _eventId,
          _eventHost,
          _ticketId
          )
        )
      );
    address nftOwner = TicketNFTInterface(ticketNFT).ownerOf(userTokenId);
    return (nftOwner, userTokenId);
    }
}