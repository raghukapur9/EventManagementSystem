const { default: BigNumber } = require("bignumber.js");
const { assert } = require("console");
const { check } = require("prettier");
const { report } = require("process");
const helper = require('../utils');
const eventManagement = artifacts.require("EventManagement");
const nftContract = artifacts.require("TicketNFT");

contract('Testing EventManagementSystem', (accounts) => {
    var nftContractInstance;
    var eventManagementInstance;
    var eventId = 0;

    var eventStartTime = "1657862240";
    var eventDuration = "3600";
    var ticketsPerUser = "3";
    var eventName = "NFT Event";
    var ticketResellTime = "1657775840";
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

    it('Fail:Buy Event Ticket: Buying ticket for non existant event', async() => {
        try{
            await eventManagementInstance.buyEventTicket(
                100,
                2,
                {from: accounts[1], value: "100"}
            );
        } catch(error){
            await assert(error.message.includes("Invalid Input"))
        }
    });

    it('Fail:Buy Event Ticket: Buying more tickets than available', async() => {
        try{
            await eventManagementInstance.buyEventTicket(
                eventId,
                10,
                {from: accounts[1], value: "100"}
            );
        } catch(error){
            await assert(error.message.includes("ticket limit exceed by the user"))
        }
    });

    it('Fail:Buy Event Ticket: Sending less value than required', async() => {
        try{
            await eventManagementInstance.buyEventTicket(
                eventId,
                2,
                {from: accounts[1], value: "20000000000000000"}
            );
        } catch(error){
            await assert(error.message.includes("Tickets require more funds"))
        }
    });

    it('Buy Event Ticket', async() => {
        await eventManagementInstance.buyEventTicket(
            eventId,
            2,
            {from: accounts[1], value: "200000000000000000"}
        );

        await eventManagementInstance.ticketScheduleBook(eventId,0).then((response)=>{
            assert(
                response.ticketsUsed.toString(10) === "2"
            );
        });
    });

    it('Fail: Buy Event Ticket: Limit exceeded for per user tickts', async() => {
        try{
            await eventManagementInstance.buyEventTicket(
                eventId,
                2,
                {from: accounts[1], value: "400000000000000000"}
            );
        } catch(error){
            await assert(error.message.includes("ticket limit exceed by the user"))
        }
    });

    it('Cancel Event: User other than host deleting the event', async() => {
        try{
            await eventManagementInstance.cancelEvent(
                eventId,
                {
                    from: accounts[1]
                }
            );
        } catch (error){
            await assert(error.message.includes("only host can cancel the event before the event start or event is already cancelled"))
        }
    });

    it('Cancel Event: User cancelling the event after start time', async() => {
        advancement = 86400*2 // 100 days
        await helper.advanceTime(advancement);
        try{
            await eventManagementInstance.cancelEvent(
                eventId,
                {
                    from: accounts[0]
                }
            );
        } catch (error){
            await assert(error.message.includes("only host can cancel the event before the event start or event is already cancelled"))
        }
    });

    it('Fail: Buy Event Ticket: buy tickets after start time of the event', async() => {
        try{
            await eventManagementInstance.buyEventTicket(
                eventId,
                2,
                {from: accounts[1], value: "400000000000000000"}
            );
        } catch(error){
            await assert(error.message.includes("Invalid Input"))
        }
    });

    it('Fail: User redeem Ticket: User trying to redeem the ticket value for a non-cancelled event', async() => {
        try{
            await eventManagementInstance.redeemCancelledEventTicket(
                eventId,
                ["1","2"]
            );
        } catch(error){
            await assert(error.message.includes("Only cancelled events can be redeemed."))
        }
    });

    it('Cancel Event: User cancelling the event', async() => {
        eventId +=1;
        // Create new event
        eventStartTime = "1657984976";
        ticketResellTime = "1657974976";
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

        // buy ticket
        await eventManagementInstance.buyEventTicket(
            eventId,
            2,
            {from: accounts[1], value: "200000000000000000"}
        );

        // cancel event
        await eventManagementInstance.cancelEvent(
            eventId
        );
        await eventManagementInstance.eventDetailsBook(eventId).then((response)=>{
            assert(
                response.isEventCancelled === true
            )
        });
    });

    it('Fail: Cancel Event: User cancelling the cancelled event', async() => {
        try{
            await eventManagementInstance.cancelEvent(
                eventId,
                {
                    from: accounts[0]
                }
            );
        } catch (error){
            await assert(error.message.includes("only host can cancel the event before the event start or event is already cancelled"))
        }
    });

    it('Fail: Buy Event Ticket: buy tickets after event is cancelled', async() => {
        try{
            await eventManagementInstance.buyEventTicket(
                eventId,
                2,
                {from: accounts[1], value: "400000000000000000"}
            );
        } catch(error){
            await assert(error.message.includes("Invalid Input"))
        }
    });

    it('Fail: User redeem Ticket: User other than ticket holder trying to redeem the ticket value', async() => {
        try{
            await eventManagementInstance.redeemCancelledEventTicket(
                eventId,
                ["1","2"],{
                    from: accounts[0]
                }
            );
        } catch(error){
            await assert(error.message.includes("Only ticket owner can ask for refund."))
        }
    });

    it('User redeem Ticket: Ticket holder trying to redeem the ticket value', async() => {
        balance = await eventManagementInstance.contractBalance();

        await eventManagementInstance.redeemCancelledEventTicket(
            eventId,
            ["1","2"],{
                from: accounts[1]
            }
        );
        balance_after = await eventManagementInstance.contractBalance();
        console.log(balance.toString(10));
        console.log(balance_after.toString(10));
        assert((parseInt(balance.toString(10) - parseInt(balance_after.toString(10)))).toString(10) === "200000000000000000");

        try{
            await eventManagementInstance.redeemCancelledEventTicket(
                eventId,
                ["1","2"],{
                    from: accounts[1]
                }
            );
        } catch(error){
            await assert(error.message.includes("ERC721: owner query for nonexistent token"))
        }
    });
});