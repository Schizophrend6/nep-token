// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.4.22 <0.9.0;
import "openzeppelin-solidity/contracts/access/Ownable.sol";

interface IBEP20Like {
  function balanceOf(address account) external view returns (uint256);

  function transfer(address destination, uint256 amount) external returns (bool);
}

/**
 * @dev Recoverable Contract
 * @notice Do not send anything to this contract. Just because the tokens and BNB can be recovered from this contract
 * does not mean that you should.
 *
 * The owner key will be used sparingly which means we can't recover your tokens whenever you want.
 * It may take months for us to be able to use this key or we may transfer the ownership of this contract
 * to 0x. You can not and should not depend on this feature.
 */
abstract contract Recoverable is Ownable {
  /**
   * @dev Recover all Ether held by the contract to the owner.
   */
  function recoverEther() external onlyOwner {
    address owner = super.owner();
    payable(owner).transfer(address(this).balance);
  }

  /**
   * @dev Recover any BEP-20 compatible tokens sent to this address.
   * @param token BEP-20 The address of the token contract
   */
  function recoverToken(address token) external onlyOwner {
    address owner = super.owner();
    IBEP20Like bep20 = IBEP20Like(token);

    uint256 balance = bep20.balanceOf(address(this));
    bep20.transfer(owner, balance);
  }
}
