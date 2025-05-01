import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Book Library API')
    .setDescription(
      `
      A comprehensive API for managing books and hierarchical categories.
      
      ## Features
      
      - **Categories**: Manage hierarchical categories with infinite nesting
      - **Books**: CRUD operations with category associations
      - **Validation**: Input validation with detailed error messages
      
      ## Error Codes
      
      - \`400\` - Bad Request (Invalid input)
      - \`404\` - Not Found
      - \`409\` - Conflict (e.g., duplicate names)
      - \`500\` - Server Error
      
      ## Common Request Headers
      
      \`\`\`
      Content-Type: application/json
      Accept: application/json
      \`\`\`
    `,
    )
    .setVersion('1.0')
    .addTag('books', 'Book management endpoints')
    .addTag('categories', 'Category management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Customize Swagger UI options
  const customOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 3,
    },
    customSiteTitle: 'Book Library API Documentation',
  };

  SwaggerModule.setup('api/docs', app, document, customOptions);
}
