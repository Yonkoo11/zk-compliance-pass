// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockKycSBT {
    struct KycInfo {
        string ensName;
        uint8 level;
        uint8 status; // 0=NONE, 1=APPROVED, 2=REVOKED
        uint256 createTime;
    }

    mapping(address => KycInfo) private kycData;

    event KycSet(address indexed user, uint8 level, string ensName);

    function setKyc(address user, string calldata ensName, uint8 level) external {
        kycData[user] = KycInfo(ensName, level, 1, block.timestamp);
        emit KycSet(user, level, ensName);
    }

    function isHuman(address account) external view returns (bool, uint8) {
        KycInfo memory info = kycData[account];
        return (info.status == 1, info.level);
    }

    function getKycInfo(address account) external view returns (
        string memory ensName,
        uint8 level,
        uint8 status,
        uint256 createTime
    ) {
        KycInfo memory info = kycData[account];
        return (info.ensName, info.level, info.status, info.createTime);
    }
}
