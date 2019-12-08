describe('Home Page Test', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  it('Should display a current copyright', () => {
    const year = new Date().getFullYear();
    cy.get('footer').contains(`© ${year}`);
  });
});
