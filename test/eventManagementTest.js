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

    var eventStartTime = "172800";
    var eventDuration = "3600";
    let tradeId = 0;
    var ticketsPerUser = "3";
    var eventName = "NFT Event";
    var ticketResellTime = "86400";
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
                "0",
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
                response.paymentAddress.toString(10) ===  (accounts[0]).toString(10) &&
                response.eventDuration.toString(10)=== eventDuration &&
                response.ticketsPerUser.toString(10) === ticketsPerUser &&
                response.eventName === eventName &&
                response.totalAttendees.toString(10) === "0" &&
                response.ticketsSold.toString(10) === "0" &&
                response.isEventCancelled === false &&
                response.isPaymentComplete === false
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
                {from: accounts[1], value: "10000000000000000"}
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

    it('Fail:Resell Event Ticket', async() => {
        advancement = 86400*1 //  days
        await helper.advanceTime(advancement);
        // ticket resell by non owner
        try{
            await eventManagementInstance.resellTicket(
                eventId,
                2,
                "1000000000",
                {from: accounts[0]}
            );
        } catch(error){
            await assert(error.message.includes("Invalid Input"))
        }
        // non existant event
        try{
            await eventManagementInstance.resellTicket(
                100,
                2,
                "1000000000",
                {from: accounts[1]}
            );
        } catch(error){
            await assert(error.message.includes("non-existant event"))
        }

        // non ticket owner
        try{
            await eventManagementInstance.resellTicket(
                eventId,
                5,
                "1000000000",
                {from: accounts[1]}
            );
        } catch(error){
            await assert(error.message.includes("ERC721: invalid token ID"))
        }

        // price is 0
        try{
            await eventManagementInstance.resellTicket(
                eventId,
                1,
                "0",
                {from: accounts[1]}
            );
        } catch(error){
            await assert(error.message.includes("Invalid Input"))
        }
    });

    it('Resell Event Ticket', async() => {
        tradeId +=1;
        let nftContractEvent;
        await eventManagementInstance.eventDetailsBook(eventId).then((response)=>{
            nftContractEvent = response.nftContractAddress;
        });
        nftInstance = await nftContract.at(nftContractEvent);
        const txResult = await nftInstance.approve(eventManagementInstance.address, "1", {from: accounts[1]});
        await eventManagementInstance.resellTicket(
            eventId,
            "1",
            "1000000000",
            {from: accounts[1]}
        );

        await eventManagementInstance.tradeDetailsBook(tradeId).then((response)=>{
            assert(
                response.orderCreator.toString(10) === accounts[1].toString(10),
                response.eventId.toString(10) === eventId.toString(10),
                response.price.toString(10) === "1000000000",
                response.orderFulfilled === false,
                response.isOrderCancelled === false
            );
        });
    });

    it('Fail: Buy Resell Event Ticket: order id does not exist', async() => {
        try{
            await eventManagementInstance.buyResellTicket(
                "2",
                {from: accounts[1], value: "200000000000000000"}
            )
        } catch(error){
            await assert(error.message.includes("trade does not exist"))
        };
    });

    it('Fail: Buy Resell Event Ticket: Order initiator cannot buy the ticket', async() => {
        try{
            await eventManagementInstance.buyResellTicket(
                "1",
                {from: accounts[1], value: "200000000000000000"}
            )
        } catch(error){
            await assert(error.message.includes("Order should be in active state and the ticketing event should not have started."))
        };
    });

    it('Buy Resell Event Ticket', async() => {
        balance_init1 = await web3.eth.getBalance(accounts[0])
        balance_init2 = await web3.eth.getBalance(accounts[1])
        await eventManagementInstance.buyResellTicket(
            "1",
            {from: accounts[0], value: "1000000000"}
        );
        let nftContractEvent;
        await eventManagementInstance.eventDetailsBook(eventId).then((response)=>{
            nftContractEvent = response.nftContractAddress;
        });

        nftInstance = await nftContract.at(nftContractEvent);
        const ownerAddress = await nftInstance.ownerOf("1");
        assert(ownerAddress.toString(10) === accounts[0].toString(10))

    });

    it('Fail: Buy Resell Event Ticket: Ticket already bought', async() => {
        try{
            await eventManagementInstance.buyResellTicket(
                "1",
                {from: accounts[0], value: "1000000000"}
            );
        } catch(error){
            assert(error.message.includes("Order should be in active state and the ticketing event should not have started."))
        }
    });

    it('Fail: Pull Resell Event Ticket Money: Someone else pulling the money', async() => {
        try{
            await eventManagementInstance.pullResellTicketAmount(
                "1",
                {from: accounts[0]}
            );
        } catch(error){
            assert(error.message.includes("trade does not exist"))
        }
    });

    it('Fail: Pull Resell Event Ticket Money: Order Id does not exist', async() => {
        try{
            await eventManagementInstance.pullResellTicketAmount(
                "3",
                {from: accounts[0]}
            );
        } catch(error){
            assert(error.message.includes("trade does not exist"))
        }
    });

    it('Pull Resell Event Ticket Money:', async() => {
        await eventManagementInstance.pullResellTicketAmount(
            "1",
            {from: accounts[1]}
        );
        await eventManagementInstance.tradeDetailsBook("1").then((response)=>{
            assert(response.pricePulled === true);
        });
        
    });

    it('Fail:Cancel Resell Event', async() => {
        try{
            await eventManagementInstance.cancelresellTicketOrder(
                "2",
                {from: accounts[2]}
            )
        } catch(error){
            await assert(error.message.includes("order not created"))
        };
    });

    it('Fail:Cancel Resell Event', async() => {
        try{
            await eventManagementInstance.cancelresellTicketOrder(
                "1",
                {from: accounts[1]}
            )
        } catch(error){
            await assert(error.message.includes("Order can only be cancelled by the order creator or order is cancelled or fulfilled"))
        };
    });

    it('Cancel Resell Event', async() => {
        let nftContractEvent;
        await eventManagementInstance.eventDetailsBook(eventId).then((response)=>{
            nftContractEvent = response.nftContractAddress;
        });
        nftInstance = await nftContract.at(nftContractEvent);
        const txResult = await nftInstance.approve(eventManagementInstance.address, "2", {from: accounts[1]});
        await eventManagementInstance.resellTicket(
            eventId,
            "2",
            "1000000000",
            {from: accounts[1]}
        );
        await eventManagementInstance.cancelresellTicketOrder(
            "2",
            {from: accounts[1]}
        )
        await eventManagementInstance.tradeDetailsBook("2").then((response)=>{
            assert(response.isOrderCancelled === true);
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

    it('Mark Event Attendance', async() => {
        advancement = 86400*1 //  days
        await helper.advanceTime(advancement);
        let nftContractEvent;
        let attendees = 0;
        let attendeesAfter = 0
        await eventManagementInstance.eventDetailsBook(eventId).then((response)=>{
            nftContractEvent = response.nftContractAddress;
            attendees = response.totalAttendees;
        });
        nftInstance = await nftContract.at(nftContractEvent);
        nftBalanceInit = await nftInstance.balanceOf(accounts[1])
        const txResult = await nftInstance.approve(eventManagementInstance.address, "2", {from: accounts[1]});
        await eventManagementInstance.markEventAttendance(
            eventId,
            "2",
            {from: accounts[1]}
        );
        await eventManagementInstance.eventDetailsBook(eventId).then((response)=>{
            attendeesAfter = response.totalAttendees;
        });
        nftBalance = await nftInstance.balanceOf(accounts[1]);
        assert((parseInt(nftBalanceInit.toString(10)) - parseInt(nftBalance.toString(10))).toString(10) === "1");
        assert((parseInt(attendeesAfter.toString(10)) - parseInt(attendees.toString(10))).toString(10) === "1");
        
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
        advancement = 86400*2 // 2 days
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
        eventStartTime = "172800";
        ticketResellTime = "86400";
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

    it('Fail: Cancel Event: Owner cancelling the cancelled event', async() => {
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
        assert((parseInt(balance.toString(10) - parseInt(balance_after.toString(10)))).toString(10) === "200000000000000000");

        try{
            await eventManagementInstance.redeemCancelledEventTicket(
                eventId,
                ["1","2"],{
                    from: accounts[1]
                }
            );
        } catch(error){
            await assert(error.message.includes("ERC721: invalid token ID"))
        }
    });

    it('Fail: Redeem Event Money: User redeeming money before event end time', async() => {
        eventId +=1;
        // Create new event
        eventStartTime = "172800";
        ticketResellTime = "86400";
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

        try{
            await eventManagementInstance.getEventEarnings(
                eventId,{
                    from: accounts[0]
                }
            );
        } catch(error){
            await assert(error.message.includes("Only Owner can take the earning after the event is over"))
        }
        
    });

    it('Fail: Redeem Event Money: User other than host redeeming money before event end time', async() => {
        try{
            await eventManagementInstance.getEventEarnings(
                eventId,{
                    from: accounts[1]
                }
            );
        } catch(error){
            await assert(error.message.includes("Only Owner can take the earning after the event is over"))
        }
    });

    it('Redeem Event Money', async() => {
        balance = await eventManagementInstance.contractBalance();
        advancement = 86400*6 // 100 days
        await helper.advanceTime(advancement);

        await eventManagementInstance.getEventEarnings(
            eventId,{
                from: accounts[0]
            }
        );
        after_balance = await eventManagementInstance.contractBalance();
        assert((parseInt(balance.toString(10) - parseInt(balance_after.toString(10)))).toString(10) === "200000000000000000");
    });

    it('Fail: Redeem Event Money: User again redeeming money', async() => {
        try{
            await eventManagementInstance.getEventEarnings(
                eventId,{
                    from: accounts[0]
                }
            );
        } catch(error){
            await assert(error.message.includes("Only Owner can take the earning after the event is over"))
        }
    });

    it('Fail: Mark Attendance: User marking attendance after event', async() => {
        try{
            await eventManagementInstance.markEventAttendance(
                eventId,
                "1",{
                    from: accounts[1]
                }
            );
        } catch(error){
            await assert(error.message.includes("Only User owning the NFT can mark the attendance during the event"))
        }
    });

    it('Fail: Resell Ticket: Selling ticket after event starts', async() => {
        try{
            await eventManagementInstance.resellTicket(
                eventId,
                "1",
                "100000000000",{
                    from: accounts[1]
                }
            );
        } catch(error){
            await assert(error.message.includes("Invalid Input"))
        }
    });
});