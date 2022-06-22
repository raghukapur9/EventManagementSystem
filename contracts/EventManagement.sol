// SPDX-License-Identifier: Unlicenced
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.4;

contract EventManagement is Initializable, Ownable{
  struct eventDetails {
    uint256 ticketsNo;
    uint256 eventStartTime;
    address paymentAddress;
    uint256 price;
    uint256 eventDuration;
    uint256 ticketsPerUser;
    string eventName;
    uint256 ticketsUsed;
  }
  // change this to event id to event details, add owner address to struct
  mapping(address => eventDetails) public eventDetailsBook;

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
    // create event details entry in the event details book
    eventDetailsBook[msg.sender] = eventDetails(
      _ticketNo,
      _eventStartTime,
      _paymentAddress,
      _price,
      _eventDuration,
      _ticketsPerUser,
      _eventName,
      0
    );
  }

  function createEvent(address _eventAddress) external virtual{
    // add check for max tickets, need to check if there is direct way to get this
    require(
      _eventAddress != address(0) &&
      eventDetailsBook[_eventAddress].paymentAddress != address(0) &&
      eventDetailsBook[_eventAddress].eventStartTime > block.timestamp, "Invalid Input"
    );

  }

}