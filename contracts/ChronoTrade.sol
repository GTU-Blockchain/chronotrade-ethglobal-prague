pragma solidity ^0.8.19;

// SPDX-License-Identifier: MIT

contract ChronoTrade {
    // constants
    uint256 public constant TIMEOUT_DURATION = 10 days;
    uint256 public constant TOKEN_PER_HOUR = 1; // 1 token per hour

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
        DayOfWeek[] availableDays; // Which days the service is available
        TimeSlot[] availableTimeSlots; // Available time slots for each day
    }

    struct UserProfile {
        address user;
        string name;
        string description;
        uint256 ratingSum;
        uint256 ratingCount;
        uint256 balance;
    }

    struct PurchasedService {
        uint256 serviceId;
        address buyer;
        bool isApproved;
        bool sellerWithdrawn;
        bool buyerWithdrawn;
        uint256 timestamp; // When the service was bought
        uint256 scheduledTime; // When the service is scheduled for
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

    // mappings
    mapping(address => UserProfile) public profiles;
    mapping(uint256 => Service) public services;
    mapping(uint256 => mapping(uint256 => bool)) public bookedSlots; // serviceId => timestamp => isBooked
    mapping(uint256 => PurchasedService) public purchases;
    mapping(address => uint256[]) public userServices;
    mapping(address => uint256[]) public userPurchases;

    // state variables
    uint256 public nextServiceId;

    // constructor
    constructor() {
        // constructor
    }

    // functions
    function createService(
        string memory _title,
        string memory _description,
        uint8 _durationHours,
        DayOfWeek[] memory _availableDays,
        TimeSlot[] memory _availableTimeSlots
    ) external {
        require(_durationHours > 0 && _durationHours <= 24, "Invalid duration");
        require(_availableDays.length > 0, "No available days");
        require(_availableTimeSlots.length > 0, "No available time slots");

        // Validate time slots
        for (uint i = 0; i < _availableTimeSlots.length; i++) {
            TimeSlot memory slot = _availableTimeSlots[i];
            require(slot.startHour < 24 && slot.endHour < 24, "Invalid hours");
            require(slot.startHour < slot.endHour, "Invalid time slot");
            require(
                slot.endHour - slot.startHour >= _durationHours,
                "Time slot too short for service duration"
            );
        }

        Service storage newService = services[nextServiceId];
        newService.id = nextServiceId;
        newService.seller = msg.sender;
        newService.title = _title;
        newService.description = _description;
        newService.isActive = true;
        newService.durationHours = _durationHours;

        // Copy available days
        for (uint i = 0; i < _availableDays.length; i++) {
            newService.availableDays.push(_availableDays[i]);
        }

        // Copy available time slots
        for (uint i = 0; i < _availableTimeSlots.length; i++) {
            newService.availableTimeSlots.push(_availableTimeSlots[i]);
        }

        userServices[msg.sender].push(nextServiceId);
        emit ServiceCreated(nextServiceId, msg.sender, _durationHours);
        nextServiceId++;
    }

    function buyService(uint256 _serviceId, uint256 _scheduledTime) external {
        Service memory service = services[_serviceId];
        uint256 totalPrice = service.durationHours * TOKEN_PER_HOUR;

        require(service.isActive, "Service inactive");
        require(
            profiles[msg.sender].balance >= totalPrice,
            "Not enough tokens"
        );

        // Use the helper function to validate the scheduled time
        (bool isValid, string memory reason) = isScheduledTimeValid(
            _serviceId,
            _scheduledTime
        );
        require(isValid, reason);

        profiles[msg.sender].balance -= totalPrice;
        bookedSlots[_serviceId][_scheduledTime] = true;

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
        require(block.timestamp >= purchase.timestamp, "Invalid timestamp");

        purchase.isApproved = true;
        emit ServiceApproved(_serviceId, purchase.buyer);
    }

    // Helper function to check if a time slot is available
    function isTimeSlotAvailable(
        uint256 _serviceId,
        uint256 _timestamp
    ) public view returns (bool) {
        return !bookedSlots[_serviceId][_timestamp];
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
        return (
            service.durationHours,
            service.availableDays,
            service.availableTimeSlots
        );
    }

    // Helper function to check if a specific hour is within any available time slot
    function isHourAvailable(
        uint256 _serviceId,
        uint8 _hour
    ) public view returns (bool) {
        Service storage service = services[_serviceId];
        for (uint i = 0; i < service.availableTimeSlots.length; i++) {
            TimeSlot memory slot = service.availableTimeSlots[i];
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
        for (uint i = 0; i < service.availableTimeSlots.length; i++) {
            TimeSlot memory slot = service.availableTimeSlots[i];

            // Check if the scheduled hour is within the slot
            if (
                scheduledHour >= slot.startHour && scheduledHour < slot.endHour
            ) {
                // Check if the service duration fits within the slot
                if (scheduledHour + service.durationHours <= slot.endHour) {
                    return (true, "Time slot is valid");
                } else {
                    return (
                        false,
                        "Service duration exceeds available time slot"
                    );
                }
            }
        }

        return (false, "Scheduled time not in available slots");
    }
}
