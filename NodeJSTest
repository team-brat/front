// ReceivingForm.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import ReceivingForm from './ReceivingForm';

test('Submit button is disabled when no documents are attached', () => {
  render(<ReceivingForm />);
  const submitButton = screen.getByText('Submit');
  expect(submitButton).toBeDisabled();
});

test('Submit button is enabled when all required fields are filled and documents attached', () => {
  render(<ReceivingForm />);
  
  // Fill required fields
  fireEvent.change(screen.getByLabelText(/scheduled date/i), { target: { value: '2025-01-30' } });
  fireEvent.change(screen.getByLabelText(/supplier name/i), { target: { value: 'Test Supplier' } });
  
  // Simulate document upload
  const fileInput = screen.getByLabelText(/file attachment/i);
  const file1 = new File(['invoice content'], 'invoice.pdf', { type: 'application/pdf' });
  const file2 = new File(['bill content'], 'bill.pdf', { type: 'application/pdf' });
  const file3 = new File(['airway content'], 'airway.pdf', { type: 'application/pdf' });
  
  fireEvent.change(fileInput, { target: { files: [file1, file2, file3] } });
  
  const submitButton = screen.getByText('Submit');
  expect(submitButton).not.toBeDisabled();
});


// ReceivingPage.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ReceivingPage from './ReceivingPage';

// Mock API server
const server = setupServer(
  rest.post('/api/receiving-orders', (req, res, ctx) => {
    return res(ctx.json({ success: true, orderId: '12345' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('submitting form sends data to API and shows success message', async () => {
  render(<ReceivingPage />);
  
  // Fill form fields and attach documents
  // ...

  fireEvent.click(screen.getByText('Submit'));

  await waitFor(() => {
    expect(screen.getByText(/successfully created/i)).toBeInTheDocument();
  });
});


// cypress/integration/receiving_page_spec.js
describe('Receiving Page', () => {
  before(() => {
    cy.login('sana.kang', 'password');
  });

  it('should allow creating a new receiving order with documents', () => {
    cy.visit('/receiving');

    cy.contains('Create Receiving').click();

    // Fill required fields
    cy.get('[data-testid="scheduled-date"]').type('2025-02-15');
    cy.get('[data-testid="supplier-name"]').type('Test Supplier');
    cy.get('[data-testid="supplier-id"]').type('SUPP-123');

    // Attach documents
    cy.get('[data-testid="invoice-upload"]').attachFile('test-files/invoice.pdf');
    cy.get('[data-testid="bill-upload"]').attachFile('test-files/bill.pdf');
    cy.get('[data-testid="airway-upload"]').attachFile('test-files/airway.pdf');

    cy.get('[data-testid="submit-button"]').click();

    // Verify success
    cy.contains('Receiving order created successfully').should('be.visible');

    // Confirm order appears in records
    cy.visit('/receiving-records');
    cy.contains('Test Supplier').should('be.visible');
  });
});
