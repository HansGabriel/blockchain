// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "./SimpleStorage.sol";

contract SimpleStorageTest is Test {
    SimpleStorage public store;

    // Runs before each test — like beforeEach
    function setUp() public {
        store = new SimpleStorage();
    }

    function test_InitialValueIsZero() public view {
        assertEq(store.get(), 0);
    }

    function test_SetAndGetValue() public {
        store.set(42);
        assertEq(store.get(), 42);
    }

    function test_EmitsValueChanged() public {
        vm.expectEmit();
        emit SimpleStorage.ValueChanged(99);
        store.set(99);
    }
}