describe("Authentication Flow", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should show validation errors for empty fields", () => {
    cy.get('button[type="submit"]').click();
    cy.contains("Email is required").should("be.visible");
    cy.contains("Password is required").should("be.visible");
  });

  it("should show error for invalid credentials", () => {
    cy.get("#email").type("wrong@example.com");
    cy.get("#password").type("wrongpassword");
    cy.get('button[type="submit"]').click();
    // Assuming you have a toast or error message
    cy.contains("Wrong email or password").should("be.visible");
  });

  it("should navigate to forgot password page", () => {
    cy.contains(/Forgot password/i).click();
    cy.url().should("include", "/forgot-password");
  });
});
