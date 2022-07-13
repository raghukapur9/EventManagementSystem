// SPDX-License-Identifier: Unlicenced

pragma solidity ^0.8.4;
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

abstract contract NFTContract {
  function initialize (
      string memory name_
  ) public virtual;

  function setController (
      address  controller_
  ) public virtual;
}

interface TicketNFTInterface {
    function mintTicketNFT(uint256 _tokenID, address _lender) external;

    function burnTicketNFT(uint256 _tokenID) external;

    function ownerOf(uint256 _tokenID) external returns (address);

    function transferFrom( address from, address to, uint256 tokenId) external;

    function balanceOf(address owner) external returns (uint256);
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
    uint256 ticketsSold;
    bool isEventCancelled;
    bool isPaymentComplete;
    uint256 resellStartTime;
    address nftContractAddress;
  }

  event CreateEventId(
    uint256 eventId,
    address eventHost,
    uint256 eventStartTime,
    address paymentAddress,
    uint256 eventDuration,
    uint256 ticketsPerUser,
    string eventName,
    uint256 totalAttendees,
    uint256 ticketsSold,
    bool isEventCancelled,
    bool isPaymentComplete,
    uint256 resellStartTime,
    address nftContractAddress
    );
  
  event CancelEvent(
    uint256 eventId
  );

  event BuyTicket(
    address user,
    uint256 eventId,
    uint256 totalPrice,
    uint256 totalTickets
  );

  event MarkAttendance(
    address user,
    uint256 eventId,
    uint256 ticketId
  );

  event getEarnings(
    uint256 eventId,
    uint256 totalEarnings
  );

  event getTicketRefund(
    uint256 eventId,
    address user,
    uint256 ticketId,
    uint256 price
  );

  event resellEventTicket(
    address user,
    uint256 eventId,
    uint256 orderId,
    uint256 ticketId,
    uint256 price
  );

  event cancelTicket(
    uint256 orderId
  );

  event buyResellEventTicket(
    address user,
    uint256 orderId
  );
  struct ticketSchedule {
    uint256 ticketsNo;
    string ticketScheduleName;
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
      uint256[] memory _price
  ) external virtual{

    require(
      _eventStartTime>block.timestamp &&
      _paymentAddress != address(0) &&
      _eventDuration > 0 &&
      _ticketsPerUser > 0 &&
      bytes(_eventName).length != 0 &&
      _resellStartTime > block.timestamp &&
      _resellStartTime < _eventStartTime, "Incorrect Inputs"
      );
    // Require to handle the ticket selling schedule
    require(
      _noOfTickets.length != 0 &&
      _ticketScheduleNames.length == _noOfTickets.length &&
      _noOfTickets.length == _price.length, "Incorrect Inputs"
      );

    eventId +=1;

    address deployedNFT = create(ticketNFT);
    assert(deployedNFT != address(0));
    NFTContract(deployedNFT).initialize(_eventName);
    NFTContract(deployedNFT).setController(address(this) );

    for(uint256 i=0; i< _noOfTickets.length; i++){
      require(
        _noOfTickets[i] > 0 &&
        _price[i] > 0 &&
        bytes(_ticketScheduleNames[i]).length != 0, "Invalid Input for setting ticket selling schedule"
      );

      ticketScheduleBook[eventId].push(
        ticketSchedule(
          _noOfTickets[i],
          _ticketScheduleNames[i],
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
      0,
      false,
      false,
      _resellStartTime,
      deployedNFT
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
    eventDetails memory _eventDetails = eventDetailsBook[_eventId];
    ticketSchedule[] memory _ticketSchedule = ticketScheduleBook[_eventId];

    require(
      _eventDetails.eventHost != address(0) &&
      _eventDetails.eventStartTime > block.timestamp &&
      !(_eventDetails.isEventCancelled), "Invalid Input"
    );

    uint256 ticketOwnedByUser = TicketNFTInterface(_eventDetails.nftContractAddress).balanceOf(
      msg.sender
    );

    uint256 totalTickets = 0;
    for(uint256 i=0; i< _ticketSchedule.length; i++){
      totalTickets += _ticketSchedule[i].ticketsNo;
    }
    require(
      (ticketOwnedByUser + _noOfTickets ) <= _eventDetails.ticketsPerUser &&
      (_eventDetails.ticketsSold + _noOfTickets ) < totalTickets,"ticket limit exceed by the user"
    );
    uint256 totalPrice = 0;
    for(uint256 i=0; i< _ticketSchedule.length; i++){
      uint256 ticketsPending = _noOfTickets;
      if (_ticketSchedule[i].ticketsUsed != _ticketSchedule[i].ticketsNo){
          uint256 ticketsLeft = _ticketSchedule[i].ticketsNo - _ticketSchedule[i].ticketsUsed;
          if(ticketsLeft > ticketsPending){
            totalPrice = ticketsPending*_ticketSchedule[i].price;
            ticketsPending = 0;
            _ticketSchedule[i].ticketsUsed += ticketsPending;
          } else {
            totalPrice = ticketsLeft*_ticketSchedule[i].price;
            ticketsPending = ticketsPending - ticketsLeft;
            _ticketSchedule[i].ticketsUsed += ticketsLeft;
          }
          ticketScheduleBook[eventId][i] = _ticketSchedule[i];
          if(ticketsPending == 0){
            break;
          }
      }
    }
    for(uint256 i=0; i< _noOfTickets; i++){
      _eventDetails.ticketsSold +=1;
      TicketNFTInterface(_eventDetails.nftContractAddress).mintTicketNFT(
          _eventDetails.ticketsSold,
          msg.sender
      );
    }
    require(msg.value >= totalPrice, "Tickets require more funds");
    eventDetailsBook[_eventId] = _eventDetails;
  }

  function markEventAttendance(uint256 _eventId, uint256 _ticketId) external virtual{
    eventDetails memory _eventDetails = eventDetailsBook[_eventId];
    address nftOwner = TicketNFTInterface(_eventDetails.nftContractAddress).ownerOf(_ticketId);
    require(
      nftOwner == msg.sender &&
      block.timestamp >= _eventDetails.eventStartTime &&
      block.timestamp < (_eventDetails.eventStartTime + _eventDetails.eventDuration) &&
      !(_eventDetails.isEventCancelled), "Only User owning the NFT can mark the attendance"
    );
    _eventDetails.totalAttendees +=1;
    eventDetailsBook[_eventId] = _eventDetails;
    TicketNFTInterface(_eventDetails.nftContractAddress).burnTicketNFT(_ticketId);
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

  function redeemCancelledEventTicket(uint256 _eventId, uint256[] calldata _ticketIds) external virtual {
    eventDetails memory _eventDetails = eventDetailsBook[_eventId];
    ticketSchedule[] memory _ticketSchedule = ticketScheduleBook[_eventId];
    uint256 totalRefundPrice = 0;
    uint256 totalTickets = 0;
    require(
      _eventDetails.isEventCancelled, "Only cancelled events can be redeemed."
    );
    for (uint256 i=0;i<_ticketIds.length;i++){
      address nftOwner = TicketNFTInterface(_eventDetails.nftContractAddress).ownerOf(_ticketIds[i]);
      require(
        nftOwner == msg.sender, "Only ticket owner can ask for refund."
      );
      for(uint256 j=0; j<_ticketSchedule.length; j++){
        totalTickets+=_ticketSchedule[j].ticketsNo;
        if(totalTickets >= _ticketIds[i]){
          totalRefundPrice+=_ticketSchedule[j].price;
          break;
        }
      }
      TicketNFTInterface(_eventDetails.nftContractAddress).burnTicketNFT(_ticketIds[i]);
    }
    address payable receiver = payable(msg.sender);
    receiver.transfer(totalRefundPrice);
  }

  function resellTicket(uint256 _eventId, uint256 _ticketId, uint256 _price) external virtual payable {
    eventDetails memory _eventDetails = eventDetailsBook[_eventId];
    address nftOwner = TicketNFTInterface(_eventDetails.nftContractAddress).ownerOf(_ticketId);

    require(
      _eventDetails.eventHost != address(0) &&
      _eventDetails.eventStartTime > block.timestamp &&
      nftOwner == msg.sender &&
      _price>0 &&
      block.timestamp >= _eventDetails.resellStartTime &&
      !(_eventDetails.isEventCancelled), "Invalid Input"
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
    TicketNFTInterface(_eventDetails.nftContractAddress).transferFrom(msg.sender, address(this), _ticketId);
  }

  function cancelresellTicketOrder(uint256 _tradeId) external virtual{
    tradeDetails memory _tradeDetails = tradeDetailsBook[_tradeId];
    eventDetails memory _eventDetails = eventDetailsBook[_tradeDetails.eventId];
    address nftOwner = TicketNFTInterface(_eventDetails.nftContractAddress).ownerOf(_tradeDetails.ticketId);
    require(
      _tradeDetails.orderCreator != address(0) &&
      _tradeDetails.orderCreator == msg.sender &&
      !(_tradeDetails.isOrderCancelled) &&
      !(_tradeDetails.orderFulfilled) &&
      nftOwner == address(this) , "Order can only be cancelled by the order creator or order is cancelled or fulfilled"
    );
    _tradeDetails.isOrderCancelled = true;
    TicketNFTInterface(_eventDetails.nftContractAddress).transferFrom(address(this), msg.sender, _tradeDetails.ticketId);
    tradeDetailsBook[_tradeId] = _tradeDetails;
  }

  function buyResellTicket(uint256 _tradeId) external virtual payable{
    tradeDetails memory _tradeDetails = tradeDetailsBook[_tradeId];
    eventDetails memory _eventDetails = eventDetailsBook[_tradeDetails.eventId];
    address nftOwner = TicketNFTInterface(_eventDetails.nftContractAddress).ownerOf(_tradeDetails.ticketId);

    require(
      _tradeDetails.orderCreator != address(0) &&
      nftOwner == address(this) && 
      _tradeDetails.orderCreator != msg.sender &&
      !(_tradeDetails.isOrderCancelled) &&
      !(_tradeDetails.orderFulfilled) &&
      _eventDetails.eventStartTime > block.timestamp &&
      block.timestamp >= _eventDetails.resellStartTime, "Order should be in active state and the ticketing event should not have started."
    );

    TicketNFTInterface(_eventDetails.nftContractAddress).transferFrom(address(this), msg.sender, _tradeDetails.ticketId);
    payable(address(this)).transfer(_tradeDetails.price);
    (payable(msg.sender)).transfer(_tradeDetails.price);
    _tradeDetails.orderFulfilled = true;
    tradeDetailsBook[_tradeId] = _tradeDetails;
  }

  /// @notice Function uses EIP-1167 implementation
  function create(address _target) internal returns (address result) {
      bytes20 targetBytes = bytes20(_target);
      assembly {
          let clone := mload(0x40)
          mstore(
              clone,
              0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000
          )
          mstore(add(clone, 0x14), targetBytes)
          mstore(
              add(clone, 0x28),
              0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000
          )
          result := create(0, clone, 0x37)
      }
  }

  function contractBalance() public view returns(uint256) {
    return address(this).balance;
  }
}