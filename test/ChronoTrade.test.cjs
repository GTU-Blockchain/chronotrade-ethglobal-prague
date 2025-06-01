const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ChronoTrade", function () {
    let chronoTrade;
    let timeToken;
    let owner;
    let seller;
    let buyer;
    let other;
    let serviceId;
    let serviceId2;
    const TOKEN_PER_HOUR = ethers.parseEther("1"); // 1 token per hour

    beforeEach(async function () {
        // Get signers
        [owner, seller, buyer, other] = await ethers.getSigners();

        // Deploy TIME token
        const TIME = await ethers.getContractFactory("TIME");
        timeToken = await TIME.deploy();
        await timeToken.waitForDeployment();

        // Deploy ChronoTrade
        const ChronoTrade = await ethers.getContractFactory("ChronoTrade");
        chronoTrade = await ChronoTrade.deploy(await timeToken.getAddress());
        await chronoTrade.waitForDeployment();

        // Set ChronoTrade contract address in TIME token
        await timeToken.setChronoTradeContract(await chronoTrade.getAddress());

        // Register users
        await chronoTrade
            .connect(seller)
            .registerUser("Seller", "Professional seller");
        await chronoTrade
            .connect(buyer)
            .registerUser("Buyer", "Professional buyer");
        await chronoTrade.connect(other).registerUser("Other", "Other user");

        // Approve tokens for buyer
        await timeToken
            .connect(buyer)
            .approve(await chronoTrade.getAddress(), ethers.parseEther("1000"));
    });

    describe("User Registration", function () {
        it("Should register a new user and mint initial tokens", async function () {
            const [_, __, ___, ____, newUser] = await ethers.getSigners();
            await chronoTrade
                .connect(newUser)
                .registerUser("New User", "New user description");

            const profile = await chronoTrade.getProfile(newUser.address);
            expect(profile.isRegistered).to.be.true;
            expect(profile.name).to.equal("New User");
            expect(profile.description).to.equal("New user description");

            const balance = await timeToken.balanceOf(newUser.address);
            expect(balance).to.equal(ethers.parseEther("24")); // 24 tokens for new user
        });

        it("Should not allow registering twice", async function () {
            await expect(
                chronoTrade
                    .connect(seller)
                    .registerUser("Seller2", "Another description")
            ).to.be.revertedWith("User already registered");
        });
    });

    describe("Time Slot Management", function () {
        it("Should update time slots correctly", async function () {
            // Monday = 0, Tuesday = 1, Wednesday = 2 in the DayOfWeek enum
            const availableDays = [0, 1, 2]; // Monday, Tuesday, Wednesday
            const timeSlots = [
                { startHour: 9, endHour: 12 },
                { startHour: 14, endHour: 17 },
            ];

            const tx = await chronoTrade
                .connect(seller)
                .updateTimeSlots(availableDays, timeSlots);
            await tx.wait();

            // Verify time slots
            const profile = await chronoTrade.getProfile(seller.address);
            const timeSlotStartHours = await chronoTrade.getTimeSlotStartHours(
                seller.address
            );
            expect(timeSlotStartHours.length).to.equal(2);

            // Verify days are set
            expect(await chronoTrade.isDayAvailable(seller.address, 0)).to.be
                .true; // Monday
            expect(await chronoTrade.isDayAvailable(seller.address, 1)).to.be
                .true; // Tuesday
            expect(await chronoTrade.isDayAvailable(seller.address, 2)).to.be
                .true; // Wednesday
        });

        it("Should not allow invalid time slots", async function () {
            const availableDays = [0];
            const invalidTimeSlots = [
                { startHour: 12, endHour: 9 }, // Invalid: end before start
            ];

            await expect(
                chronoTrade
                    .connect(seller)
                    .updateTimeSlots(availableDays, invalidTimeSlots)
            ).to.be.revertedWith("Invalid time slot");
        });
    });

    describe("Service Management", function () {
        beforeEach(async function () {
            // Set up time slots for seller
            const availableDays = [0, 1, 2];
            const timeSlots = [{ startHour: 9, endHour: 17 }];
            await chronoTrade
                .connect(seller)
                .updateTimeSlots(availableDays, timeSlots);

            // Create a service
            const tx = await chronoTrade.connect(seller).createService(
                "Test Service",
                "Service description",
                "General",
                2 // 2 hours duration
            );
            const receipt = await tx.wait();
            const event = receipt.logs.find(
                (log) => log.fragment?.name === "ServiceCreated"
            );
            serviceId = event.args.serviceId;
        });

        it("Should create a service correctly", async function () {
            const service = await chronoTrade.getService(serviceId);
            expect(service.service.title).to.equal("Test Service");
            expect(service.service.durationHours).to.equal(2);
            expect(service.service.seller).to.equal(seller.address);
        });

        it("Should not allow creating service without time slots", async function () {
            await expect(
                chronoTrade
                    .connect(other)
                    .createService(
                        "Invalid Service",
                        "No time slots",
                        "Invalid",
                        2
                    )
            ).to.be.revertedWith("No available time slots set");
        });
    });

    describe("Service Purchase and Completion", function () {
        let scheduledTime;

        beforeEach(async function () {
            // Set up time slots for seller (9 AM to 5 PM)
            const availableDays = [0, 1, 2]; // Monday, Tuesday, Wednesday
            const timeSlots = [{ startHour: 9, endHour: 17 }];
            const tx = await chronoTrade
                .connect(seller)
                .updateTimeSlots(availableDays, timeSlots);
            await tx.wait();

            // Verify time slots are set
            expect(
                await chronoTrade.isDayAvailable(seller.address, 0)
            ).to.be.true; // Monday
            expect(
                await chronoTrade.isDayAvailable(seller.address, 1)
            ).to.be.true; // Tuesday
            expect(
                await chronoTrade.isDayAvailable(seller.address, 2)
            ).to.be.true; // Wednesday

            // Create a service
            const tx2 = await chronoTrade.connect(seller).createService(
                "Test Service",
                "Service description",
                "General",
                2 // 2 hours duration
            );
            const receipt = await tx2.wait();
            const event = receipt.logs.find(
                (log) => log.fragment?.name === "ServiceCreated"
            );
            serviceId = event.args.serviceId;

            // Calculate next available day (Monday, Tuesday, or Wednesday)
            const currentTime = BigInt(await time.latest());
            const currentDay = Number(
                await chronoTrade.getDayOfWeek(currentTime)
            );
            let daysToAdd = 1n;

            // Find the next available day
            while (daysToAdd <= 7n) {
                const nextDay = (currentDay + Number(daysToAdd)) % 7;
                if (nextDay <= 2) {
                    // Monday (0), Tuesday (1), or Wednesday (2)
                    break;
                }
                daysToAdd++;
            }

            // Set scheduled time to next available day at 10:00 AM (within 9 AM - 5 PM slot)
            scheduledTime = currentTime + daysToAdd * 86400n; // Add days
            scheduledTime = scheduledTime - (scheduledTime % 86400n) + 36000n; // Set to 10:00 AM

            // Verify the scheduled time is on an available day and within time slot
            const scheduledDay = await chronoTrade.getDayOfWeek(scheduledTime);
            const scheduledHour = Number(
                await chronoTrade.getHour(scheduledTime)
            );
            expect(
                await chronoTrade.isDayAvailable(seller.address, scheduledDay)
            ).to.be.true;
            expect(scheduledHour).to.be.at.least(9); // After 9 AM
            expect(scheduledHour + 2).to.be.at.most(17); // Service ends before 5 PM

            // Get the time slot for the scheduled hour
            const slot = await chronoTrade.getTimeSlot(
                seller.address,
                9 // Use start hour (9 AM) instead of scheduled hour (10 AM)
            );
            expect(slot.startHour).to.equal(9);
            expect(slot.endHour).to.equal(17);
        });

        it("Should purchase a service correctly", async function () {
            const totalPrice = TOKEN_PER_HOUR * 2n; // 2 hours duration

            await chronoTrade
                .connect(buyer)
                .buyService(serviceId, scheduledTime);

            const purchase = await chronoTrade.getPurchasedService(serviceId);
            expect(purchase.purchase.buyer).to.equal(buyer.address);
            expect(purchase.purchase.scheduledTime).to.equal(scheduledTime);
            expect(purchase.purchase.isApproved).to.be.false;

            // Check token transfer
            const contractBalance = await timeToken.balanceOf(
                await chronoTrade.getAddress()
            );
            expect(contractBalance).to.equal(totalPrice);
        });

        it("Should complete a service correctly", async function () {
            // Purchase service
            await chronoTrade
                .connect(buyer)
                .buyService(serviceId, scheduledTime);

            // Move time forward to after scheduled time
            await time.increaseTo(Number(scheduledTime) + 7200); // Convert BigInt to Number for time.increaseTo

            // Approve completion
            await chronoTrade.connect(seller).approveCompletion(serviceId);

            const purchase = await chronoTrade.getPurchasedService(serviceId);
            expect(purchase.purchase.isApproved).to.be.true;
        });

        it("Should allow seller to withdraw after completion", async function () {
            // Purchase and complete service
            await chronoTrade
                .connect(buyer)
                .buyService(serviceId, scheduledTime);
            await time.increaseTo(Number(scheduledTime) + 7200); // Convert BigInt to Number
            await chronoTrade.connect(seller).approveCompletion(serviceId);

            // Withdraw
            const initialBalance = await timeToken.balanceOf(seller.address);
            await chronoTrade.connect(seller).withdrawSeller(serviceId);
            const finalBalance = await timeToken.balanceOf(seller.address);

            expect(finalBalance - initialBalance).to.equal(TOKEN_PER_HOUR * 2n);
        });
    });

    describe("Comments", function () {
        let scheduledTime;

        beforeEach(async function () {
            // Set up time slots and create services (9 AM to 5 PM)
            const availableDays = [0, 1, 2]; // Monday, Tuesday, Wednesday
            const timeSlots = [{ startHour: 9, endHour: 17 }];
            const tx = await chronoTrade
                .connect(seller)
                .updateTimeSlots(availableDays, timeSlots);
            await tx.wait();

            // Create first service
            const tx2 = await chronoTrade
                .connect(seller)
                .createService(
                    "Test Service 1",
                    "Service description 1",
                    "General",
                    2
                );
            const receipt = await tx2.wait();
            const event = receipt.logs.find(
                (log) => log.fragment?.name === "ServiceCreated"
            );
            serviceId = event.args.serviceId;

            // Create second service
            const tx3 = await chronoTrade
                .connect(seller)
                .createService(
                    "Test Service 2",
                    "Service description 2",
                    "General",
                    2
                );
            const receipt2 = await tx3.wait();
            const event2 = receipt2.logs.find(
                (log) => log.fragment?.name === "ServiceCreated"
            );
            serviceId2 = event2.args.serviceId;

            // Calculate next available day (Monday, Tuesday, or Wednesday)
            const currentTime = BigInt(await time.latest());
            const currentDay = Number(
                await chronoTrade.getDayOfWeek(currentTime)
            );
            let daysToAdd = 1n;

            // Find the next available day
            while (daysToAdd <= 7n) {
                const nextDay = (currentDay + Number(daysToAdd)) % 7;
                if (nextDay <= 2) {
                    // Monday (0), Tuesday (1), or Wednesday (2)
                    break;
                }
                daysToAdd++;
            }

            // Set scheduled time to next available day at 10:00 AM (within 9 AM - 5 PM slot)
            scheduledTime = currentTime + daysToAdd * 86400n; // Add days
            scheduledTime = scheduledTime - (scheduledTime % 86400n) + 36000n; // Set to 10:00 AM

            // Buy and complete both services
            for (const [index, id] of [serviceId, serviceId2].entries()) {
                let serviceScheduledTime;
                if (index === 0) {
                    serviceScheduledTime = scheduledTime;
                } else {
                    // For second service, find the next available day
                    const currentTime = BigInt(await time.latest());
                    const currentDay = Number(
                        await chronoTrade.getDayOfWeek(currentTime)
                    );
                    let daysToAdd = 1n;

                    // Find the next available day (Monday, Tuesday, or Wednesday)
                    while (daysToAdd <= 7n) {
                        const nextDay = (currentDay + Number(daysToAdd)) % 7;
                        if (nextDay <= 2) {
                            // Monday (0), Tuesday (1), or Wednesday (2)
                            break;
                        }
                        daysToAdd++;
                    }

                    // Set scheduled time to next available day at 10:00 AM
                    serviceScheduledTime = currentTime + daysToAdd * 86400n; // Add days
                    serviceScheduledTime =
                        serviceScheduledTime -
                        (serviceScheduledTime % 86400n) +
                        36000n; // Set to 10:00 AM
                }

                const tx4 = await chronoTrade
                    .connect(buyer)
                    .buyService(id, serviceScheduledTime);
                await tx4.wait();

                // Move time forward to after the scheduled time for this service
                await time.increaseTo(Number(serviceScheduledTime + 7200n));
                const tx5 = await chronoTrade
                    .connect(seller)
                    .approveCompletion(id);
                await tx5.wait();
            }
        });

        it("Should create a comment correctly", async function () {
            await chronoTrade
                .connect(buyer)
                .createComment(serviceId, "Great service!", 5);

            const comments = await chronoTrade.getComments(serviceId);
            expect(comments.length).to.equal(1);
            expect(comments[0].content).to.equal("Great service!");
            expect(comments[0].rating).to.equal(5);
        });

        it("Should not allow seller to comment on their own service", async function () {
            await expect(
                chronoTrade
                    .connect(seller)
                    .createComment(serviceId, "My own service", 5)
            ).to.be.revertedWith("Cannot comment on your own service");
        });

        it("Should not allow multiple comments on the same service", async function () {
            await chronoTrade
                .connect(buyer)
                .createComment(serviceId, "First comment", 5);

            await expect(
                chronoTrade
                    .connect(buyer)
                    .createComment(serviceId, "Second comment", 4)
            ).to.be.revertedWith("Already commented on this service");
        });

        it("Should allow commenting on different services from the same seller", async function () {
            // Comment on first service
            await chronoTrade
                .connect(buyer)
                .createComment(serviceId, "Great first service!", 5);

            // Comment on second service
            await chronoTrade
                .connect(buyer)
                .createComment(serviceId2, "Great second service!", 4);

            // Verify both comments exist
            const comments1 = await chronoTrade.getComments(serviceId);
            const comments2 = await chronoTrade.getComments(serviceId2);

            expect(comments1.length).to.equal(1);
            expect(comments1[0].content).to.equal("Great first service!");
            expect(comments1[0].rating).to.equal(5);

            expect(comments2.length).to.equal(1);
            expect(comments2[0].content).to.equal("Great second service!");
            expect(comments2[0].rating).to.equal(4);
        });
    });

    describe("Time Slot Availability", function () {
        let scheduledTime;

        beforeEach(async function () {
            // Set up time slots for seller (9 AM to 5 PM)
            const availableDays = [0, 1, 2]; // Monday, Tuesday, Wednesday
            const timeSlots = [{ startHour: 9, endHour: 17 }];
            const tx = await chronoTrade
                .connect(seller)
                .updateTimeSlots(availableDays, timeSlots);
            await tx.wait();

            // Verify time slots are set
            expect(
                await chronoTrade.isDayAvailable(seller.address, 0)
            ).to.be.true; // Monday
            expect(
                await chronoTrade.isDayAvailable(seller.address, 1)
            ).to.be.true; // Tuesday
            expect(
                await chronoTrade.isDayAvailable(seller.address, 2)
            ).to.be.true; // Wednesday

            // Create a service
            const tx2 = await chronoTrade
                .connect(seller)
                .createService(
                    "Test Service",
                    "Service description",
                    "General",
                    2
                );
            const receipt = await tx2.wait();
            const event = receipt.logs.find(
                (log) => log.fragment?.name === "ServiceCreated"
            );
            serviceId = event.args.serviceId;

            // Calculate next available day (Monday, Tuesday, or Wednesday)
            const currentTime = BigInt(await time.latest());
            const currentDay = Number(
                await chronoTrade.getDayOfWeek(currentTime)
            );
            let daysToAdd = 1n;

            // Find the next available day
            while (daysToAdd <= 7n) {
                const nextDay = (currentDay + Number(daysToAdd)) % 7;
                if (nextDay <= 2) {
                    // Monday (0), Tuesday (1), or Wednesday (2)
                    break;
                }
                daysToAdd++;
            }

            // Set scheduled time to next available day at 10:00 AM (within 9 AM - 5 PM slot)
            scheduledTime = currentTime + daysToAdd * 86400n; // Add days
            scheduledTime = scheduledTime - (scheduledTime % 86400n) + 36000n; // Set to 10:00 AM

            // Verify the scheduled time is on an available day and within time slot
            const scheduledDay = await chronoTrade.getDayOfWeek(scheduledTime);
            const scheduledHour = Number(
                await chronoTrade.getHour(scheduledTime)
            );
            expect(
                await chronoTrade.isDayAvailable(seller.address, scheduledDay)
            ).to.be.true;
            expect(scheduledHour).to.be.at.least(9); // After 9 AM
            expect(scheduledHour + 2).to.be.at.most(17); // Service ends before 5 PM

            // Get the time slot for the scheduled hour
            const slot = await chronoTrade.getTimeSlot(
                seller.address,
                9 // Use start hour (9 AM) instead of scheduled hour (10 AM)
            );
            expect(slot.startHour).to.equal(9);
            expect(slot.endHour).to.equal(17);

            const tx3 = await chronoTrade
                .connect(buyer)
                .buyService(serviceId, scheduledTime);
            await tx3.wait();
        });

        it("Should correctly check time slot availability", async function () {
            // Check overlapping time slot
            const overlappingTime = BigInt(scheduledTime) + 3600n; // Use BigInt arithmetic
            const isAvailable = await chronoTrade.isTimeSlotAvailable(
                seller.address,
                overlappingTime,
                overlappingTime + 7200n // Use BigInt arithmetic
            );
            expect(isAvailable).to.be.false;

            // Check non-overlapping time slot
            const nonOverlappingTime = BigInt(scheduledTime) + 86400n; // Use BigInt arithmetic
            const isAvailable2 = await chronoTrade.isTimeSlotAvailable(
                seller.address,
                nonOverlappingTime,
                nonOverlappingTime + 7200n // Use BigInt arithmetic
            );
            expect(isAvailable2).to.be.true;
        });

        it("Should get booked time slots correctly", async function () {
            // Get current time and ensure we're using a future range
            const currentTime = BigInt(await time.latest());
            const startTime = currentTime + 3600n; // Start 1 hour from now
            const endTime = startTime + 172800n; // End 48 hours from start time

            const bookedSlots = await chronoTrade.getBookedTimeSlots(
                seller.address,
                startTime,
                endTime
            );

            // If the scheduled time falls within our range, it should be in the booked slots
            if (scheduledTime >= startTime && scheduledTime < endTime) {
                expect(bookedSlots.length).to.equal(1);
                expect(bookedSlots[0]).to.equal(scheduledTime);
            } else {
                expect(bookedSlots.length).to.equal(0);
            }
        });
    });

    describe("buyService Debug Tests", function () {
        let scheduledTime;

        beforeEach(async function () {
            // Set up time slots for seller (9 AM to 5 PM)
            const availableDays = [0, 1, 2]; // Monday, Tuesday, Wednesday
            const timeSlots = [{ startHour: 9, endHour: 17 }];
            await chronoTrade
                .connect(seller)
                .updateTimeSlots(availableDays, timeSlots);

            // Create a service with 2 hours duration
            const tx = await chronoTrade
                .connect(seller)
                .createService(
                    "Debug Service",
                    "Service for debugging",
                    "Debug",
                    2
                );
            const receipt = await tx.wait();
            const event = receipt.logs.find(
                (log) => log.fragment?.name === "ServiceCreated"
            );
            serviceId = event.args.serviceId;

            // Calculate next available day (Monday, Tuesday, or Wednesday)
            const currentTime = BigInt(await time.latest());
            const currentDay = Number(
                await chronoTrade.getDayOfWeek(currentTime)
            );
            let daysToAdd = 1n;

            // Find the next available day
            while (daysToAdd <= 7n) {
                const nextDay = (currentDay + Number(daysToAdd)) % 7;
                if (nextDay <= 2) {
                    break;
                }
                daysToAdd++;
            }

            // Set scheduled time to next available day at 10:00 AM
            scheduledTime = currentTime + daysToAdd * 86400n;
            scheduledTime = scheduledTime - (scheduledTime % 86400n) + 36000n;
        });

        it("Should fail with insufficient token balance", async function () {
            // Get buyer's current balance
            const balance = await timeToken.balanceOf(buyer.address);
            console.log(
                "Buyer's current balance:",
                ethers.formatEther(balance),
                "TIME"
            );

            // Calculate required amount (2 hours * 1 TIME per hour)
            const requiredAmount = TOKEN_PER_HOUR * 2n;
            console.log(
                "Required amount:",
                ethers.formatEther(requiredAmount),
                "TIME"
            );

            // If buyer has enough tokens, transfer some away to test insufficient balance
            if (balance >= requiredAmount) {
                const transferAmount =
                    balance - requiredAmount + ethers.parseEther("1");
                await timeToken
                    .connect(buyer)
                    .transfer(other.address, transferAmount);
            }

            // Verify new balance is insufficient
            const newBalance = await timeToken.balanceOf(buyer.address);
            console.log(
                "Buyer's new balance:",
                ethers.formatEther(newBalance),
                "TIME"
            );
            expect(newBalance).to.be.below(requiredAmount);

            // Attempt to buy service should fail
            await expect(
                chronoTrade.connect(buyer).buyService(serviceId, scheduledTime)
            ).to.be.revertedWith("Not enough TIME tokens");
        });

        it("Should succeed with sufficient token balance", async function () {
            // Ensure buyer has enough tokens
            const requiredAmount = TOKEN_PER_HOUR * 2n;
            const balance = await timeToken.balanceOf(buyer.address);

            if (balance < requiredAmount) {
                // Mint additional tokens if needed
                await timeToken.mintForNewUser(buyer.address);
            }

            // Verify balance is sufficient
            const newBalance = await timeToken.balanceOf(buyer.address);
            console.log(
                "Buyer's balance before purchase:",
                ethers.formatEther(newBalance),
                "TIME"
            );
            expect(newBalance).to.be.at.least(requiredAmount);

            // Buy service should succeed
            await chronoTrade
                .connect(buyer)
                .buyService(serviceId, scheduledTime);

            // Verify token transfer
            const contractBalance = await timeToken.balanceOf(
                await chronoTrade.getAddress()
            );
            expect(contractBalance).to.equal(requiredAmount);

            // Verify purchase details
            const purchase = await chronoTrade.getPurchasedService(serviceId);
            expect(purchase.purchase.buyer).to.equal(buyer.address);
            expect(purchase.purchase.scheduledTime).to.equal(scheduledTime);
            expect(purchase.purchase.isApproved).to.be.false;
        });

        it("Should fail when trying to buy own service", async function () {
            await expect(
                chronoTrade.connect(seller).buyService(serviceId, scheduledTime)
            ).to.be.revertedWith("Cannot buy your own service");
        });

        it("Should fail when service is inactive", async function () {
            // Deactivate the service
            await chronoTrade
                .connect(seller)
                .cancelService(serviceId, "Cancelling for test");

            await expect(
                chronoTrade.connect(buyer).buyService(serviceId, scheduledTime)
            ).to.be.revertedWith("Service inactive");
        });

        it("Should fail when scheduled time is in the past", async function () {
            const pastTime = BigInt(await time.latest()) - 3600n; // 1 hour ago

            await expect(
                chronoTrade.connect(buyer).buyService(serviceId, pastTime)
            ).to.be.revertedWith("Scheduled time must be in future");
        });

        it("Should fail when time slot is not available", async function () {
            // Try to schedule outside seller's available hours (8 AM)
            const invalidTime = scheduledTime - 7200n; // 2 hours before 10 AM

            await expect(
                chronoTrade.connect(buyer).buyService(serviceId, invalidTime)
            ).to.be.revertedWith("Time slot not available or invalid");
        });

        it("Should fail when time slot is already booked", async function () {
            // First buyer books the slot
            await chronoTrade
                .connect(buyer)
                .buyService(serviceId, scheduledTime);

            // Second buyer tries to book the same slot
            await expect(
                chronoTrade.connect(other).buyService(serviceId, scheduledTime)
            ).to.be.revertedWith("Time slot already booked");
        });
    });
});
