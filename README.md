# Book Library API

## Description

The Book Library API is a RESTful service built with NestJS that manages books and their categories. It provides a hierarchical category system with infinite nesting capabilities and efficient book management features.

### Key Features

- **Hierarchical Categories**: Support for infinitely nested categories
- **Book Management**: CRUD operations for books with category associations
- **Category Breadcrumbs**: Track the full path from root to any category
- **Data Validation**: Comprehensive input validation with detailed error messages
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Type Safety**: Built with TypeScript for enhanced type safety
- **Testing**: Comprehensive unit and integration tests
- **Pagination**: Efficient handling of large datasets
- **Cascade Operations**: Automatic handling of related data

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL (v13 or later)
- Docker (optional, for containerized database)
- npm (v7 or later)

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd book-library-api

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start database (using Docker)
docker-compose up -d

# Start application in development mode
npm run start:dev
```

The API will be available at `http://localhost:3000/api`
Swagger documentation will be at `http://localhost:3000/api/docs`

## Detailed Installation

### 1. Environment Setup

Create a `.env` file with your configuration:

```env
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=book_library
```

### 2. Database Setup

#### Using Docker (Recommended)
```bash
# Start PostgreSQL container
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Using Local PostgreSQL
1. Create a database named 'book_library'
2. Update `.env` with your database credentials

### 3. Application Setup

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Run database migrations
npm run typeorm:run-migrations
```

## Running the Application

### Development Mode
```bash
# Start with hot-reload
npm run start:dev

# Start in debug mode
npm run start:debug
```

### Production Mode
```bash
# Build
npm run build

# Start
npm run start:prod
```

## API Usage Examples

### Managing Categories

1. Create a root category:
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Fiction"}'
```

2. Create a subcategory:
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Science Fiction", "parentId": "parent-uuid"}'
```

### Managing Books

1. Create a book:
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"name": "Dune", "categoryId": "category-uuid"}'
```

2. List books in a category:
```bash
curl "http://localhost:3000/api/books?categoryId=category-uuid&page=1&limit=10"
```

## Testing

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Test Structure

```
test/
├── unit/
│   ├── books/
│   │   ├── books.service.spec.ts
│   │   └── books.controller.spec.ts
│   └── categories/
│       ├── categories.service.spec.ts
│       └── categories.controller.spec.ts
├── integration/
│   ├── books.integration.spec.ts
│   └── categories.integration.spec.ts
└── utils/
    ├── database.util.ts
    └── test-helpers.ts
```

## API Documentation

### Swagger UI
Access the interactive API documentation at `/api/docs` when the application is running.

### Main Endpoints

#### Categories
- `POST /api/categories` - Create a category
  - Request: `{ "name": "Fiction", "parentId?: "uuid" }`
  - Response: `201 Created` with category object

- `GET /api/categories` - List all categories
  - Response: `200 OK` with array of categories

- `GET /api/categories/:id` - Get category details
  - Response: `200 OK` with category and children

#### Books
- `POST /api/books` - Create a book
  - Request: `{ "name": "Book Title", "categoryId": "uuid" }`
  - Response: `201 Created` with book object

- `GET /api/books` - List books with pagination
  - Query: `?page=1&limit=10&categoryId=uuid`
  - Response: `200 OK` with paginated books

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages:

```json
{
  "statusCode": 400,
  "message": "Invalid input",
  "errors": [
    {
      "field": "name",
      "message": "name must be unique"
    }
  ]
}
```

### Status Codes
- `200` - Success
- `201` - Resource created
- `400` - Bad request / Invalid input
- `404` - Resource not found
- `409` - Conflict (e.g., duplicate names)
- `500` - Server error

## Performance Considerations

- Pagination is implemented for large datasets
- Database indexes are in place for frequent queries
- Efficient category tree traversal using materialized paths

## Security

- Input validation on all endpoints
- SQL injection protection via TypeORM
- Request validation using class-validator
- Proper error handling to prevent information leakage

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

1. Database Connection Failed
```bash
# Check database status
docker-compose ps

# View database logs
docker-compose logs db
```

2. Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000
```

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the API documentation
- Run tests to verify your setup

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.