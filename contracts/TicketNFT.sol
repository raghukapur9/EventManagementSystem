// SPDX-License-Identifier: Unlicenced

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

pragma solidity ^0.8.4;

contract TicketNFT is ERC721Upgradeable {
    address public controller;
    address public owner;

    constructor(){
        owner = msg.sender;
    }

    function setController(address _controller) public {
        require((msg.sender == owner), "Only owner can set controller");
        controller = _controller;
    }

    function mintTicketNFT(uint256 _tokenID, address _lender) public {
        require(msg.sender == controller, "Controller can only mint");
        _mint(_lender, _tokenID);
    }

    function burnTicketNFT(uint256 _tokenID) public {
        require(msg.sender == controller, "Controller can only burn");
        _burn(_tokenID);
    }
}
