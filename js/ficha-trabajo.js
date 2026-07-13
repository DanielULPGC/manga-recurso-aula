(function () {
  'use strict';

  const printButton = document.getElementById('printButton');
  const printStatus = document.getElementById('printStatus');
  const dateInput = document.getElementById('worksheetDate');

  if (dateInput && !dateInput.value) {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    dateInput.value = localDate.toISOString().slice(0, 10);
  }

  if (printButton) {
    printButton.addEventListener('click', function () {
      if (printStatus) printStatus.textContent = 'Abriendo la vista de impresión.';
      window.print();
    });
  }

  window.addEventListener('afterprint', function () {
    if (printStatus) printStatus.textContent = '';
  });
}());
