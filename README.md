SERVER/
│
├── src/
│   ├── config/
│   │   ├── db.js                # MongoDB connection setup
│   │   └── env.js               # Environment variable configuration
│   │
│   ├── controllers/             # Route handlers (business logic)
│   │   ├── auth.controller.js   # Authentication-related logic (login, register)
│   │   ├── product.controller.js# Product-related logic (listing, bidding)
│   │   ├── order.controller.js  # Order-related logic (creation, tracking)
│   │   └── user.controller.js   # User profile and role management
│   │
│   ├── middleware/              # Custom middleware
│   │   ├── authMiddleware.js    # Authentication and role-based authorization
│   │   ├── errorHandler.js      # Global error handling middleware
│   │   └── requestLogger.js     # Middleware to log API requests
│   │
│   ├── models/                  # MongoDB models (schemas)
│   │   ├── User.js              # User model
│   │   ├── Product.js           # Product model
│   │   ├── Bid.js               # Bid model
│   │   └── Order.js             # Order model
│   │
│   ├── routes/                  # API route definitions
│   │   ├── auth.routes.js       # Routes for authentication
│   │   ├── product.routes.js    # Routes for product listing and bidding
│   │   ├── order.routes.js      # Routes for order and delivery management
│   │   └── user.routes.js       # Routes for user profile and dashboard
│   │
│   ├── services/                # Business logic and MongoDB queries
│   │   ├── AuthService.js       # Authentication service
│   │   ├── ProductService.js    # Product-related business logic
│   │   ├── OrderService.js      # Order-related business logic
│   │   └── UserService.js       # User-related business logic
│   │
│   ├── utils/                   # Utility functions and helpers
│   │   ├── tokenUtil.js         # JWT token creation and validation
│   │   ├── hashUtil.js          # Password hashing and comparison
│   │   ├── errorUtil.js         # Error generation helper
│   │   └── logger.js            # Logger utility (e.g., Winston or Morgan)
│   │
│   ├── validators/              # Input validation schemas
│   │   ├── authValidator.js     # Validation for login and registration
│   │   ├── productValidator.js  # Validation for product listing and bidding
│   │   └── orderValidator.js    # Validation for order creation
│   │
│   ├── app.js                   # Main Express app configuration
│   └── server.js                # Application entry point
│
├── tests/                       # Unit and integration tests
│   ├── auth.test.js             # Tests for authentication routes and logic
│   ├── product.test.js          # Tests for product-related logic
│   ├── order.test.js            # Tests for order-related logic
│   └── utils/                   # Test utility functions
│
├── .env                         # Environment variables (API keys, MongoDB URI)
├── package.json                 # Dependencies and scripts
└── README.md                    # Project documentation
