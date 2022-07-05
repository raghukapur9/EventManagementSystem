// SPDX-License-Identifier: Unlicenced

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "../node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../node_modules/@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
pragma solidity ^0.8.4;

contract TicketNFT is  Initializable ,OwnableUpgradeable, ERC721Upgradeable{
    address public controller;

    function initialize(string memory _name) public initializer {
        __Ownable_init();
        __ERC721_init(_name, _name);
    }

    function setController(address _controller) public {
        require((msg.sender == owner()), "Only owner can set controller");
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
