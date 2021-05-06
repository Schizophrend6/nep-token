require('chai').use(require('chai-as-promised')).should()
const NeptuneMutualToken = artifacts.require('./NeptuneMutualToken')
const FakeToken = artifacts.require('./Token')
const Destroyable = artifacts.require('./Destroyable')
const { advanceToTime } = require('./blocks')
const { toWei, MintKey, allocations, foundingTeamYearlyAllocation, DAYS, ZERO_X } = require('./constants')

contract('Neptune Mutual Token', (accounts) => {
  const [owner, alice, bob] = accounts

  let nep

  before(async () => {
    nep = await NeptuneMutualToken.new()
  })

  it('correctly deployed', async () => {
    ; (await nep._mintCap(MintKey.SEED)).toString().should.equal(toWei(allocations[MintKey.SEED]))
    ; (await nep._mintCap(MintKey.COMMUNITY)).toString().should.equal(toWei(allocations[MintKey.COMMUNITY]))
    ; (await nep._mintCap(MintKey.LP_REWARDS)).toString().should.equal(toWei(allocations[MintKey.LP_REWARDS]))
    ; (await nep._mintCap(MintKey.PROTOCOL_INCENTIVE)).toString().should.equal(toWei(allocations[MintKey.PROTOCOL_INCENTIVE]))
    ; (await nep._mintCap(MintKey.TOKEN_SALE_OR_DISTRIBUTION)).toString().should.equal(toWei(allocations[MintKey.TOKEN_SALE_OR_DISTRIBUTION]))
    ; (await nep._mintCap(MintKey.ECOSYSTEM_FUND)).toString().should.equal(toWei(allocations[MintKey.ECOSYSTEM_FUND]))
    ; (await nep._mintCap(MintKey.LONG_TERM_PROTOCOL_INCENTIVE)).toString().should.equal(toWei(allocations[MintKey.LONG_TERM_PROTOCOL_INCENTIVE]))
    ; (await nep._mintCap(MintKey.FOUNDING_TEAM_LEGAL)).toString().should.equal(toWei(allocations[MintKey.FOUNDING_TEAM_LEGAL]))

    ; (await nep._mintLock(MintKey.ECOSYSTEM_FUND)).toString().should.equal('31536000') // One year = 31536000
    ; (await nep._mintLock(MintKey.LONG_TERM_PROTOCOL_INCENTIVE)).toString().should.equal('31536000')

    ; (await nep.getOwner()).should.equal(owner)
  })

  describe('Set Minter', () => {
    it('does not allow invalid key to be added', async () => {
      await nep.addMinter(0, alice, { from: owner }).should.be.rejectedWith('specify a key')
    })

    it('does not allow zero address to be added', async () => {
      await nep.addMinter(MintKey.SEED, ZERO_X, { from: owner }).should.be.rejectedWith('specify an account')
    })

    it('does not allow same address to be added again', async () => {
      await nep.addMinter(MintKey.SEED, alice, { from: owner }).should.not.be.rejected
      await nep.addMinter(MintKey.SEED, alice, { from: owner }).should.be.rejectedWith('Already a minter')
      await nep.removeMinter(MintKey.SEED, alice, { from: owner })
    })

    it('properly sets the minter', async () => {
      await nep.addMinter(1, alice, { from: bob }).should.be.rejected // only owner can add

      for (let mintKey = 1; mintKey < 9; mintKey++) {
        await nep.addMinter(mintKey, alice, { from: owner })
      }
    })

    it('does not allow invalid key to be removed', async () => {
      await nep.removeMinter(0, alice, { from: owner }).should.be.rejectedWith('specify a key')
    })

    it('does not allow zero address to be removed', async () => {
      await nep.removeMinter(MintKey.SEED, ZERO_X, { from: owner }).should.be.rejectedWith('specify an account')
    })

    it('does not allow removing an address not present', async () => {
      await nep.removeMinter(MintKey.SEED, bob, { from: owner }).should.be.rejectedWith('Not a minter')
    })

    it('properly removes the minter', async () => {
      await nep.removeMinter(1, alice, { from: bob }).should.be.rejected // only owner can add

      for (let mintKey = 1; mintKey < 9; mintKey++) {
        await nep.removeMinter(mintKey, alice, { from: owner })
      }
    })
  })

  describe('Minting tokens', () => {
    beforeEach(async () => {
      nep = await NeptuneMutualToken.new()
      await nep.addMinter(MintKey.SEED, alice)
    })

    it('non minters are unable to mint', async () => {
      await nep.mintTokens(MintKey.SEED, alice, toWei(1)).should.be.rejected // not a minter
    })

    it('does not allow invalid minting key', async () => {
      await nep.mintTokens(MintKey.INVALID, alice, toWei(1), { from: alice }).should.be.rejectedWith('Please try again') // invalid key
    })

    it('does not allow zero value mints', async () => {
      await nep.mintTokens(MintKey.SEED, alice, '0', { from: alice }).should.be.rejected // should mint something
    })

    it('does not allow to mint to zero address', async () => {
      await nep.mintTokens(MintKey.SEED, ZERO_X, toWei(1), { from: alice }).should.be.rejected // should not allow minting to zero address
    })
  })

  describe('LP reward token mint', () => {
    beforeEach(async () => {
      nep = await NeptuneMutualToken.new()
      await nep.addMinter(MintKey.LP_REWARDS, alice)
    })

    it('allows everything to be minted at once', async () => {
      const allowed = allocations[MintKey.LP_REWARDS]

      await nep.mintTokens(MintKey.LP_REWARDS, alice, toWei(allowed + 1), { from: alice }).should.be.rejected
      await nep.mintTokens(MintKey.LP_REWARDS, alice, toWei(allowed), { from: alice }).should.not.be.rejected
    })

    it('allows tokens to minted in tranches', async () => {
      await nep.mintTokens(MintKey.LP_REWARDS, alice, toWei(1), { from: alice }).should.not.be.rejected
      await nep.mintTokens(MintKey.LP_REWARDS, alice, toWei(10), { from: alice }).should.not.be.rejected
      await nep.mintTokens(MintKey.LP_REWARDS, alice, toWei(100), { from: alice }).should.not.be.rejected
      await nep.mintTokens(MintKey.LP_REWARDS, alice, toWei(1000), { from: alice }).should.not.be.rejected
      await nep.mintTokens(MintKey.LP_REWARDS, alice, toWei(10000), { from: alice }).should.not.be.rejected
      await nep.mintTokens(MintKey.LP_REWARDS, alice, toWei(allocations[MintKey.LP_REWARDS]), { from: alice }).should.be.rejected
      await nep.mintTokens(MintKey.LP_REWARDS, alice, toWei(allocations[MintKey.LP_REWARDS] - 11111), { from: alice }).should.not.be.rejected
      await nep.mintTokens(MintKey.LP_REWARDS, alice, toWei(1), { from: alice }).should.be.rejected
    })
  })

  describe('Seed token mint', () => {
    beforeEach(async () => {
      nep = await NeptuneMutualToken.new()
      await nep.addMinter(MintKey.SEED, alice)
    })

    it('allows tokens to minted in tranches', async () => {
      let allowed = allocations[MintKey.SEED] * 0.20

      await nep.mintTokens(MintKey.SEED, alice, toWei(allowed + 1), { from: alice }).should.be.rejected
      await nep.mintTokens(MintKey.SEED, alice, toWei(allowed), { from: alice }).should.not.be.rejected

      await advanceToTime(365 * DAYS)

      allowed = allocations[MintKey.SEED] * 0.40

      await nep.mintTokens(MintKey.SEED, alice, toWei(allowed + 1), { from: alice }).should.be.rejected
      await nep.mintTokens(MintKey.SEED, alice, toWei(allowed), { from: alice }).should.not.be.rejected

      await advanceToTime(365 * DAYS)

      allowed = allocations[MintKey.SEED] * 0.40

      await nep.mintTokens(MintKey.SEED, alice, toWei(allowed + 1), { from: alice }).should.be.rejected
      await nep.mintTokens(MintKey.SEED, alice, toWei(allowed), { from: alice }).should.not.be.rejected
    })

    it('allows tokens to be delayed minted', async () => {
      await advanceToTime(365 * DAYS)

      let allowed = allocations[MintKey.SEED] * 0.60

      await nep.mintTokens(MintKey.SEED, alice, toWei(allowed + 1), { from: alice }).should.be.rejected
      await nep.mintTokens(MintKey.SEED, alice, toWei(allowed), { from: alice }).should.not.be.rejected

      await advanceToTime(365 * DAYS)

      allowed = allocations[MintKey.SEED] * 0.40

      await nep.mintTokens(MintKey.SEED, alice, toWei(allowed + 1), { from: alice }).should.be.rejected
      await nep.mintTokens(MintKey.SEED, alice, toWei(allowed), { from: alice }).should.not.be.rejected
    })

    it('allows tokens to be minted at last', async () => {
      await advanceToTime(365 * DAYS)
      await advanceToTime(365 * DAYS)

      const allowed = allocations[MintKey.SEED]

      await nep.mintTokens(MintKey.SEED, alice, toWei(allowed + 1), { from: alice }).should.be.rejected
      await nep.mintTokens(MintKey.SEED, alice, toWei(allowed), { from: alice }).should.not.be.rejected
    })
  })

  describe('Team token mint', () => {
    beforeEach(async () => {
      nep = await NeptuneMutualToken.new()
      await nep.addMinter(MintKey.FOUNDING_TEAM_LEGAL, alice)
    })

    it('only mints 20% per year', async () => {
      const allowed = allocations[MintKey.FOUNDING_TEAM_LEGAL]
      const yearly = foundingTeamYearlyAllocation

      await nep.mintTokens(MintKey.FOUNDING_TEAM_LEGAL, alice, toWei(allowed), { from: alice }).should.be.rejected
      await nep.mintTokens(MintKey.FOUNDING_TEAM_LEGAL, alice, toWei(yearly), { from: alice }).should.be.rejected

      for (let year = 1; year < 6; year++) {
        await advanceToTime(365 * DAYS)

        await nep.mintTokens(MintKey.FOUNDING_TEAM_LEGAL, alice, toWei(yearly + 1), { from: alice }).should.be.rejected
        await nep.mintTokens(MintKey.FOUNDING_TEAM_LEGAL, alice, toWei(yearly), { from: alice }).should.not.be.rejected
      }

      await advanceToTime(365 * DAYS)
      await nep.mintTokens(MintKey.FOUNDING_TEAM_LEGAL, alice, toWei(1), { from: alice }).should.be.rejected
    })
  })

  describe('Other minting restrictions', () => {
    beforeEach(async () => {
      nep = await NeptuneMutualToken.new()
      await nep.addMinter(MintKey.TOKEN_SALE_OR_DISTRIBUTION, alice)
      await nep.addMinter(MintKey.ECOSYSTEM_FUND, alice)
    })

    it('does not allow to mint ecosystem and partnership tokens before 1 year of token distribution', async () => {
      await advanceToTime(700 * DAYS)
      await nep.mintTokens(MintKey.ECOSYSTEM_FUND, alice, toWei(1), { from: alice })
        .should.be.rejectedWith('Token distribution never happened')
    })

    it('will allow to mint ecosystem and partnership tokens after 1 year of token distribution', async () => {
      await nep.mintTokens(MintKey.TOKEN_SALE_OR_DISTRIBUTION, alice, toWei(1), { from: alice }).should.not.be.rejected

      await advanceToTime(185 * DAYS)
      await nep.mintTokens(MintKey.ECOSYSTEM_FUND, alice, toWei(1), { from: alice }).should.be.rejectedWith('too early')

      await advanceToTime(185 * DAYS)
      await nep.mintTokens(MintKey.ECOSYSTEM_FUND, alice, toWei(1), { from: alice }).should.not.be.rejected
      await nep.mintTokens(MintKey.ECOSYSTEM_FUND, alice, toWei(allocations[MintKey.ECOSYSTEM_FUND] - 1), { from: alice }).should.not.be.rejected
    })
  })

  describe('Burn tokens', () => {
    before(async () => {
      nep = await NeptuneMutualToken.new()
      await nep.addMinter(MintKey.SEED, alice)
    })

    it('burns the requested amount of tokens held by the sender', async () => {
      await nep.mintTokens(MintKey.SEED, alice, toWei(100), { from: alice })

      await nep.burn(toWei(99), { from: alice })

      const balance = await nep.balanceOf(alice)
      balance.toString().should.equal(toWei(1))
    })
  })

  describe('Recoverable', () => {
    it('allows recovering accidental BNB transfers', async () => {
      const destroyable = await Destroyable.new({
        value: toWei(10)
      })

      await destroyable.destroy(nep.address)
      let balance = await web3.eth.getBalance(nep.address)
      balance.toString().should.equal(toWei(10))

      await nep.recoverEther()

      balance = await web3.eth.getBalance(nep.address)
      balance.toString().should.equal('0')
    })

    it('allows recovering accidental token transfers', async () => {
      const fakeToken = await FakeToken.new('Fake', 'Fake', toWei(1000000))
      fakeToken.transfer(nep.address, toWei(100))

      let balance = await fakeToken.balanceOf(nep.address)
      balance.toString().should.equal(toWei(100))

      await nep.recoverToken(fakeToken.address)

      balance = await fakeToken.balanceOf(nep.address)
      balance.toString().should.equal('0')
    })
  })
})
