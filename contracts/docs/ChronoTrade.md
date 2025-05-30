# ChronoTrade Smart Contract Documentation

## Overview

ChronoTrade is a smart contract that facilitates time-based service trading using the TIME token. Users can create services, book time slots, and manage service completion and payments.

## Constants

-   `TIMEOUT_DURATION`: 10 days - Time after which a service can be considered timed out
-   `TOKEN_PER_HOUR`: 1 - Number of TIME tokens charged per hour of service

## Enums

### DayOfWeek

```solidity
enum DayOfWeek {
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday
}
```

## Structs

### TimeSlot

```solidity
struct TimeSlot {
    uint8 startHour;  // 0-23
    uint8 endHour;    // 0-23
}
```

### Service

```solidity
struct Service {
    uint256 id;
    address seller;
    string title;
    string description;
    bool isActive;
    uint8 durationHours;
    DayOfWeek[] availableDays;
    TimeSlot[] availableTimeSlots;
}
```

### UserProfile

```solidity
struct UserProfile {
    address user;
    string name;
    string description;
    uint256 ratingSum;
    uint256 ratingCount;
    bool isRegistered;
}
```

### PurchasedService

```solidity
struct PurchasedService {
    uint256 serviceId;
    address buyer;
    bool isApproved;
    bool sellerWithdrawn;
    bool buyerWithdrawn;
    uint256 timestamp;
    uint256 scheduledTime;
    bool isCancelled;
}
```

## Events

-   `ServiceCreated(uint256 indexed serviceId, address indexed seller, uint8 durationHours)`
-   `ServiceBought(uint256 indexed serviceId, address indexed buyer, uint256 startTime)`
-   `ServiceCompleted(uint256 indexed serviceId, address indexed buyer)`
-   `ServiceCancelled(uint256 indexed serviceId, address indexed by, string reason)`
-   `Withdraw(address indexed user, uint256 amount)`
-   `UserRated(address indexed ratedUser, uint8 rating)`
-   `ServiceApproved(uint256 indexed serviceId, address indexed buyer)`
-   `WithdrawSuccess(address indexed user, uint256 amount, string reason)`
-   `UserRegistered(address indexed user)`

## Functions

### Constructor

```solidity
constructor(address _timeTokenAddress)
```

-   Initializes the contract with the TIME token address
-   Parameters:
    -   `_timeTokenAddress`: Address of the TIME token contract

### User Management

```solidity
function registerUser(string memory _name, string memory _description) external
```

-   Registers a new user and mints 24 TIME tokens
-   Parameters:
    -   `_name`: User's name
    -   `_description`: User's description
-   Requirements:
    -   User must not be already registered

### Service Management

```solidity
function createService(
    string memory _title,
    string memory _description,
    uint8 _durationHours,
    DayOfWeek[] memory _availableDays,
    TimeSlot[] memory _availableTimeSlots
) external
```

-   Creates a new service
-   Parameters:
    -   `_title`: Service title
    -   `_description`: Service description
    -   `_durationHours`: Duration in hours (1-24)
    -   `_availableDays`: Array of available days
    -   `_availableTimeSlots`: Array of available time slots
-   Requirements:
    -   Duration must be between 1 and 24 hours
    -   Must have at least one available day and time slot
    -   Time slots must be valid (start < end, duration fits)

```solidity
function buyService(uint256 _serviceId, uint256 _scheduledTime) external
```

-   Purchases a service for a specific time slot
-   Parameters:
    -   `_serviceId`: ID of the service
    -   `_scheduledTime`: Unix timestamp for the service
-   Requirements:
    -   Service must be active
    -   Buyer must have enough TIME tokens
    -   Time slot must be valid and available

```solidity
function cancelService(uint256 _serviceId, string memory _reason) external
```

-   Cancels a service before its scheduled time
-   Parameters:
    -   `_serviceId`: ID of the service
    -   `_reason`: Reason for cancellation
-   Requirements:
    -   Caller must be either the buyer or seller
    -   Service must not be already cancelled
    -   Service must not be completed
    -   Current time must be before the scheduled appointment time
-   Effects:
    -   Marks the service as cancelled
    -   Frees up the booked time slot
    -   Emits ServiceCancelled event

### Service Completion

```solidity
function approveCompletion(uint256 _serviceId) external
```

-   Marks a service as completed
-   Parameters:
    -   `_serviceId`: ID of the service
-   Requirements:
    -   Caller must be the service seller
    -   Service must not be already approved or cancelled

### Withdrawals

```solidity
function withdrawSeller(uint256 _serviceId) external
```

-   Allows seller to withdraw tokens
-   Parameters:
    -   `_serviceId`: ID of the service
-   Requirements:
    -   Caller must be the seller
    -   Service must not be cancelled
    -   Either service is approved or timeout has passed

```solidity
function withdrawBuyer(uint256 _serviceId) external
```

-   Allows buyer to withdraw tokens for cancelled services
-   Parameters:
    -   `_serviceId`: ID of the service
-   Requirements:
    -   Caller must be the buyer
    -   Service must be cancelled

### Helper Functions

```solidity
function isTimeSlotAvailable(uint256 _serviceId, uint256 _timestamp) public view returns (bool)
```

-   Checks if a time slot is available
-   Parameters:
    -   `_serviceId`: ID of the service
    -   `_timestamp`: Unix timestamp to check
-   Returns: Boolean indicating availability

```solidity
function getServiceTimeDetails(uint256 _serviceId) external view returns (
    uint8 durationHours,
    DayOfWeek[] memory availableDays,
    TimeSlot[] memory availableTimeSlots
)
```

-   Returns service time details
-   Parameters:
    -   `_serviceId`: ID of the service
-   Returns: Duration, available days, and time slots

```solidity
function isHourAvailable(uint256 _serviceId, uint8 _hour) public view returns (bool)
```

-   Checks if a specific hour is available
-   Parameters:
    -   `_serviceId`: ID of the service
    -   `_hour`: Hour to check (0-23)
-   Returns: Boolean indicating availability

```solidity
function isScheduledTimeValid(uint256 _serviceId, uint256 _scheduledTime) public view returns (bool, string memory)
```

-   Validates if a scheduled time is valid
-   Parameters:
    -   `_serviceId`: ID of the service
    -   `_scheduledTime`: Unix timestamp to validate
-   Returns: Tuple of (isValid, reason)

## State Variables

-   `timeToken`: TIME token contract instance
-   `profiles`: Mapping of address to UserProfile
-   `services`: Mapping of serviceId to Service
-   `bookedSlots`: Mapping of serviceId and timestamp to booking status
-   `purchases`: Mapping of serviceId to PurchasedService
-   `userServices`: Mapping of address to array of service IDs
-   `userPurchases`: Mapping of address to array of purchased service IDs
-   `nextServiceId`: Counter for service IDs
