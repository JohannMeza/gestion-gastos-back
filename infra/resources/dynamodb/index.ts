import { createAnalyticsTable } from './analytics-table';
import { createClientTable } from './client-table';
import { createLoanTable } from './loan-table';
import { createPaymentTable } from './payment-table';

export function createDatabaseTables() {
  const clientTable = createClientTable();
  const loanTable = createLoanTable();
  const paymentTable = createPaymentTable();
  const analyticsTable = createAnalyticsTable();

  return {
    clientTable,
    loanTable,
    paymentTable,
    analyticsTable,
  };
}
