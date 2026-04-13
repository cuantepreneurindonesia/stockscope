describe('Core Journey: Login -> Filter Stocks -> Set Alert', () => {
  it('should successfully execute the core journey', () => {
    // 1. Mock the API setup or set up interception
    cy.intercept('POST', '/api/auth/callback/credentials', { statusCode: 200 }).as('login');
    // The screener page fetches /api/screen (not /api/screener*)
    cy.intercept('GET', '/api/screen*', { fixture: 'screener.json' }).as('getStocks');
    cy.intercept('POST', '/api/alerts', { statusCode: 201, body: { success: true } }).as('setAlert');

    // 1. Login
    cy.visit('/auth/signin');
    cy.get('input[name="email"]').type('test@example.com');
    // Using a mock UI path for NextAuth credentials
    cy.contains('Sign in').click();

    // 2. Filter Stocks — locale-prefixed screener route
    cy.visit('/en/screener');
    // Assuming react-select or regular select
    cy.get('input[placeholder*="Search"]').type('BBCA');
    cy.contains('BBCA').should('be.visible');

    // 3. Set Alert
    // Wait for mock
    cy.contains('Alerts').click();
    cy.get('input[name="ticker"]').type('BBCA');
    cy.get('input[name="targetPrice"]').type('10000');
    cy.get('button[type="submit"]').click();
    cy.wait('@setAlert');
    cy.contains('success').should('exist');
  });
});
