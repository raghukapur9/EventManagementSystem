// SPDX-License-Identifier: Unlicenced
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

contract TicketNFT is  Initializable ,OwnableUpgradeable, ERC721Upgradeable{
    address public controller;
    bool initialized;

    function initialize(string memory _name) public initializer {
        __Ownable_init();
        __ERC721_init(_name, _name);
    }

    function setController(address _controller) public {
        require((msg.sender == owner()), "Only owner can set controller");
        controller = _controller;
    }

    function mintTicketNFT(uint256 _tokenID, address _ticketOwner) public {
        require(msg.sender == controller, "Controller can only mint");
        _mint(_ticketOwner, _tokenID);
    }

    function burnTicketNFT(uint256 _tokenID) public {
        require(msg.sender == controller, "Controller can only burn");
        _burn(_tokenID);
    }
}
