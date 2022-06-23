// SPDX-License-Identifier: Unlicenced

pragma solidity ^0.8.4;
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

interface TicketNFTInterface {
    function mintTicketNFT(uint256 _tokenID, address _lender) external;

    function burnTicketNFT(uint256 _tokenID) external;

    function ownerOf(uint256 _tokenID) external returns (address);
}

contract EventManagement{
  using SafeERC20Upgradeable for IERC20Upgradeable;

  uint256 public eventId;
  address public ticketNFT;

  struct eventDetails {
    address eventHost;
    uint256 ticketsNo;
    uint256 eventStartTime;
    address paymentAddress;
    uint256 price;
    uint256 eventDuration;
    uint256 ticketsPerUser;
    string eventName;
    uint256 ticketsUsed;
    uint256 totalAttendees;
  }
  mapping(uint256 => eventDetails) public eventDetailsBook;
  address payable public owner;

    constructor(address _nft){
      ticketNFT = _nft;
      owner = payable(msg.sender);
      eventId = 0;
    }


  function createEvent(
      uint256 _ticketNo,
      uint256 _eventStartTime,
      address _paymentAddress,
      uint256 _price,
      uint256 _eventDuration,
      uint256 _ticketsPerUser,
      string memory _eventName
  ) external virtual{

    require(
      _ticketNo>0 &&
      _eventStartTime>block.timestamp &&
      _paymentAddress != address(0) &&
      _eventDuration >0 &&
      _ticketsPerUser >0 &&
      bytes(_eventName).length != 0, "Incorrect Inputs"
      );
    
    eventId +=1;
    // create event details entry in the event details book
    eventDetailsBook[eventId] = eventDetails(
      msg.sender,
      _ticketNo,
      _eventStartTime,
      _paymentAddress,
      _price,
      _eventDuration,
      _ticketsPerUser,
      _eventName,
      0,
      0
    );
  }

  function buyEventTicket(uint256 _eventId) external virtual payable{
    // add check for max tickets, need to check if there is direct way to get this
    eventDetails memory _eventDetails = eventDetailsBook[_eventId];

    require(
      _eventDetails.eventHost != address(0) &&
      _eventDetails.eventStartTime > block.timestamp &&
      _eventDetails.ticketsUsed < _eventDetails.ticketsNo &&
      msg.value == _eventDetails.price , "Invalid Input"
    );

    _eventDetails.ticketsUsed +=1;

    owner.transfer(_eventDetails.price);
    (payable(msg.sender)).transfer(_eventDetails.price);
    // create NFT here
    uint256 tokenId = uint256(
    keccak256(
      abi.encodePacked(
      _eventId,
      msg.sender,
      _eventDetails.ticketsUsed
      )
    )
    );
    TicketNFTInterface(ticketNFT).mintTicketNFT(
        tokenId,
        msg.sender
    );
    eventDetailsBook[_eventId] = _eventDetails;

  }

  function markEventAttendance(uint256 _eventId, uint256 _ticketUsed) external virtual payable{
    uint256 userTokenId = uint256(
    keccak256(
      abi.encodePacked(
      _eventId,
      msg.sender,
      _ticketUsed
      )
    )
    );
    address nftOwner = TicketNFTInterface(ticketNFT).ownerOf(userTokenId);
    eventDetails memory _eventDetails = eventDetailsBook[_eventId];
    require(
      nftOwner == msg.sender &&
      block.timestamp >= _eventDetails.eventStartTime &&
      block.timestamp < (_eventDetails.eventStartTime + _eventDetails.eventDuration), "Only User owning the NFT can mark the attendance"
    );
    _eventDetails.totalAttendees +=1;
    eventDetailsBook[_eventId] = _eventDetails;
    TicketNFTInterface(ticketNFT).burnTicketNFT(userTokenId);
  }

}