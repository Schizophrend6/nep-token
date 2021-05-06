# Neptune Mutual Token (NEP)

## Token Design

**Pre Release**

| Distribution                | Allocation   | Release                                 | Note                                                                          |
| --------------------------- | ------------ | --------------------------------------- | ----------------------------------------------------------------------------- |
| Seed Round                  | 45M NEP      | 20% (4.5M NEP)                          | Release: 20% immediately. After 1 Year: 40%. After 2 Years: 40%               |
| Community Incentives        | 22.5M NEP    | 1% initially, remaining in 12-72 Months | Community incentives will be gradually minted                                 |
| Liquidity Pool Rewards      | 67.5M NEP    | 25% initially, remaining in 12 Months   | Multiple rounds of liquidity pool rewards                                     |
| Initial Protocol Incentives | 90M NEP      | 0% initially, remaining in 12 Months    | Used in airdrops to BNB holders, and as prediction market and coverage reward |
| **Total**                   | **225M NEP** | **10-100% of this supply in 72 months** |                                                                               |

**Main Release**

Points to note:

1. There is always a risk when you're building new technology. What if nobody wants to use your product?
2. Since we value our early supporters and investors, we wish not to burn precious investor capital before we can showcase our product works and has a demand.
3. We value NEP tokens and so are very careful about the dilution of the tokens in the market. There is no continuous token supply mechanism and the tokens in circulation will be gradually burned. See burning for more info.
4. There will be token sales or distribution only if we get good traction.
5. The below distribution chart is only valid when token sale or distribution occurs.

| Distribution | Allocation | Release | Note |
| --- | --- | --- | --- |
| Token Sale, Listing, and/or Distribution | 135M NEP | 50% initially, remaining in 12 months | The below distributions are dependent on token distribution |
| Grant, Ecosystem Development, and Partnership Pool | 180M NEP | Released after 365 days of token sale start date |  |
| Long-term Protocol Incentives (Platform Users) | 225M NEP | Released after 365 days of token sale start date |  |
| Founding Team, Legal, Corporate, and Employee Rewards | 135M NEP | 365-day mint lock, and then 5-year vesting schedule. 20% released each year. |  |
| **Total** | **765M NEP** | **Distribution tokens released immediately, rest distributed gradually after 1 year** |  |

## Burning &amp; Staking Mechanism

**Staking**

- Governance: Voting rights.
- Staking NEP tokens to provide liquidity and earning rewards
- Staking NEP tokens to become coverage reporter
- Staking NEP tokens to create a new coverage market
- Staking NEP tokens to create a new prediction market

**Burning System**

- Creating a new coverage pool requires you to burn 1000 NEP tokens. Coverage creators will earn a small portion of the coverage fees collected in BUSD or BNB.
- 4000 NEP tokens must be staked when creating a coverage pool. The higher your stake, the more visibility your coverage will get in the market.
- Coverage pools are available in BUSD. We deduct 6.5% of the coverage fee or coverage claim in BUSD or BNB. The acquired BUSD will be used to purchase NEP tokens in the PancakeSwap exchange and then immediately burned in a single transaction.
- Providing liquidity to a coverage pool requires you to stake 250 NEP or higher.
- Creating a new prediction market requires you to burn 250 NEP tokens.
- The NEP tokens must be staked when creating a prediction market. The higher your stake, the more visibility your prediction will get in the market. Dishonest market makers lose all of their staked tokens if they try to cheat.
- Prediction markets are available in BUSD (and later BNB) and also earn (%tbd) platform commission fees in BUSD. The fee settlement event will automatically trigger NEP/BUSD (or another pair) purchase on PancakeSwap. On the [same transaction](#), the NEP tokens acquired via this automated process will be immediately burned.
- Prediction market dispute resolution will result in a token burn for those who vote against the majority.
