# AccelQuote AGX™ (Agentic Gen AI eXperience) - Process Documentation

## Current Status (As of June 4, 2025)

### Implemented Features

#### PDF Viewing and Management
- PDF file list display with search functionality
- Interactive PDF viewer using @react-pdf-viewer/core
- File selection and preview capabilities
- Responsive layout with clean UI

#### Data Extraction
- Integration with AGX™ API endpoint (https://20.81.208.37)
- PDF data extraction functionality
- Loading states during extraction process
- Error handling for extraction failures

#### Results Display
- Markdown-based extraction results display
- Copy to clipboard functionality
- Download results as markdown files
- Hierarchical data presentation

#### UI/UX
- Modern, responsive design with Tailwind CSS
- Loading spinners for async operations
- Error state handling and recovery
- Search functionality for PDF files
- JBS branding integration

### Technical Implementation

#### Core Technologies
- React with TypeScript
- Tailwind CSS for styling
- PDF.js for PDF rendering
- React PDF Viewer for PDF interaction

#### API Integration
- RESTful API communication
- Error handling middleware
- Response formatting

## Pending Improvements

### Short Term
1. **Performance Optimization**
   - [ ] Implement file caching
   - [ ] Add lazy loading for PDF previews
   - [ ] Optimize API calls

2. **User Experience**
   - [ ] Add file upload functionality
   - [ ] Implement batch processing
   - [ ] Add sorting options for file list
   - [ ] Implement file filtering by type/size

3. **Data Extraction**
   - [ ] Add extraction templates
   - [ ] Support for multiple extraction modes
   - [ ] Progress tracking for large files

### Medium Term
1. **Advanced Features**
   - [ ] Document comparison
   - [ ] Extraction history
   - [ ] User preferences storage
   - [ ] Custom extraction rules

2. **Integration**
   - [ ] Authentication system
   - [ ] User roles and permissions
   - [ ] Multi-tenant support
   - [ ] API rate limiting

### Long Term
1. **Enterprise Features**
   - [ ] Automated processing
   - [ ] Batch scheduling
   - [ ] Integration with document management systems
   - [ ] Advanced analytics

2. **Scalability**
   - [ ] Microservices architecture
   - [ ] Load balancing
   - [ ] High availability setup
   - [ ] Database optimization

## Development Guidelines

### Code Structure
- Components in `src/components`
- Services in `src/services`
- Utilities in `src/utils`
- Styles in `src/styles`

### Best Practices
1. Use TypeScript for type safety
2. Follow React best practices
3. Implement error boundaries
4. Write unit tests for new features
5. Document API changes
6. Follow semantic versioning

### Build and Deployment
1. Use `npm run build` for production builds
2. Test in development with `npm start`
3. Run tests with `npm test`

## Known Issues

1. ~~PDF rendering performance with large files~~
2. ~~Memory usage with multiple PDFs open~~
3. ~~Network timeout handling needs improvement~~
4. ~~Mixed Content Error: HTTPS/HTTP protocol mismatch - RESOLVED (June 20, 2025)~~

### Recently Resolved Issues

#### Mixed Content Security Error (June 20, 2025)
- **Issue**: Application served over HTTPS was trying to make HTTP requests to API server
- **Error**: "Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure resource 'http://20.81.208.37/get_file_list'"
- **Solution**: 
  - Updated API configuration to automatically match protocol with current page
  - Enhanced error handling with specific mixed content error detection
  - Updated environment variables to use HTTPS for API endpoints
  - Added fallback mechanisms for development

## Next Steps

1. Implement file upload functionality
2. Add user authentication
3. Improve error handling
4. Add extraction templates
5. Implement batch processing
6. Add automated testing
7. Optimize performance
8. Implement caching
9. Add analytics
10. Improve documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Write tests
5. Submit pull request

---

*Last updated: June 4, 2025*
