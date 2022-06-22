// SPDX-License-Identifier: Unlicenced

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

pragma solidity ^0.8.4;

contract TicketNFT is Initializable, Ownable, ERC721 {
    address public controller;

    function setController(address _controller) public {
        require((msg.sender == owner()), "Only owner can set controller");
        controller = _controller;
    }

    function mintLoanNFT(uint256 _tokenID, address _lender) public {
        require(msg.sender == controller, "Controller can only mint");
        _mint(_lender, _tokenID);
    }

    function burnLoanNFT(uint256 _tokenID) public {
        require(msg.sender == controller, "Controller can only burn");
        _burn(_tokenID);
    }
}
