const nftContract = artifacts.require("TicketNFT")


const eventManagement = artifacts.require("EventManagement");


const { deployProxy } = require("@openzeppelin/truffle-upgrades");

module.exports = async function (deployer) {
    let nftContract;
    try {
      nftContract = await nftContract.deployed()    
    } catch (error) {
        if (error.message == "nftContract has not been deployed to detected network (network/artifact mismatch)") {
            await console.log("Deploying nftContract Contract");
            nftContract = await deployer.deploy(nftContract);
            await console.log("nftContract Address " + nftContract.address);
        } else {
            console.error(error)
        };
    }
    
    // Factory
    let eventManagement = await deployProxy(factory, [eventManagement.address], { kind: 'uups' });
    await console.log("eventManagement Address " + eventManagement.address);

    await nftContract.setController(eventManagement.address);
};