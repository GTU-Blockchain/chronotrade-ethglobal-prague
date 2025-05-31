# ChronoTrade

A decentralized time-trading platform built on Ethereum that allows users to buy and sell services using TIME tokens.

## Overview

ChronoTrade is a smart contract that enables users to:

-   Register as service providers or buyers
-   Set available time slots for services
-   Create and purchase services
-   Manage service completion and payments
-   Rate and comment on services
-   Handle service cancellations and refunds

## Key Features

### User Management

-   User registration with profile information
-   Initial TIME token minting for new users
-   Profile management with ratings and reviews

### Time Slot Management

-   Set available days (Monday through Sunday)
-   Define time slots with start and end hours
-   Check slot availability and booking status
-   Manage booked time slots

### Service Management

-   Create services with title, description, and duration
-   Purchase services using TIME tokens
-   Schedule services within available time slots
-   Complete services and handle payments
-   Cancel services and process refunds

### Rating and Comments

-   Rate services on a scale of 1-5
-   Leave comments on completed services
-   View service ratings and comments
-   Track user reputation

## Contract Functions

### User Functions

-   `registerUser(string name, string description)`: Register a new user
-   `updateTimeSlots(DayOfWeek[] days, TimeSlot[] slots)`: Update available time slots
-   `getProfile(address user)`: Get user profile information

### Service Functions

-   `createService(string title, string description, uint8 durationHours)`: Create a new service
-   `buyService(uint256 serviceId, uint256 scheduledTime)`: Purchase a service
-   `approveCompletion(uint256 serviceId)`: Mark a service as completed
-   `cancelService(uint256 serviceId, string reason)`: Cancel a service

### Payment Functions

-   `withdrawSeller(uint256 serviceId)`: Withdraw payment for completed service
-   `withdrawBuyer(uint256 serviceId)`: Withdraw refund for cancelled service

### Time Slot Functions

-   `getUserAvailableTimeSlots(address user, uint256 startTime, uint256 endTime)`: Get available time slots
-   `isTimeSlotAvailable(address user, uint256 startTime, uint256 endTime)`: Check slot availability
-   `getBookedTimeSlots(address user, uint256 startTime, uint256 endTime)`: Get booked time slots

### Rating and Comment Functions

-   `createComment(uint256 serviceId, string content, uint8 rating)`: Create a service comment
-   `getComments(uint256 serviceId)`: Get service comments
-   `hasUserCommented(uint256 serviceId, address user)`: Check if user has commented

## Technical Details

### State Variables

-   `timeToken`: TIME token contract address
-   `TIMEOUT_DURATION`: Duration for service timeout (10 days)
-   `TOKEN_PER_HOUR`: Token rate per hour (1 token)

### Data Structures

-   `TimeSlot`: Start and end hours for a time slot
-   `Service`: Service details including title, description, and duration
-   `UserProfile`: User information and available time slots
-   `PurchasedService`: Purchase details and status
-   `Comment`: Service comment with rating

### Events

-   `ServiceCreated`: Emitted when a new service is created
-   `ServiceBought`: Emitted when a service is purchased
-   `ServiceCompleted`: Emitted when a service is completed
-   `ServiceCancelled`: Emitted when a service is cancelled
-   `WithdrawSuccess`: Emitted when funds are withdrawn
-   `UserRated`: Emitted when a user is rated
-   `CommentCreated`: Emitted when a comment is created

## Security Features

-   Time slot validation to prevent double booking
-   Token transfer checks for payments
-   Service completion verification
-   Cancellation restrictions
-   Comment and rating validation

## Development

### Prerequisites

-   Node.js
-   Hardhat
-   Ethers.js

### Testing

Run the test suite:

```bash
npx hardhat test
```

### Deployment

Deploy the contract:

```bash
npx hardhat run scripts/deploy.js --network <network>
```

## License

MIT
