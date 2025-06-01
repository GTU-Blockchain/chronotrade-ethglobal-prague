# ⏰ ChronoTrade

> A revolutionary decentralized time-trading platform built on Flow that enables users to buy and sell services using TIME tokens. Trade your time, earn TIME tokens, and build your reputation in the decentralized economy.

![Flow](https://img.shields.io/badge/Flow-00EF8B?style=for-the-badge&logo=flow&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=Solidity&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Blockscout](https://img.shields.io/badge/Blockscout-00A8C5?style=for-the-badge&logo=blockscout&logoColor=white)

## 🌟 Why ChronoTrade?

ChronoTrade revolutionizes the way we trade time and services by:

- **Decentralized Time Trading**: Buy and sell services using TIME tokens on the Flow blockchain
- **Fair Value Exchange**: 1 TIME token = 1 hour of service
- **Trustless System**: Smart contracts ensure secure and transparent transactions
- **Reputation Building**: Earn ratings and build your reputation through completed services
- **Flexible Scheduling**: Set your availability and manage your time slots efficiently
- **Enhanced Transparency**: Real-time transaction tracking through Blockscout explorer

## 🚀 Key Features

### 👤 User Management
- Create your profile with personalized information
- Receive 24 TIME tokens upon registration
- Build your reputation through ratings and reviews
- Manage your service history and earnings

### ⏱️ Time Slot Management
- Set your availability for each day of the week
- Define custom time slots with start and end hours
- Real-time availability checking
- Smart booking system to prevent double-booking

### 💼 Service Management
- Create and list your services
- Set your service duration and pricing
- Schedule services within available time slots
- Handle service completion and payments automatically
- Cancel services with automatic refund processing

### ⭐ Rating & Review System
- Rate services on a 1-5 scale
- Leave detailed feedback for completed services
- View service provider ratings and reviews
- Build trust through transparent reputation tracking

## 🔧 Technical Architecture

### Smart Contracts
- **ChronoTrade.sol**: Main contract handling service creation, booking, and management
- **TIME.sol**: ERC20 token contract for the TIME token

### Network Integration
- **Flow Network**: Built on Flow's secure and scalable blockchain
- **Blockscout Explorer**: Real-time transaction monitoring and verification
  - View all transactions and contract interactions
  - Track token transfers and service bookings
  - Monitor smart contract events and state changes

### Key Contract Functions

#### User Operations
```solidity
function registerUser(string name, string description)
function updateTimeSlots(DayOfWeek[] days, TimeSlot[] slots)
function getProfile(address user)
```

#### Service Operations
```solidity
function createService(string title, string description, uint8 durationHours)
function buyService(uint256 serviceId, uint256 scheduledTime)
function approveCompletion(uint256 serviceId)
function cancelService(uint256 serviceId, string reason)
```

#### Payment Operations
```solidity
function withdrawSeller(uint256 serviceId)
function withdrawBuyer(uint256 serviceId)
```

## 🛠️ Development

### Prerequisites
- Node.js
- Hardhat
- Ethers.js

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/chronotrade.git

# Install dependencies
npm install

# Run tests
npx hardhat test

# Deploy contracts
npx hardhat run scripts/deploy.js --network flow
```

### Network Configuration
- **Flow**: Configure your Flow network settings in `hardhat.config.js`
- **Blockscout**: Access the explorer at `https://blockscout.com`

## 🔒 Security Features

- Time slot validation to prevent double booking
- Secure token transfer mechanisms
- Service completion verification
- Cancellation restrictions
- Comment and rating validation
- Timeout protection for uncompleted services
- Blockscout transaction monitoring

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for the Flow community
