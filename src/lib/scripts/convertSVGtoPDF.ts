import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

// Import SVG (adjust path based on your setup)
import PLACEHOLDER_IMAGE from '$lib/assets/harris_county.svg';

const LETTER_WIDTH = 8.5; // Letter size in inches (portrait)
const LETTER_HEIGHT = 11;

// Convert SVG to data URL for jsPDF
const getSvgDataUrl = async (svgUrl: string): Promise<string> => {
  try {
    // Fetch SVG content
    const response = await fetch(svgUrl);
    if (!response.ok) throw new Error(`Failed to fetch SVG: ${response.status}`);
    const svgText = await response.text();

    // Create a temporary canvas to render SVG
    const canvas = document.createElement('canvas');
    canvas.width = 48 * 2; // Match printerIcon size, scaled for quality
    canvas.height = 48 * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // Create an image from SVG
    const img = new Image();
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load SVG image'));
      img.src = url;
    });

    // Draw SVG on canvas
    console.log("CANVAS", canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    URL.revokeObjectURL(url);
    return dataUrl;
  } catch (error) {
    console.error('Error converting SVG to data URL:', error);
    throw error;
  }
};

export default async function exportChartToPDF(vectors: HTMLDivElement[], title: string) {
  const pdf = new jsPDF('p', 'in', 'letter'); // Portrait orientation
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 0.3;
  const bottomMargin = 2;
  const elementsPerPage = 2; // 2 elements per page (2x1 grid), except for the last element
  const canvasScale = 2; // Matches html2canvas scale

  // Convert SVG to data URL
  let placeholderImageDataUrl: string;
  try {
    placeholderImageDataUrl = await getSvgDataUrl(PLACEHOLDER_IMAGE);
  } catch (error) {
    console.error('Failed to load placeholder SVG, using fallback PNG');
    placeholderImageDataUrl = 'https://via.placeholder.com/30.png'; // Fallback
  }

  // Create an off-screen container for cloning elements
  const offScreenContainer = document.createElement('div');
  offScreenContainer.style.position = 'absolute';
  offScreenContainer.style.left = '-9999px';
  offScreenContainer.style.top = '-9999px';
  offScreenContainer.style.visibility = 'hidden';
  offScreenContainer.style.width = '1000px';
  offScreenContainer.style.height = '1000px';
  offScreenContainer.style.overflow = 'visible';
  document.body.appendChild(offScreenContainer);

  // Function to capture an element
  const captureElement = async (element: HTMLDivElement, index: number): Promise<{
    canvas: HTMLCanvasElement,
    linkData?: { href: string, x: number, y: number, width: number, height: number },
    printerIconData?: { x: number, y: number, width: number, height: number }
  }> => {
    try {
      // Clone the element
      const clonedElement = element.cloneNode(true) as HTMLDivElement;
      clonedElement.style.display = 'block';
      clonedElement.style.position = 'static';
      clonedElement.style.visibility = 'visible';
      const originalWidth = element.offsetWidth || 1000;
      const originalHeight = element.offsetHeight || 1000;
      clonedElement.style.width = `${originalWidth}px`;
      clonedElement.style.height = `${originalHeight}px`;
      clonedElement.style.overflow = 'visible';

      // Handle printerIcon in the first vector
      let printerIconData: { x: number, y: number, width: number, height: number } | undefined;
      if (index === 0) {
        const printerIcon = clonedElement.querySelector('#printerIcon') as HTMLElement;
        if (printerIcon) {
          printerIcon.style.display = 'block';
          printerIcon.style.width = '48px';
          printerIcon.style.height = '48px';
          printerIcon.style.fill = 'white';
          printerIcon.style.stroke = 'white';
          printerIcon.style.opacity = '0.5';
          await new Promise((resolve) => setTimeout(resolve, 100));
          const rect = printerIcon.getBoundingClientRect();
          const containerRect = clonedElement.getBoundingClientRect();
          printerIconData = {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height,
          };
          console.log('printerIcon data:', {
            ...printerIconData,
            containerRect: { left: containerRect.left, top: containerRect.top, width: containerRect.width, height: containerRect.height },
            printerIconStyles: printerIcon.style.cssText,
            clonedElementHTML: clonedElement.outerHTML.substring(0, 500)
          });
          printerIcon.style.display = 'none';
        } else {
          console.warn('printerIcon not found in first vector');
        }
      }

      // Get programLink data
      let linkData: { href: string, x: number, y: number, width: number, height: number } | undefined;
      const programLink = clonedElement.querySelector('#programLink') as HTMLAnchorElement;
      if (programLink && programLink.href) {
        programLink.style.display = 'inline-block';
        programLink.style.minWidth = '50px';
        programLink.style.minHeight = '20px';
        programLink.style.padding = '2px';
        await new Promise((resolve) => setTimeout(resolve, 50));
        const rect = programLink.getBoundingClientRect();
        const containerRect = clonedElement.getBoundingClientRect();
        linkData = {
          href: programLink.href,
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
        };
        console.log('programLink data:', { ...linkData, containerRect: { left: containerRect.left, top: containerRect.top, width: containerRect.width, height: containerRect.height } });
      }

      // Append to off-screen container
      offScreenContainer.appendChild(clonedElement);

      // Wait for rendering
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(clonedElement, {
        logging: true,
        scale: canvasScale,
        useCORS: true,
        allowTaint: false,
        width: originalWidth,
        height: originalHeight
      });

      // Remove cloned element
      offScreenContainer.removeChild(clonedElement);

      return { canvas, linkData, printerIconData };
    } catch (error) {
      console.error('Error capturing element:', element, error);
      throw error;
    }
  };

  // Layout settings
  const contentWidth = (pageWidth - 3 * margin); // Width for each element (2 per row)
  const contentHeight = (pageHeight - margin - bottomMargin); // Height for each element
  const elementsPerRow = 2; // 2 elements per row

  // Process elements sequentially
  for (let index = 0; index < vectors.length; index++) {
    const vector = vectors[index];
    const { canvas, linkData, printerIconData } = await captureElement(vector, index);

    // Force the last element onto a new page
    if (index === vectors.length - 1) {
      pdf.addPage();
    }

    // Calculate position
    const isLastElement = index === vectors.length - 1;
    const row = isLastElement ? 0 : Math.floor((index % elementsPerPage) / elementsPerRow);
    const col = isLastElement ? 0 : index % elementsPerRow;

    const x = margin + col * (contentWidth + margin);
    const y = margin + row * (contentHeight + margin);

    // Add image to PDF, preserving aspect ratio
    try {
      const imgHeight = contentHeight * (canvas.height / canvas.width);
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.9),
        'JPEG',
        x,
        y,
        contentWidth,
        imgHeight
      );

      // Add clickable link for programLink
      if (linkData && linkData.width > 0 && linkData.height > 0) {
        const pdfScale = contentWidth / canvas.width;
        const linkX = x + (linkData.x / canvasScale) * pdfScale;
        const linkY = y + (linkData.y / canvasScale) * pdfScale;
        const linkWidth = (linkData.width / canvasScale) * pdfScale;
        const linkHeight = (linkData.height / canvasScale) * pdfScale;

        console.log('PDF link coordinates:', { linkX, linkY, linkWidth, linkHeight, href: linkData.href });

        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 255);
        pdf.textWithLink(linkData.href, linkX, linkY + linkHeight, { url: linkData.href });
        pdf.setTextColor(0, 0, 0);
      } else if (linkData) {
        console.warn('Zero dimensions for programLink, using fallback position');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 255);
        pdf.textWithLink(linkData.href, x, y + imgHeight + 0.2, { url: linkData.href });
        pdf.setTextColor(0, 0, 0);
      }

      // Add new image in place of printerIcon for first vector
      if (index === 0 && printerIconData && printerIconData.width > 0 && printerIconData.height > 0) {
        const pdfScale = contentWidth / canvas.width;
        const iconX = x + (printerIconData.x / canvasScale) * pdfScale;
        const iconY = y + (printerIconData.y / canvasScale) * pdfScale;
        /*
        const iconWidth = (printerIconData.width / canvasScale) * pdfScale;
        const iconHeight = (printerIconData.height / canvasScale) * pdfScale;
        */
        const iconWidth = 48
        const iconHeight = 48

        console.log('printerIcon PDF coordinates:', { iconX, iconY, iconWidth, iconHeight });

        pdf.addImage(
          placeholderImageDataUrl,
          'PNG', // Use PNG for rendered SVG
          iconX,
          iconY,
          iconWidth,
          iconHeight
        );
      } else if (index === 0) {
        console.warn('Zero dimensions for printerIcon or not found, using fallback position');
        const iconWidth = 48 / 96; // 48px at 96 DPI
        const iconHeight = 48 / 96; // 32px at 96 DPI
        const iconX = x + contentWidth - iconWidth - 0.1; // Top-right
        const iconY = y + 0.3;
        pdf.addImage(
          placeholderImageDataUrl,
          'PNG',
          iconX,
          iconY,
          iconWidth,
          iconHeight
        );
      }
    } catch (error) {
      console.error('Error adding image or link to PDF:', error);
    }

    // Add new page for non-last elements, if needed
    if (index < vectors.length - 2 && (index + 1) % elementsPerPage === 0) {
      pdf.addPage();
    }
  }

  // Clean up off-screen container
  document.body.removeChild(offScreenContainer);

  // Save the PDF
  pdf.save('output.pdf');
}
