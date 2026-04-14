// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IComplianceGate {
    function isCompliant(address wallet) external view returns (bool);
}

contract GatedVault {
    IComplianceGate public immutable gate;
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    constructor(address _gate) {
        gate = IComplianceGate(_gate);
    }

    function deposit() external payable {
        require(gate.isCompliant(msg.sender), "KYC compliance required");
        require(msg.value > 0, "Must deposit something");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        (bool success,) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        emit Withdrawal(msg.sender, amount);
    }
}
