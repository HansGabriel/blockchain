// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SimpleStorage {
    uint256 private storedValue;
    address public owner;

    // Stretch: history of all values ever stored
    uint256[] private history;

    event ValueChanged(uint256 newValue);
    event UnauthorizedAccess(address attemptedBy);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function set(uint256 _value) public onlyOwner {
        storedValue = _value;
        history.push(_value);
        emit ValueChanged(_value);
    }

    function get() public view returns (uint256) {
        return storedValue;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getHistory() public view returns (uint256[] memory) {
        return history;
    }
}
