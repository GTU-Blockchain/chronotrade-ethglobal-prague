pragma solidity ^0.8.19;

// SPDX-License-Identifier: MIT

import "./TIME.sol";

contract ChronoTrade {
    // constants
    uint256 public constant TIMEOUT_DURATION = 10 days;
    uint256 public constant TOKEN_PER_HOUR = 1; // 1 token per hour

    // token contract
    TIME public timeToken;

    // enums
    enum DayOfWeek {
        Monday,
        Tuesday,
        Wednesday,
        Thursday,
        Friday,
        Saturday,
        Sunday
    }

    // structs
    struct TimeSlot {
        uint8 startHour; // 0-23
        uint8 endHour; // 0-23
    }

    struct Service {
        uint256 id;
        address seller;
        string title;
        string description;
        bool isActive;
        uint8 durationHours; // Duration of the service in hours
    }

    struct UserProfile {
        address user;
        string name;
        string description;
        uint256 ratingSum;
        uint256 ratingCount;
        bool isRegistered;
        mapping(DayOfWeek => bool) availableDays; // Which days the user is available
        mapping(uint8 => TimeSlot) availableTimeSlots; // Available time slots by start hour
        uint8[] timeSlotStartHours; // Array to keep track of which hours have slots
    }

    struct PurchasedService {
        uint256 serviceId;
        address buyer;
        bool isApproved;
        bool sellerWithdrawn;
        bool buyerWithdrawn;
        uint256 timestamp; // When the service was bought
        uint256 scheduledTime; // Unix timestamp for the service
        bool isCancelled;
    }

    // events
    event ServiceCreated(
        uint256 indexed serviceId,
        address indexed seller,
        uint8 durationHours
    );
    event ServiceBought(
        uint256 indexed serviceId,
        address indexed buyer,
        uint256 startTime
    );
    event ServiceCompleted(uint256 indexed serviceId, address indexed buyer);
    event ServiceCancelled(
        uint256 indexed serviceId,
        address indexed by,
        string reason
    );
    event Withdraw(address indexed user, uint256 amount);
    event UserRated(address indexed ratedUser, uint8 rating);
    event ServiceApproved(uint256 indexed serviceId, address indexed buyer);
    event WithdrawSuccess(address indexed user, uint256 amount, string reason);
    event UserRegistered(address indexed user);
    event TimeSlotsUpdated(address indexed user);

    // mappings
    mapping(address => UserProfile) public profiles;
    mapping(uint256 => Service) public services;
    mapping(uint256 => mapping(uint256 => bool)) public bookedSlots; // serviceId => timestamp => isBooked
    mapping(uint256 => PurchasedService) public purchases;
    mapping(address => uint256[]) public userServices;
    mapping(address => uint256[]) public userPurchases;
    mapping(address => mapping(uint256 => bool)) public userBookedSlots; // user => timestamp => isBooked

    // state variables
    uint256 public nextServiceId;

    // constructor
    constructor(address _timeTokenAddress) {
        timeToken = TIME(_timeTokenAddress);
    }

    // functions
    function createService(
        string memory _title,
        string memory _description,
        uint8 _durationHours
    ) external {
        require(profiles[msg.sender].isRegistered, "User not registered");
        require(_durationHours > 0 && _durationHours <= 24, "Invalid duration");
        require(
            profiles[msg.sender].timeSlotStartHours.length > 0,
            "No available time slots set"
        );

        Service storage newService = services[nextServiceId];
        newService.id = nextServiceId;
        newService.seller = msg.sender;
        newService.title = _title;
        newService.description = _description;
        newService.isActive = true;
        newService.durationHours = _durationHours;

        userServices[msg.sender].push(nextServiceId);
        emit ServiceCreated(nextServiceId, msg.sender, _durationHours);
        nextServiceId++;
    }

    // Register new user and mint initial tokens
    function registerUser(
        string memory _name,
        string memory _description
    ) external {
        require(!profiles[msg.sender].isRegistered, "User already registered");

        UserProfile storage profile = profiles[msg.sender];
        profile.user = msg.sender;
        profile.name = _name;
        profile.description = _description;
        profile.ratingSum = 0;
        profile.ratingCount = 0;
        profile.isRegistered = true;

        // Mint initial 24 TIME tokens for new user
        timeToken.mintForNewUser(msg.sender);

        emit UserRegistered(msg.sender);
    }

    // Helper function to get day of week from timestamp (0 = Monday, 6 = Sunday)
    function getDayOfWeek(uint256 _timestamp) public pure returns (DayOfWeek) {
        // Unix epoch started on Thursday, so we add 3 to make Monday = 0
        return DayOfWeek(((_timestamp / 86400) + 3) % 7);
    }

    // Helper function to get hour from timestamp (0-23)
    function getHour(uint256 _timestamp) public pure returns (uint8) {
        return uint8((_timestamp / 3600) % 24);
    }

    function buyService(uint256 _serviceId, uint256 _scheduledTime) external {
        Service memory service = services[_serviceId];
        UserProfile storage sellerProfile = profiles[service.seller];
        uint256 totalPrice = service.durationHours * TOKEN_PER_HOUR * 10 ** 18;

        require(service.isActive, "Service inactive");
        require(msg.sender != service.seller, "Cannot buy your own service");
        require(
            timeToken.balanceOf(msg.sender) >= totalPrice,
            "Not enough TIME tokens"
        );
        require(
            _scheduledTime > block.timestamp,
            "Scheduled time must be in future"
        );

        // Get day and hour from scheduled time
        DayOfWeek scheduledDay = getDayOfWeek(_scheduledTime);
        uint8 scheduledHour = getHour(_scheduledTime);

        // Check if the day is available for the seller
        require(
            sellerProfile.availableDays[scheduledDay],
            "Day not available for seller"
        );

        // Check if the hour slot is available and valid
        TimeSlot memory slot = sellerProfile.availableTimeSlots[scheduledHour];
        require(
            scheduledHour >= slot.startHour &&
                scheduledHour < slot.endHour &&
                scheduledHour + service.durationHours <= slot.endHour,
            "Time slot not available or invalid"
        );

        // Check if the slot is already booked
        require(
            !userBookedSlots[service.seller][_scheduledTime],
            "Time slot already booked"
        );

        // Transfer tokens from buyer to contract
        require(
            timeToken.transferFrom(msg.sender, address(this), totalPrice),
            "Token transfer failed"
        );

        // Mark the slot as booked
        userBookedSlots[service.seller][_scheduledTime] = true;

        purchases[_serviceId] = PurchasedService({
            serviceId: _serviceId,
            buyer: msg.sender,
            isApproved: false,
            sellerWithdrawn: false,
            buyerWithdrawn: false,
            timestamp: block.timestamp,
            scheduledTime: _scheduledTime,
            isCancelled: false
        });

        userPurchases[msg.sender].push(_serviceId);

        emit ServiceBought(_serviceId, msg.sender, _scheduledTime);
    }

    function approveCompletion(uint256 _serviceId) external {
        PurchasedService storage purchase = purchases[_serviceId];
        Service storage service = services[_serviceId];

        require(msg.sender == service.seller, "Only seller can approve");
        require(!purchase.isApproved, "Already approved");
        require(!purchase.isCancelled, "Service is cancelled");
        require(
            block.timestamp >= purchase.scheduledTime,
            "Cannot approve before scheduled time"
        );
        require(block.timestamp >= purchase.timestamp, "Invalid timestamp");

        purchase.isApproved = true;
        emit ServiceApproved(_serviceId, purchase.buyer);
    }

    function withdrawSeller(uint256 _serviceId) external {
        PurchasedService storage purchase = purchases[_serviceId];
        Service storage service = services[_serviceId];
        uint256 totalPrice = service.durationHours * TOKEN_PER_HOUR * 10 ** 18;

        require(msg.sender == service.seller, "Only seller can withdraw");
        require(!purchase.sellerWithdrawn, "Already withdrawn");
        require(!purchase.isCancelled, "Service is cancelled");

        // Seller can withdraw in two cases:
        // 1. Service is approved (completed)
        // 2. Service is neither cancelled nor approved, but timeout has passed
        bool canWithdraw = purchase.isApproved ||
            (!purchase.isApproved &&
                !purchase.isCancelled &&
                block.timestamp >= purchase.timestamp + TIMEOUT_DURATION);

        require(
            canWithdraw,
            "Cannot withdraw: service not completed and timeout not passed"
        );

        purchase.sellerWithdrawn = true;
        require(
            timeToken.transfer(msg.sender, totalPrice),
            "Token transfer failed"
        );

        string memory reason = purchase.isApproved
            ? "Service completed"
            : "Timeout passed without completion";

        emit WithdrawSuccess(msg.sender, totalPrice, reason);
    }

    function withdrawBuyer(uint256 _serviceId) external {
        PurchasedService storage purchase = purchases[_serviceId];
        Service storage service = services[_serviceId];
        uint256 totalPrice = service.durationHours * TOKEN_PER_HOUR * 10 ** 18;

        require(msg.sender == purchase.buyer, "Only buyer can withdraw");
        require(!purchase.buyerWithdrawn, "Already withdrawn");
        require(
            purchase.isCancelled,
            "Can only withdraw for cancelled services"
        );

        purchase.buyerWithdrawn = true;
        require(
            timeToken.transfer(msg.sender, totalPrice),
            "Token transfer failed"
        );

        emit WithdrawSuccess(
            msg.sender,
            totalPrice,
            "Refund for cancelled service"
        );
    }

    function cancelService(uint256 _serviceId, string memory _reason) external {
        PurchasedService storage purchase = purchases[_serviceId];
        Service storage service = services[_serviceId];

        require(
            msg.sender == purchase.buyer || msg.sender == service.seller,
            "Only buyer or seller can cancel"
        );
        require(!purchase.isCancelled, "Service already cancelled");
        require(!purchase.isApproved, "Cannot cancel completed service");
        require(
            block.timestamp < purchase.scheduledTime,
            "Cannot cancel after service start time"
        );

        purchase.isCancelled = true;
        userBookedSlots[service.seller][purchase.scheduledTime] = false;

        emit ServiceCancelled(_serviceId, msg.sender, _reason);
    }

    // Helper function to get user's available time slots
    function getUserAvailableTimeSlots(
        address _user,
        uint256 _startTime,
        uint256 _endTime
    ) public view returns (uint256[] memory) {
        UserProfile storage profile = profiles[_user];
        require(profile.isRegistered, "User not registered");
        require(_startTime < _endTime, "Invalid time range");
        require(_startTime > block.timestamp, "Start time must be in future");

        // Count available slots
        uint256 availableCount = 0;
        uint256 currentTime = _startTime;

        while (currentTime < _endTime) {
            DayOfWeek currentDay = getDayOfWeek(currentTime);
            uint8 currentHour = getHour(currentTime);

            if (profile.availableDays[currentDay]) {
                TimeSlot memory slot = profile.availableTimeSlots[currentHour];
                if (slot.startHour != 0 || slot.endHour != 0) {
                    // Check if slot exists
                    if (!userBookedSlots[_user][currentTime]) {
                        availableCount++;
                    }
                }
            }
            currentTime += 1 hours;
        }

        // Create array of available slots
        uint256[] memory availableSlots = new uint256[](availableCount);
        uint256 index = 0;
        currentTime = _startTime;

        while (currentTime < _endTime && index < availableCount) {
            DayOfWeek currentDay = getDayOfWeek(currentTime);
            uint8 currentHour = getHour(currentTime);

            if (profile.availableDays[currentDay]) {
                TimeSlot memory slot = profile.availableTimeSlots[currentHour];
                if (slot.startHour != 0 || slot.endHour != 0) {
                    // Check if slot exists
                    if (!userBookedSlots[_user][currentTime]) {
                        availableSlots[index] = currentTime;
                        index++;
                    }
                }
            }
            currentTime += 1 hours;
        }

        return availableSlots;
    }

    // Helper function to get available days
    function getAvailableDays(
        UserProfile storage profile
    ) internal view returns (DayOfWeek[] memory) {
        uint256 count = 0;
        for (uint i = 0; i < 7; i++) {
            if (profile.availableDays[DayOfWeek(i)]) {
                count++;
            }
        }

        DayOfWeek[] memory availableDays = new DayOfWeek[](count);
        uint256 index = 0;
        for (uint i = 0; i < 7; i++) {
            if (profile.availableDays[DayOfWeek(i)]) {
                availableDays[index] = DayOfWeek(i);
                index++;
            }
        }
        return availableDays;
    }

    // Helper function to get available time slots
    function getAvailableTimeSlots(
        UserProfile storage profile
    ) internal view returns (TimeSlot[] memory) {
        TimeSlot[] memory slots = new TimeSlot[](
            profile.timeSlotStartHours.length
        );
        for (uint i = 0; i < profile.timeSlotStartHours.length; i++) {
            slots[i] = profile.availableTimeSlots[
                profile.timeSlotStartHours[i]
            ];
        }
        return slots;
    }

    // Helper function to get service time details
    function getServiceTimeDetails(
        uint256 _serviceId
    )
        external
        view
        returns (
            uint8 durationHours,
            DayOfWeek[] memory availableDays,
            TimeSlot[] memory availableTimeSlots
        )
    {
        Service storage service = services[_serviceId];
        UserProfile storage sellerProfile = profiles[service.seller];
        return (
            service.durationHours,
            getAvailableDays(sellerProfile),
            getAvailableTimeSlots(sellerProfile)
        );
    }

    // Helper function to check if a specific hour is within any available time slot
    function isHourAvailable(
        uint256 _serviceId,
        uint8 _hour
    ) public view returns (bool) {
        Service storage service = services[_serviceId];
        UserProfile storage sellerProfile = profiles[service.seller];
        for (uint i = 0; i < sellerProfile.timeSlotStartHours.length; i++) {
            TimeSlot memory slot = sellerProfile.availableTimeSlots[
                sellerProfile.timeSlotStartHours[i]
            ];
            if (_hour >= slot.startHour && _hour < slot.endHour) {
                return true;
            }
        }
        return false;
    }

    // Helper function to validate if a scheduled time is within available time slots
    function isScheduledTimeValid(
        uint256 _serviceId,
        uint256 _scheduledTime
    ) public view returns (bool, string memory) {
        Service storage service = services[_serviceId];

        // Check if the time is in the future
        if (_scheduledTime <= block.timestamp) {
            return (false, "Scheduled time must be in future");
        }

        // Check if the slot is already booked
        if (bookedSlots[_serviceId][_scheduledTime]) {
            return (false, "Time slot already booked");
        }

        // Get the hour of the scheduled time (0-23)
        uint8 scheduledHour = uint8((_scheduledTime / 3600) % 24);

        // Check if the scheduled hour plus duration fits within any available time slot
        for (uint i = 0; i < service.durationHours; i++) {
            if (isHourAvailable(_serviceId, uint8(scheduledHour + i))) {
                return (true, "Time slot is valid");
            }
        }

        return (false, "Scheduled time not in available slots");
    }

    // Helper function to get TIME token address
    function getTimeTokenAddress() external view returns (address) {
        return address(timeToken);
    }

    // Function to update user's available time slots
    function updateTimeSlots(
        DayOfWeek[] memory _availableDays,
        TimeSlot[] memory _availableTimeSlots
    ) external {
        require(profiles[msg.sender].isRegistered, "User not registered");
        require(_availableDays.length > 0, "No available days");
        require(_availableTimeSlots.length > 0, "No available time slots");

        UserProfile storage profile = profiles[msg.sender];

        // Clear existing time slots
        for (uint i = 0; i < profile.timeSlotStartHours.length; i++) {
            delete profile.availableTimeSlots[profile.timeSlotStartHours[i]];
        }
        delete profile.timeSlotStartHours;

        // Clear existing days
        for (uint i = 0; i < 7; i++) {
            profile.availableDays[DayOfWeek(i)] = false;
        }

        // Validate and set new time slots
        for (uint i = 0; i < _availableTimeSlots.length; i++) {
            TimeSlot memory slot = _availableTimeSlots[i];
            require(slot.startHour < 24 && slot.endHour < 24, "Invalid hours");
            require(slot.startHour < slot.endHour, "Invalid time slot");

            profile.availableTimeSlots[slot.startHour] = slot;
            profile.timeSlotStartHours.push(slot.startHour);
        }

        // Set new available days
        for (uint i = 0; i < _availableDays.length; i++) {
            profile.availableDays[_availableDays[i]] = true;
        }

        emit TimeSlotsUpdated(msg.sender);
    }

    // Helper function to check if a day is available
    function isDayAvailable(
        address _user,
        DayOfWeek _day
    ) public view returns (bool) {
        return profiles[_user].availableDays[_day];
    }

    // Helper function to get time slot for a specific hour
    function getTimeSlot(
        address _user,
        uint8 _hour
    ) public view returns (TimeSlot memory) {
        return profiles[_user].availableTimeSlots[_hour];
    }

    // Helper function to get all time slot start hours
    function getTimeSlotStartHours(
        address _user
    ) public view returns (uint8[] memory) {
        return profiles[_user].timeSlotStartHours;
    }
}
