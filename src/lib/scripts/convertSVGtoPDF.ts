import {jsPDF} from 'jspdf'
import html2canvas from 'html2canvas';

const A4WIDTH = 8.5;
const A4HEIGHT = 11;

export default function exportChartToPDF(vectors: HTMLDivElement[], title: string) {
      // set in p (portrait), with data interpreted as points on a screen. Canvas size is A4
    const pdf = new jsPDF('l', 'in', 'letter');

    // Add the title at the top left corner
    pdf.setFont("Futura", "bold"); // Set font to Helvetica and bold style
    pdf.setFontSize(16); // Set font size for the title
    pdf.text(title, 0.5, 0.5); // Position the title at (0.5, 0.5) inches

    // Assuming vectors is an array of HTMLDivElement elements
    const processVector = async (vector: HTMLDivElement, index: number) => {
      const canvas = await html2canvas(vector, { logging: true, scale: 4 });
      const vectorData = canvas.toDataURL('image/png');

      // Calculate dimensions and positions as before
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 0.5;
      const contentWidth = (pageWidth - 3 * margin) / 2;
      const contentHeight = (pageHeight - margin * 2) / 2;

      // Determine row and column based on index
      const row = Math.floor((index % 4) / 2);
      const col = (index % 4) % 2;

      const x = margin + col * (contentWidth + margin);
      const y = margin + row * (contentHeight + margin);

      // Add the image to the PDF
      pdf.addImage(
        canvas,
        x,
        y,
        contentWidth,
        contentHeight
      );

      // Add a new page if necessary (e.g., every 4 images)
      if ((index + 1) % 4 === 0 && index !== vectors.length - 1) {
        pdf.addPage();
      }
    };

    // Create an array of promises for each vector processing
    const promises = vectors.map((vector, i) => processVector(vector, i));

    // Once all images are processed and added to the PDF, save it
    Promise.all(promises).then(() => {
      pdf.save('output.pdf');
    });
}
