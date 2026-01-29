# OPD Token Allocation Engine

Backend token allocation system for hospital OPD built using Node.js.

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

Server runs on http://localhost:3000

## Running Simulation

```bash
npm run simulate
```

## API Endpoints

### Create Token
```
POST /api/tokens
Body: { "doctorId": "D1", "slotId": "09-10", "patientType": "WALKIN" }
```

### Cancel Token
```
POST /api/tokens/:tokenId/cancel
```

### Mark No-Show
```
POST /api/tokens/:tokenId/no-show
```

### Add Emergency Token
```
POST /api/tokens/emergency
Body: { "doctorId": "D1", "slotId": "09-10" }
```

### Get Slot Status
```
GET /api/slots/:doctorId/:slotId
```

### Get All Doctors
```
GET /api/doctors
```

## Patient Priority

1. Emergency
2. Paid
3. Follow-up
4. Online
5. Walk-in

## Author

Sonal Kumar
