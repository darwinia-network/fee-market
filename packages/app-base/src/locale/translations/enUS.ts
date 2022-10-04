import localeKeys from "../localeKeys";
const enUs = {
  [localeKeys.welcomeToReact]: "Welcome To React 👏",
  [localeKeys.messagesCounter]: `Hello {{user}}, <i><strong style="color: yellow;">you've</strong></i> got {{counter}} messages.`,
  [localeKeys.menu]: "menu",
  [localeKeys.overview]: "overview",
  [localeKeys.relayers]: "relayers",
  [localeKeys.relayersOverview]: "relayers overview",
  [localeKeys.relayerDashboard]: "relayer dashboard",
  [localeKeys.orders]: "orders",
  [localeKeys.darwiniaChain]: "Darwinia Chain",
  [localeKeys.darwiniaSmartChain]: "Darwinia Smart Chain",
  [localeKeys.ethereum]: "Ethereum",
  [localeKeys.crabChain]: "Crab Chain",
  [localeKeys.crabParachain]: "Crab Parachain",
  [localeKeys.pangoroChain]: "Pangoro Chain",
  [localeKeys.pangoroSmartChain]: "Pangoro Smart Chain",
  [localeKeys.goerli]: "Goerli",
  [localeKeys.pangolinChain]: "Pangolin Chain",
  [localeKeys.pangolinParachain]: "Pangolin Parachain",
  [localeKeys.liveNets]: "Livenet",
  [localeKeys.testNets]: "Testnet",
  [localeKeys.toDestination]: "to {{destinationName}}",
  [localeKeys.switchToLiveNets]: "switch to livenets",
  [localeKeys.switchToTestNets]: "switch to testnets",
  [localeKeys.select]: "select",
  [localeKeys.totalRelayers]: "total relayers",
  [localeKeys.averageSpeed]: "average speed",
  [localeKeys.currentMessageFee]: "current message fee",
  [localeKeys.totalRewards]: "total rewards",
  [localeKeys.totalOrders]: "total orders",
  [localeKeys.ordersCount]: "orders count",
  [localeKeys.days]: "{{daysNumber}}D",
  [localeKeys.all]: "all",
  [localeKeys.freeHistory]: `free history <span style="text-transform: uppercase;">{{currency}}</span>`,
  [localeKeys.searchByRelayerAddress]: "search by relayer address",
  [localeKeys.allRelayers]: "all relayers",
  [localeKeys.assignedRelayers]: "assigned relayers",
  [localeKeys.relayer]: "relayer",
  [localeKeys.count]: "count",
  [localeKeys.order]: "order",
  [localeKeys.collateral]: "collateral",
  [localeKeys.quote]: "quote",
  [localeKeys.sum]: "sum",
  [localeKeys.reward]: "reward",
  [localeKeys.slash]: "slash",
  [localeKeys.rewardsOrSlash]: `rewards/slash <span style="text-transform: uppercase;">{{currency}}</span>`,
  [localeKeys.quoteHistory]: `quote history <span style="text-transform: uppercase;">{{currency}}</span>`,
  [localeKeys.orderId]: "order ID",
  [localeKeys.relayerRoles]: "relayer roles",
  [localeKeys.time]: "time",
  [localeKeys.relatedOrders]: "related orders",
  [localeKeys.relayerDetails]: "relayer details",
  [localeKeys.finished]: "finished",
  [localeKeys.inProgress]: "in progress",
  [localeKeys.inSlot]: "in slot",
  [localeKeys.outOfSlot]: "out of slot",
  [localeKeys.searchByOrderOrSender]: "search by order ID/sender address",
  [localeKeys.filter]: "filter",
  [localeKeys.timeDimension]: "time dimension",
  [localeKeys.date]: "date",
  [localeKeys.startDate]: "start date",
  [localeKeys.endDate]: "end date",
  [localeKeys.block]: "block",
  [localeKeys.status]: "status",
  [localeKeys.slot]: "slot",
  [localeKeys.slotNumber]: `slot {{slotNumber}}`,
  [localeKeys.to]: "to",
  [localeKeys.deliveryRelayer]: "delivery relayer",
  [localeKeys.confirmationRelayer]: "confirmation relayer",
  [localeKeys.createdAt]: "created at",
  [localeKeys.confirmAt]: "confirm at",
  [localeKeys.loginInfo]: `Login your account to check your relaying data and update your Collateral & Quote in the current Fee Market. `,
  [localeKeys.connectMetamask]: "connect metamask",
  [localeKeys.unregistered]: "unregistered",
  [localeKeys.registered]: "registered",
  [localeKeys.switchAccount]: "switch account",
  [localeKeys.runBridger]: "run brigder",
  [localeKeys.registerRelayer]: "register relayer",
  [localeKeys.moreActions]: "more actions",
  [localeKeys.collateralBalance]: "collateral balance",
  [localeKeys.currentlyLocked]: "currently locked",
  [localeKeys.currentQuote]: "current quote",
  [localeKeys.quotePhrase]: "{{amount}}/Order",
  [localeKeys.switchAccountNotice]:
    "The connected network is Inconsistent with the current Fee market start network. Please select Ethereum in Metamask.",
  [localeKeys.selectActiveAccount]: "select active account",
  [localeKeys.switchNetwork]: "switch network",
  [localeKeys.cancel]: "cancel",
  [localeKeys.register]: "register",
  [localeKeys.account]: "account",
  [localeKeys.youDeposit]: `you'll deposit`,
  [localeKeys.youDepositInfo]: `The collateral Balance should be greater than {{amount}}`,
  [localeKeys.youQuote]: `you'll quote`,
  [localeKeys.quoteAmountLimitError]: `The quote amount should be greater than {{amount}}.`,
  [localeKeys.perOrder]: `{{currency}}/Order`,
  [localeKeys.depositAmountLimitError]: `The Collateral Balance should be greater than {{amount}}.`,
  [localeKeys.confirm]: "confirm",
  [localeKeys.confirmCancelRelayer]: "Confirm to cancel relayer?",
  [localeKeys.cancelRelayerWarning]: `You're going to cancel Relayer of the current account in the Darwinia > Ethereum Fee market. 
Note that the collateral balance will return back to your account. But the locked collateral will not release until the message Orders you're Assigned get Delivered.`,
  [localeKeys.feeEstimation]: `Estimated fees of {{amount}}`,
  [localeKeys.youModifyQuoteTo]: `You‘ll modify Quote to`,
  [localeKeys.modifyYourQuote]: "modify your quote",
  [localeKeys.yourCurrentQuote]: "your current quote",
  [localeKeys.modifyCollateralBalance]: "Modify your Collateral Balance",
  [localeKeys.yourCollateralBalance]: "Your Collateral Balance",
  [localeKeys.youModifyBalanceTo]: "You’ll modify the Balance To",
};

export default enUs;
