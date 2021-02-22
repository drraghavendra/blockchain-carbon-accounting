const { expect } = require("chai");
const {
  deployDaoContracts
} = require("./common.js");

describe("Climate DAO - Integration tests", function() {
  it("should allow DAO token holders to transfer around tokens", async function() {
    const contracts = await deployDaoContracts();

    let owner = contracts.addresses[0];
    let DAOuser = contracts.addresses[1];

    // check balance of owner before transfer (right after deployment)
    let balanceOfOwnerBeforeTransfer = await contracts.daoToken
      .balanceOf(owner.address)
      .then((response) => expect(response.toString()).to.equal('10000000000000000000000000'));

    // check balance of DAOuser before transfer
    let balanceOfDaoUserBeforeTransfer = await contracts.daoToken
      .balanceOf(DAOuser.address)
      .then((response) => expect(response.toString()).to.equal('0'));

    // send some DAO tokens from owner to DAOuser
    let transferTokensFromOwnerToDaoUser = await contracts.daoToken.connect(owner).transfer(DAOuser.address, 1000000);
    expect(transferTokensFromOwnerToDaoUser);

    // check balance of owner after transfer
    let balanceOfOwnerAfterTransfer = await contracts.daoToken
      .balanceOf(owner.address)
      .then((response) => expect(response.toString()).to.equal('9999999999999999999000000'));

    // check balance of DAOuser after transfer
    let balanceOfDaoUserAfterTransfer = await contracts.daoToken
      .balanceOf(DAOuser.address)
      .then((response) => expect(response.toString()).to.equal('1000000'));

  });
});
