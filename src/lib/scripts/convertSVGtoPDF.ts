import {jsPDF} from 'jspdf'
import html2canvas from 'html2canvas';

const A4WIDTH = 8.5;
const A4HEIGHT = 11;

export default function exportChartToPDF(vectors: HTMLDivElement[]) {
      // set in p (portrait), with data interpreted as points on a screen. Canvas size is A4
    const pdf = new jsPDF('l', 'in', 'letter')
    vectors.forEach((vector,i) =>
      html2canvas(vector, {
        logging: true,
        scale: 4
    }).then(canvas => {
        let viewHeight = canvas.height
        // offset to place an image on a new page
        let position = 0

        // image height and width
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const margin = 0.5 // half inch margin
        const contentWidth = (pageWidth - 3* margin) / 2 // width of each div
        const contentHeight = (pageHeight - margin*2) / 2 


        // set image filetype and quality
        const imgData = canvas.toDataURL('image/png')

        const row = Math.floor((i % 4) / 2) // 0 or 1
        const col = (i % 4) % 2 // 0 or 1
        const x = margin + col * (contentWidth + margin)
        const y = margin + row * (contentHeight + margin) 

        // If the total size of the canvas is less than the size of the page
        // then we insert the first image onto the page
        if(i > 0 && i % 4 === 0) {
          pdf.addPage()
        }
      pdf.addImage(imgData, 'PNG', x, y-1, contentWidth, contentHeight*1.5)
      if(vectors.length - i === 1) pdf.save("graph.pdf")
    })
  )
}
