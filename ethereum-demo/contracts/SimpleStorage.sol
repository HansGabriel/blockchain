// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SimpleStorage {
    // State variable — stored on-chain
    uint256 private storedValue;

    // Event — emitted when value changes
    event ValueChanged(uint256 newValue);

    // Write function — costs gas
    function set(uint256 _value) public {
        storedValue = _value;
        emit ValueChanged(_value);
    }

    // Read function — free (view)
    function get() public view returns (uint256) {
        return storedValue;
    }
}