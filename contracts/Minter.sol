// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.4.22 <0.9.0;
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
import "./Recoverable.sol";
import "./Constants.sol";

abstract contract Minter is Constants, Recoverable {
  uint256 public _tokenDistributionDate;
  mapping(MintKey => mapping(address => bool)) public _minters;

  event MinterAdded(MintKey indexed key, address indexed account);
  event MinterRemoved(MintKey indexed key, address indexed account);

  /**
   * @dev Adds an account to the minter's list.
   * @param key The minting key
   * @param account The account that will be able to mint the tokens
   * allocated to the supplied key.
   */
  function addMinter(MintKey key, address account) external onlyOwner {
    require(key != MintKey.INVALID, "Please specify a key");
    require(account != address(0), "Please specify an account");
    require(!_minters[key][account], "Already a minter");

    _minters[key][account] = true;
    emit MinterAdded(key, account);
  }

  /**
   * @dev Removes the given account from the minter's list.
   * @param key The minting key
   * @param account The account that is going to lose the ability
   * to mint tokens allocated to the supplied key.
   */
  function removeMinter(MintKey key, address account) external onlyOwner {
    require(key != MintKey.INVALID, "Please specify a key");
    require(account != address(0), "Please specify an account");
    require(_minters[key][account], "Not a minter");

    delete _minters[key][account];
    emit MinterRemoved(key, account);
  }
}
