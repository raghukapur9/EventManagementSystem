const { default: BigNumber } = require("bignumber.js");
const { assert } = require("console");
const { report } = require("process");

const eventManagement = artifacts.require("EventManagement");
const nftContract = artifacts.require("TicketNFT");

contract('Testing EventManagementSystem', (accounts) => {
    var nftContractInstance;
    var eventManagementInstance;
    var eventId = 0;

    var eventStartTime = "1657725776";
    var eventDuration = "3600";
    var ticketsPerUser = "3";
    var eventName = "NFT Event";
    var ticketResellTime = "1657639376";
    var ticketNames = ["early bird", "normal"];
    var ticketNos = ["2", "5"];
    var ticketsPrice = ["100000000000000000", "200000000000000000"];
    it('Deployed EventManagement', async() => {
        nftContractInstance = await nftContract.deployed();
        eventManagementInstance = await eventManagement.deployed();
        console.log("nftContractInstance", nftContractInstance.address);
        console.log("eventManagementInstance", eventManagementInstance.address)
    });

    it('Create Event: Incorrect Inputs', async() => {
        // Create new event
        try{
            await eventManagementInstance.createEvent(
                "100",
                accounts[0],
                eventDuration,
                ticketsPerUser,
                eventName,
                ticketResellTime,
                ticketNames,
                ticketNos,
                ticketsPrice
            );
        } catch (error){
            await assert(error.message.includes("Incorrect Inputs"))
        }

        try{
            await eventManagementInstance.createEvent(
                eventStartTime,
                "0x0000000000000000000000000000000000000000",
                eventDuration,
                ticketsPerUser,
                eventName,
                ticketResellTime,
                ticketNames,
                ticketNos,
                ticketsPrice
            );
        } catch (error){
            await assert(error.message.includes("Incorrect Inputs"))
        }

        try{
            await eventManagementInstance.createEvent(
                eventStartTime,
                accounts[0],
                "0",
                ticketsPerUser,
                eventName,
                ticketResellTime,
                ticketNames,
                ticketNos,
                ticketsPrice
            );
        } catch (error){
            await assert(error.message.includes("Incorrect Inputs"))
        }

        try{
            await eventManagementInstance.createEvent(
                eventStartTime,
                accounts[0],
                eventDuration,
                "0",
                eventName,
                ticketResellTime,
                ticketNames,
                ticketNos,
                ticketsPrice
            );
        } catch (error){
            await assert(error.message.includes("Incorrect Inputs"))
        }

        try{
            await eventManagementInstance.createEvent(
                eventStartTime,
                accounts[0],
                eventDuration,
                ticketsPerUser,
                "",
                ticketResellTime,
                ticketNames,
                ticketNos,
                ticketsPrice
            );
        } catch (error){
            await assert(error.message.includes("Incorrect Inputs"))
        }

        try{
            await eventManagementInstance.createEvent(
                eventStartTime,
                accounts[0],
                eventDuration,
                ticketsPerUser,
                eventName,
                "0",
                ticketNames,
                ticketNos,
                ticketsPrice
            );
        } catch (error){
            await assert(error.message.includes("Incorrect Inputs"))
        }

        try{
            await eventManagementInstance.createEvent(
                eventStartTime,
                accounts[0],
                eventDuration,
                ticketsPerUser,
                eventName,
                ticketResellTime,
                ["ticketNames"],
                ticketNos,
                ticketsPrice
            );
        } catch (error){
            await assert(error.message.includes("Incorrect Inputs"))
        }

        try{
            await eventManagementInstance.createEvent(
                eventStartTime,
                accounts[0],
                eventDuration,
                ticketsPerUser,
                eventName,
                ticketResellTime,
                ticketNames,
                ["0"],
                ticketsPrice
            );
        } catch (error){
            await assert(error.message.includes("Incorrect Inputs"))
        }

        try{
            await eventManagementInstance.createEvent(
                eventStartTime,
                accounts[0],
                eventDuration,
                ticketsPerUser,
                eventName,
                ticketResellTime,
                ticketNames,
                ticketNos,
                ["1"]
            );
        } catch (error){
            await assert(error.message.includes("Incorrect Inputs"))
        }
    });

    it('Create Event: Invalid Input for setting ticket selling schedule', async() => {
        try{
            await eventManagementInstance.createEvent(
                eventStartTime,
                accounts[0],
                eventDuration,
                ticketsPerUser,
                eventName,
                ticketResellTime,
                ticketNames,
                ["10", "0"],
                ticketsPrice
            );
        } catch (error){
            await assert(error.message.includes("Invalid Input for setting ticket selling schedule"))
        }

        try{
            await eventManagementInstance.createEvent(
                eventStartTime,
                accounts[0],
                eventDuration,
                ticketsPerUser,
                eventName,
                ticketResellTime,
                ["","normal"],
                ticketNos,
                ticketsPrice
            );
        } catch (error){
            await assert(error.message.includes("Invalid Input for setting ticket selling schedule"))
        }

        try{
            await eventManagementInstance.createEvent(
                eventStartTime,
                accounts[0],
                eventDuration,
                ticketsPerUser,
                eventName,
                ticketResellTime,
                ticketNames,
                ticketNos,
                ["0","10000000000000"]
            );
        } catch (error){
            await assert(error.message.includes("Invalid Input for setting ticket selling schedule"))
        }
    });

    it('Create Event', async() => {
        eventId +=1;
        // Create new event
        await eventManagementInstance.createEvent(
            eventStartTime,
            accounts[0],
            eventDuration,
            ticketsPerUser,
            eventName,
            ticketResellTime,
            ticketNames,
            ticketNos,
            ticketsPrice
        );
        await eventManagementInstance.eventDetailsBook(eventId).then((response)=>{
            assert(
                response.eventHost.toString(10) === (accounts[0]).toString(10) &&
                response.eventStartTime.toString(10) === eventStartTime &&
                response.paymentAddress.toString(10) ===  (accounts[0]).toString(10) &&
                response.eventDuration.toString(10)=== eventDuration &&
                response.ticketsPerUser.toString(10) === ticketsPerUser &&
                response.eventName === eventName &&
                response.totalAttendees.toString(10) === "0" &&
                response.ticketsSold.toString(10) === "0" &&
                response.isEventCancelled === false &&
                response.isPaymentComplete === false &&
                response.resellStartTime.toString(10) === ticketResellTime
            );
        });
        await eventManagementInstance.ticketScheduleBook(eventId,0).then((response)=>{
            assert(
                response.ticketsNo.toString(10) === ticketNos[0] &&
                response.ticketScheduleName === ticketNames[0] &&
                response.price.toString(10) === ticketsPrice[0] &&
                response.ticketsUsed.toString(10) === "0"
            );
        });
        await eventManagementInstance.ticketScheduleBook(eventId,1).then((response)=>{
            assert(
                response.ticketsNo.toString(10) === ticketNos[1] &&
                response.ticketScheduleName === ticketNames[1] &&
                response.price.toString(10) === ticketsPrice[1] &&
                response.ticketsUsed.toString(10) === "0"
            );
        });
    });
});