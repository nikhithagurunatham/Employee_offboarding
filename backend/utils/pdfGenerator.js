import PDFDocument from "pdfkit";

export const generateResignationAcceptanceLetter = (
  employee,
  offboarding,
  res
) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 60
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="resignation-acceptance-${employee.employeeId}.pdf"`
  );

  doc.pipe(res);

  doc.fontSize(20).text("RESIGNATION ACCEPTANCE LETTER", {
    align: "center"
  });

  doc.moveDown(2);

  doc.fontSize(12).text(`Date: ${formatDate(new Date())}`);

  doc.moveDown();

  doc.text(`To,`);
  doc.text(`${employee.name}`);
  doc.text(`${employee.designation}`);
  doc.text(`${employee.department}`);

  doc.moveDown(2);

  doc.text(
    `Subject: Acceptance of Resignation`
  );

  doc.moveDown();

  doc.text(
    `Dear ${employee.name},`
  );

  doc.moveDown();

  doc.text(
    `This is to formally acknowledge and accept your resignation from the position of ${employee.designation} in the ${employee.department} department.`
  );

  doc.moveDown();

  doc.text(
    `Your resignation has been accepted with your last working day being ${formatDate(
      offboarding.lastWorkingDay
    )}.`
  );

  doc.moveDown();

  doc.text(
    `We appreciate your contributions to the organization and wish you success in your future endeavors.`
  );

  doc.moveDown(3);

  doc.text("Sincerely,");

  doc.moveDown();

  doc.text("HR Department");
  doc.text("BlazeUp HROS");

  doc.end();
};


export const generateNOC = (
  employee,
  offboarding,
  res
) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 60
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="noc-${employee.employeeId}.pdf"`
  );

  doc.pipe(res);

  doc.fontSize(20).text("NO OBJECTION CERTIFICATE", {
    align: "center"
  });

  doc.moveDown(2);

  doc.fontSize(12).text(
    `Date: ${formatDate(new Date())}`
  );

  doc.moveDown(2);

  doc.text(
    `This is to certify that ${employee.name}, Employee ID ${employee.employeeId}, working as ${employee.designation} in the ${employee.department} department, has completed the required clearance process as part of the employee offboarding procedure.`
  );

  doc.moveDown();

  doc.text(
    `The employee's last working day was ${formatDate(
      offboarding.lastWorkingDay
    )}.`
  );

  doc.moveDown();

  doc.text(
    `The organization has no objection to the employee pursuing future employment or professional opportunities.`
  );

  doc.moveDown(3);

  doc.text("Authorized By:");

  doc.moveDown();

  doc.text("HR Department");
  doc.text("BlazeUp HROS");

  doc.end();
};


export const generateExperienceRelievingLetter = (
  employee,
  offboarding,
  res
) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 60
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="experience-relieving-${employee.employeeId}.pdf"`
  );

  doc.pipe(res);

  doc.fontSize(20).text(
    "EXPERIENCE & RELIEVING LETTER",
    {
      align: "center"
    }
  );

  doc.moveDown(2);

  doc.fontSize(12).text(
    `Date: ${formatDate(new Date())}`
  );

  doc.moveDown(2);

  doc.text(
    `To Whom It May Concern,`
  );

  doc.moveDown();

  doc.text(
    `This is to certify that ${employee.name}, Employee ID ${employee.employeeId}, was employed with BlazeUp HROS as a ${employee.designation} in the ${employee.department} department.`
  );

  doc.moveDown();

  doc.text(
    `The employee has completed the required offboarding and clearance procedures and was relieved from their duties effective ${formatDate(
      offboarding.lastWorkingDay
    )}.`
  );

  doc.moveDown();

  doc.text(
    `During their employment, the employee carried out their assigned responsibilities and completed the required handover and clearance activities.`
  );

  doc.moveDown();

  doc.text(
    `We wish ${employee.name} success in all future professional endeavors.`
  );

  doc.moveDown(3);

  doc.text("Sincerely,");

  doc.moveDown();

  doc.text("HR Department");
  doc.text("BlazeUp HROS");

  doc.end();
};


const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};