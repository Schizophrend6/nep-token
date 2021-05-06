const MintKey = {
  INVALID: 0,
  SEED: 1,
  COMMUNITY: 2,
  LP_REWARDS: 3,
  PROTOCOL_INCENTIVE: 4,
  TOKEN_SALE_OR_DISTRIBUTION: 5,
  ECOSYSTEM_FUND: 6,
  LONG_TERM_PROTOCOL_INCENTIVE: 7,
  FOUNDING_TEAM_LEGAL: 8
}

const allocations = [
  0,
  45000000,
  22500000,
  67500000,
  90000000,
  135000000,
  180000000,
  225000000,
  135000000
]

const foundingTeamYearlyAllocation = allocations[MintKey.FOUNDING_TEAM_LEGAL] * 0.2
const ZERO_X = '0x0000000000000000000000000000000000000000'
const DAYS = 86400

const toWei = (x) => {
  return web3.utils.toWei(x.toString())
}

module.exports = { toWei, MintKey, allocations, foundingTeamYearlyAllocation, ZERO_X, DAYS }
