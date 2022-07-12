const nftContract = artifacts.require("TicketNFT")


const eventManagement = artifacts.require("EventManagement");

module.exports = async function (deployer) {
    await deployer.deploy(nftContract);
    let nftContractInstance = await nftContract.deployed();
    console.log(nftContractInstance.address);
    await deployer.deploy(eventManagement,nftContractInstance.address);
    // let eventManagementInstance = await deploy(eventManagement, [nftContractInstance.address]);
    let eventManagementInstance = await eventManagement.deployed();
    await console.log("eventManagementInstance Address: ", eventManagementInstance.address);
};