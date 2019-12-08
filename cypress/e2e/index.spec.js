describe('Home Page Test', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
  });
  it('Has no detectable a11y violations on load', () => {
    cy.checkA11y();
  });

  it('should have a title', () => {
    cy.get('h1').contains('Hi people');
  });
});
