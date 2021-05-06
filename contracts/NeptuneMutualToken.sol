// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.4.22 <0.9.0;
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/security/ReentrancyGuard.sol";
import "./Minter.sol";

contract NeptuneMutualToken is ReentrancyGuard, ERC20, Minter {
  using SafeMath for uint256;

  mapping(MintKey => uint256) public _mintLock;
  mapping(MintKey => uint256) public _mintCap;
  mapping(MintKey => uint256) public _totalMint;
  uint256 public _originationDate = block.timestamp; // solhint-disable-line

  event TokenMinted(MintKey indexed key, uint256 remaining, address indexed minter, address indexed account, uint256 amount);
  event TokenBurned(address indexed account, uint256 amount);

  /**
   * @dev Neptune Mutual Token
   */
  constructor() ERC20("Neptune Mutual Token", "NEP") {
    _mintCap[MintKey.SEED] = _ALLOCATION_SEED;
    _mintCap[MintKey.COMMUNITY] = _ALLOCATION_COMMUNITY_INCENTIVE;
    _mintCap[MintKey.LP_REWARDS] = _ALLOCATION_LIQUIDITY_POOL_REWARDS;
    _mintCap[MintKey.PROTOCOL_INCENTIVE] = _ALLOCATION_PROTOCOL_INCENTIVE;
    _mintCap[MintKey.TOKEN_SALE_OR_DISTRIBUTION] = _ALLOCATION_TOKEN_SALE_OR_DISTRIBUTION;
    _mintCap[MintKey.ECOSYSTEM_FUND] = _ALLOCATION_ECOSYSTEM_FUND;
    _mintCap[MintKey.LONG_TERM_PROTOCOL_INCENTIVE] = _ALLOCATION_LT_PROTOCOL_INCENTIVE;
    _mintCap[MintKey.FOUNDING_TEAM_LEGAL] = _ALLOCATION_FOUNDING_TEAM_LEGAL;

    _mintLock[MintKey.ECOSYSTEM_FUND] = _ONE_YEAR;
    _mintLock[MintKey.LONG_TERM_PROTOCOL_INCENTIVE] = _ONE_YEAR;
  }

  /**
   * @dev Sets the token distribution/sale start date.
   * Token distribution date is required for majority of minting allocations
   * to become effective.
   */
  function _setDistributionDate() private {
    /**********************************************************************************************
    * Reaching this stage means the idea was valid and well supported by the community.           *
    * Minting the "distribution" token now activates all locking mechanisms.                      *
    *                                                                                             *
    * In other words without token distribution none of these minting allocations can be utilized *
    *                                                                                             *
    * -> Ecosystem and Partnership Fund                                                           *
    * -> Protocol Incentives                                                                      *
    * -> Founding Team, Employees, and Advisory Pool                                              *
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Remember more than 80% of the token supply will never see the light of day                  *
    * if this project does not succeed. We embrace lean startup spirit, self funding the project  *
    * and not depending on investor capital before we prove our idea and achieve a momentum.      *
    /*********************************************************************************************/
    _tokenDistributionDate = block.timestamp; // solhint-disable-line
  }

  /**
   *@dev This ensures that token distribution happened.
   */
  function _requireTokenDistribution() private view {
    require(_tokenDistributionDate > 0, "Token distribution never happened"); // solhint-disable-line
  }

  /**
   *@dev Verifies the current date is after the token distribution date
   * plus the specified period.
   * @param period Number of days to add to the token distribution date
   */
  function _notBeforeLock(uint256 period) private view {
    require(block.timestamp >= _tokenDistributionDate.add(period), "You are too early"); // solhint-disable-line
  }

  /**
   * @dev Ensures the seed token minting request is acceptable.
   * @param amount The requested amount to mint
   */
  function _validateSeedTokenMint(uint256 amount) private view {
    /************************************************************
    * Seed round:                                               *
    *** ********** ** *** ********** ** *** ********** ** *** *** 
    * 10% is transferred after token origination                *
    * 40% is locked for 1 year                                  *
    * 50% is locked for 2 years                                 *
    /************************************************************/
    uint256 alreadyMinted = _totalMint[MintKey.SEED];
    uint256 elapsedYears = block.timestamp.sub(_originationDate).div(_ONE_YEAR); // solhint-disable-line

    // Total: 20 percent
    uint256 maximum = (_ALLOCATION_SEED * 200000) / 1000000;

    if (elapsedYears == 1) {
      // Total: 60 percent
      maximum = (_ALLOCATION_SEED * 600000) / 1000000;
    }

    if (elapsedYears > 1) {
      // Total: All tokens
      maximum = _ALLOCATION_SEED;
    }

    require(maximum >= alreadyMinted.add(amount), "Restricted allocation");
  }

  /**
   * @dev Ensures the team token minting request is acceptable.
   * @param amount The requested amount to mint
   */
  function _validateTeamTokenMint(uint256 amount) private view {
    uint256 alreadyMinted = _totalMint[MintKey.FOUNDING_TEAM_LEGAL];
    uint256 elapsedYears = block.timestamp.sub(_originationDate).div(_ONE_YEAR); // solhint-disable-line

    /******************************************************************
    * The team tokens are distributed during course of 5 years.       *
    * For simplicity, 20% of team token is allocated every year       *
    * beginning from the token distribution date anniversary without  *
    * any cliff or monthly vesting.                                   *
    /*****************************************************************/
    uint256 maximum = _ALLOCATION_FOUNDING_TEAM_LEGAL_ANNUAL.mul(elapsedYears); // Wait at least one year
    require(maximum >= alreadyMinted.add(amount), "Attempt to exceed allocation");
  }

  /**
   * @dev Mints tokens by the supplied key, account, and amount.
   * Supports partial minting by the given key.
   * @param key The minting key
   * @param account The account that will receive the minted tokens
   * @param amount The amount being minted
   */
  function mintTokens(
    MintKey key,
    address account,
    uint256 amount
  ) external nonReentrant {
    require(_minters[key][super._msgSender()], "Please try again");
    require(account != address(0), "Please specify an account");
    require(amount > 0, "Please specify an amount");

    /************************************************************
    * To verify if the requested amount of seed round tokens    *
    * can acutally be minted.                                   *
    /************************************************************/
    if (key == MintKey.SEED) {
      _validateSeedTokenMint(amount);
    }

    /************************************************************
    * To verify if the requested amount of founding team,       *
    * employees, corporate, legal, and advisory pool allocation *
    * can acutally be minted.                                   *
    /************************************************************/
    if (key == MintKey.FOUNDING_TEAM_LEGAL) {
      _validateTeamTokenMint(amount);
    }

    /************************************************************
    * To set the token distribution date so that other minting  *
    * allocations then become effective                         *
    /************************************************************/
    if (key == MintKey.TOKEN_SALE_OR_DISTRIBUTION && _tokenDistributionDate == 0) {
      _setDistributionDate();
    }

    // Locking duration
    uint256 lock = _mintLock[key];

    if (lock > 0) {
      _requireTokenDistribution(); // Not possible without token distribution event
      _notBeforeLock(lock); // Not possible before this locking period is over
    }

    uint256 cap = _mintCap[key];
    require(cap >= amount, "Attempt to exceed allocation");

    _mintCap[key] = cap.sub(amount); // Declining cap
    _totalMint[key] = _totalMint[key].add(amount); // Inclining total

    // After all checks are satisfied
    super._mint(account, amount);
    emit TokenMinted(key, cap.sub(amount), super._msgSender(), account, amount);
  }

  /**
   * @dev Returns the owner of this token contract.
   * Added to maintain compatibility with BEP-20 standard.
   */
  function getOwner() external view returns (address) {
    return super.owner();
  }

  /**
   * @dev Burns the requested amount of tokens held by the sender.
   * @param amount The requested amount to mint
   */
  function burn(uint256 amount) external {
    address account = super._msgSender();

    super._burn(account, amount);
    emit TokenBurned(account, amount);
  }
}
